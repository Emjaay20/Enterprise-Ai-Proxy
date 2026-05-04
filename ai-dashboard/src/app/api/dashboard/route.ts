import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local (URL or Service Key)");
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

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
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!orgData) {
      return NextResponse.json({ user, org: null, apiKeys: [], logs: [] });
    }

    // 2. Fetch API Keys
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('*')
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
      apiKeys: apiKeys || [],
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
      const newKey = `sk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{ organization_id, key_value: newKey, name: 'Production Key' }])
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ apiKey: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
