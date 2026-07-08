// Manual mock — keeps store tests hermetic regardless of whether .env vars
// happen to be present in the test process (activated in jest.setup.js).
export const isSupabaseConfigured = false;
export const supabase = null;
