// Supabase client — configured via EXPO_PUBLIC_ env vars (see .env.example).
// When unconfigured, the app runs fully offline on the fixture data.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: AsyncStorage, // localStorage-backed on web
        persistSession: true,
        autoRefreshToken: true,
        // Web: parse the OAuth redirect hash automatically. Native: we exchange
        // the PKCE code manually after the WebBrowser session returns.
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce',
      },
    })
  : null;
