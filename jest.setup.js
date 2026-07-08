// Applies to every test file (see package.json "jest.setupFiles"). Swaps the
// Supabase-facing boundary for manual mocks (src/data/__mocks__,
// src/lib/__mocks__) so store tests exercise real slice/store logic without a
// live network or DB. Live-backend behavior is verified separately by hand
// against the actual Supabase project.
jest.mock('./src/data/backend');
jest.mock('./src/lib/supabase');
