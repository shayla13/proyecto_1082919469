import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
