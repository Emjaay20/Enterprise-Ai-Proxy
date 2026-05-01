// Supabase singleton client configuration
// Initialized with service key for bypassing RLS on telemetry logging

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials missing. Telemetry logging will fail silently.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey);
};
