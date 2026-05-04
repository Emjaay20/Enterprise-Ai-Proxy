import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Dynamically fetch a valid API key to use for the proxy/demo requests
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!keyData?.key_value) {
      return NextResponse.json({ error: 'No active API keys available in the system for routing.' }, { status: 500 });
    }

    const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyData.key_value}`
      },
      body: JSON.stringify(body),
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
