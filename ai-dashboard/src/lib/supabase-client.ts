import { createClient } from '@supabase/supabase-js';

// Lazy client for browser use
let supabase: any = null;

export function getSupabaseBrowserClient() {
  if (supabase) return supabase;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
    // Return a dummy object to prevent instant crashes if env is missing during SSR
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ error: { message: 'Missing Env Vars' } }),
        signUp: async () => ({ error: { message: 'Missing Env Vars' } }),
        signOut: async () => ({}),
      }
    };
  }
  
  supabase = createClient(url, anonKey);
  return supabase;
}
