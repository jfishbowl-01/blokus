import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Missing Supabase environment variables. Check .env.');
}

const resolvedUrl = supabaseUrl || 'http://localhost:54321';
const resolvedKey = supabaseAnonKey || 'public-anon-key';

export const supabase = createClient(resolvedUrl, resolvedKey);
