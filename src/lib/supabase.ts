// Supabase client — configured via EXPO_PUBLIC_ env vars (see .env.example).
// When unconfigured, the app runs fully offline on the fixture data.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage, // localStorage-backed on web
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // no OAuth redirects yet
      },
    })
  : null;
