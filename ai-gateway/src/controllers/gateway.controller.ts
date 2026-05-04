// src/controllers/gateway.controller.ts
import { Request, Response } from 'express';
import { GatewayRequest, TelemetryPayload } from '../types';
import { supabase } from '../config/supabase';
import { randomUUID, createHash } from 'crypto';

/**
 * Hashes an incoming raw API key using SHA-256 so we can
 * compare it against the stored hash in the database.
 * The plain-text key is never stored or logged.
 */
function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

// Dynamically import the local embedding model
let pipeline: any;
const embeddingModelReady = (async () => {
    const transformers = await import('@xenova/transformers');
    // Using a fast, lightweight embedding model that outputs 384 dimensions
    pipeline = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('🧠 Local Embedding Engine Initialized');
})();

type MatchPromptRow = {
  similarity: number;
  response: unknown;
};

type UpstreamErrorResponse = {
  error?: {
    message?: string;
  };
};

export const handleLLMRequest = async (req: Request, res: Response): Promise<void> => {
  const startTime = performance.now();
  const requestId = randomUUID();
  const payload: GatewayRequest = req.body;

  console.log(`[${requestId}] /v1/chat/completions received for model=${payload?.model || 'unknown'}`);

  try {
    if (!payload.messages || !payload.model || !payload.user_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 0. Extract and validate API Key from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[${requestId}] Missing or invalid Authorization header`);
      res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
      return;
    }

    const apiKey = authHeader.split(' ')[1];

    // Guard: ensure the token is actually present after "Bearer "
    if (!apiKey) {
      res.status(401).json({ error: 'Unauthorized: Malformed Authorization header' });
      return;
    }

    // Hash the incoming raw key — we compare hashes, never plain-text keys
    const hashedKey = hashApiKey(apiKey);

    // Validate the hashed key against Supabase
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('organization_id')
      .eq('key_value', hashedKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      console.error(`[${requestId}] Invalid or inactive API Key attempted`);
      res.status(401).json({ error: "Unauthorized: Invalid or inactive API Key" });
      return;
    }

    const organizationId = keyData.organization_id;
    console.log(`[${requestId}] ✓ API Key validated for organization: ${organizationId}`);

    await embeddingModelReady;

    // 1. Extract the actual prompt string from the messages array
    const userPrompt = payload.messages.map(m => m.content).join(' ');

    // 2. Generate the Vector Embedding locally
    const output = await pipeline(userPrompt, { pooling: 'mean', normalize: true });
    const embeddingArray = Array.from(output.data as ArrayLike<number>);

    // 3. Check Supabase for Semantic Cache Hit (Threshold: 95% similarity)
    console.log(`[${requestId}] cache lookup started`);
    const { data: cacheHits, error: cacheError } = await supabase.rpc('match_prompt', {
      query_embedding: embeddingArray,
      match_threshold: 0.95,
      match_count: 1
    });

    if (cacheError) {
      console.error('Cache lookup failed:', cacheError);
    }

    const typedCacheHits = cacheHits as MatchPromptRow[] | null;

    if (typedCacheHits && typedCacheHits.length > 0) {
      const cacheHit = typedCacheHits[0];
      if (!cacheHit) {
        res.status(500).json({ error: 'Internal Gateway Error', details: 'Cache hit row missing' });
        return;
      }

      console.log(`🎯 Cache Hit! Similarity: ${cacheHit.similarity.toFixed(3)}`);

      const latency = Math.round(performance.now() - startTime);
      const cachedResponse = cacheHit.response as Record<string, unknown>;

      // Log telemetry indicating a CACHED response
      void supabase.from('telemetry_logs').insert([{
        request_id: requestId,
        organization_id: organizationId,
        user_id: payload.user_id,
        model: 'CACHE_HIT_' + payload.model,
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms: latency,
        status: 'success',
        eval_context: payload.eval_context || null,
        timestamp: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.error('Telemetry insert failed:', error);
      });

      res.status(200).json({
        id: requestId,
        cached: true,
        ...cachedResponse
      });
      return;
    }

    console.log('⏳ Cache Miss. Forwarding to Groq...');

    // 4. If no cache match, fetch from Groq
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: payload.model,
        messages: payload.messages,
      })
    });

    const llmData: UpstreamErrorResponse & Record<string, unknown> = await aiResponse.json();
    const latency = Math.round(performance.now() - startTime);

    if (!aiResponse.ok) {
      throw new Error(llmData.error?.message || 'Upstream Groq Error');
    }

    // 5. Save the new response and embedding to the Supabase Cache
    void supabase.from('semantic_cache').insert([{
      prompt: userPrompt,
      response: llmData,
      embedding: embeddingArray
    }]).then(({ error }) => {
      if (error) console.error('Cache insertion failed:', error);
    });

    // 6. Log Standard Telemetry
    void supabase.from('telemetry_logs').insert([{
      request_id: requestId,
      organization_id: organizationId,
      user_id: payload.user_id,
      model: payload.model,
      prompt_tokens: (llmData as { usage?: { prompt_tokens?: number } }).usage?.prompt_tokens || 0,
      completion_tokens: (llmData as { usage?: { completion_tokens?: number } }).usage?.completion_tokens || 0,
      latency_ms: latency,
      status: 'success',
      eval_context: payload.eval_context || null,
      timestamp: new Date().toISOString()
    }]).then(({ error }) => {
      if (error) console.error('Telemetry insert failed:', error);
    });

    // 7. Return to user
    res.status(200).json({
      id: requestId,
      cached: false,
      ...llmData
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Gateway Error';
    res.status(500).json({ error: 'Internal Gateway Error', details: message });
  }
};
