import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local (URL or Service Key)");
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

/**
 * Hashes a raw API key string using SHA-256.
 * Only the hash is ever persisted to the database.
 */
function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Organization
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!orgData) {
      return NextResponse.json({ user, org: null, apiKeys: [], logs: [] });
    }

    // 2. Fetch API Keys - We return a masked preview (NOT the hash, NOT the plaintext)
    const { data: apiKeysRaw } = await supabase
      .from('api_keys')
      .select('id, name, created_at, is_active, key_hint')
      .eq('organization_id', orgData.id);

    // 3. Fetch Telemetry Logs
    const { data: logs } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('organization_id', orgData.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      user,
      org: orgData,
      apiKeys: apiKeysRaw || [],
      logs: logs || []
    });
  } catch (error: any) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_org') {
      const { name } = body;
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ org: data });
    }

    if (action === 'generate_key') {
      const { organization_id } = body;

      // 1. Generate a cryptographically secure random key using crypto.randomBytes
      const rawKey = `aether_sk_${randomBytes(24).toString('hex')}`;

      // 2. Create a SHA-256 hash of the raw key — this is what we store in the DB
      const hashedKey = hashApiKey(rawKey);

      // 3. Create a safe "hint" to show in the dashboard (e.g. "aether_sk_ab12...****")
      const keyHint = rawKey.substring(0, 18) + '••••••••••••';

      // 4. Insert ONLY the hash and the hint into the database — never the raw key
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{ 
          organization_id, 
          key_value: hashedKey, // Store the hash, never plaintext
          key_hint: keyHint,    // Store a masked preview for the UI
          name: 'Production Key',
          is_active: true
        }])
        .select('id, name, created_at, is_active, key_hint')
        .single();
        
      if (error) throw error;

      // 5. Return the RAW key to the frontend exactly once — it will never be accessible again
      return NextResponse.json({ 
        apiKey: data,
        rawKey, // ONE-TIME REVEAL: The frontend must show a "Copy Now" warning
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
