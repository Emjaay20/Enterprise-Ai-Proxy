import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';
// The DEMO_API_KEY is a plain-text key whose SHA-256 hash is stored in the DB under is_active=true.
// This allows the public playground to make authenticated gateway requests without exposing any user keys.
const DEMO_API_KEY = process.env.DEMO_API_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Basic in-memory rate limiting store to prevent abuse of the public proxy
const rateLimitStore = new Map<string, { count: number; lastReq: number }>();
const MAX_REQUESTS_PER_IP = 20; // 20 total demo requests allowed per IP
const MIN_DELAY_MS = 3000; // 3 second cooldown between requests

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting Check
    // This provides a basic shield against automated scripts spamming the demo endpoint.
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    if (ip !== 'unknown') {
      const record = rateLimitStore.get(ip) || { count: 0, lastReq: 0 };
      if (record.count >= MAX_REQUESTS_PER_IP) {
        return NextResponse.json({ error: 'Demo limit reached. Please sign up to generate your own API key.' }, { status: 429 });
      }
      if (now - record.lastReq < MIN_DELAY_MS) {
        return NextResponse.json({ error: 'Please wait a few seconds before trying again.' }, { status: 429 });
      }
      rateLimitStore.set(ip, { count: record.count + 1, lastReq: now });
    }

    const body = await request.json();

    // 2. Strict Input Sanitization
    // We do not trust the frontend payload. We extract only the user message and truncate it.
    const userMessage = body.messages?.find((m: any) => m.role === 'user');
    if (!userMessage || typeof userMessage.content !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt format' }, { status: 400 });
    }

    // Hard cap the prompt length at 150 characters so attackers cannot abuse large context windows
    const sanitizedPrompt = userMessage.content.slice(0, 150);

    // 3. Payload Override
    // We construct an entirely new, safe payload. Attackers cannot change the model or inject parameters.
    const safeBody = {
      user_id: 'public_demo_user',
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: sanitizedPrompt }],
      eval_context: { environment: 'demo', expected_task: 'landing_page_demo' },
      max_tokens: 60, // Hard cap generation output to ~60 tokens to keep Groq costs near zero
    };

    // 4. Use the dedicated demo API key from environment variables.
    // This key's SHA-256 hash is pre-stored in the Supabase api_keys table.
    // We never look up or expose any user's key here.
    if (!DEMO_API_KEY) {
      return NextResponse.json({ error: 'Demo service is not configured. Please contact support.' }, { status: 503 });
    }

    // 5. Forward safe request to Gateway using the dedicated demo key
    const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEMO_API_KEY}`
      },
      body: JSON.stringify(safeBody),
    });

    const text = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';

    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': contentType }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Proxy error' }, { status: 500 });
  }
}
