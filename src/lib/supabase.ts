// Supabase client — configured via EXPO_PUBLIC_ env vars (see .env.example).
// When unconfigured, the app runs fully offline on the fixture data.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: false }, // no auth yet — anon demo access
    })
  : null;
