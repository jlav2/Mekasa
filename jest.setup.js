// Applies to every test file (see package.json "jest.setupFiles"). Swaps the
// Supabase-facing boundary for manual mocks (src/data/__mocks__,
// src/lib/__mocks__) so store tests exercise real slice/store logic without a
// live network or DB. Live-backend behavior is verified separately by hand
// against the actual Supabase project.
jest.mock('./src/data/backend');
jest.mock('./src/lib/supabase');

// Official library mock: useSafeAreaInsets/useSafeAreaFrame fall back to zero
// insets/a default frame without needing a real <SafeAreaProvider> ancestor —
// exactly what a standalone screen unit test needs.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Reanimated 4 split its native module out into react-native-worklets.
// react-native-reanimated/mock (used below) still transitively requires the
// REAL react-native-worklets native module unless it's mocked first — without
// this, any reanimated import throws inside Jest ("Cannot read properties of
// undefined (reading 'loadUnpackers')"). Must be registered before the
// reanimated mock is (lazily) required.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// expo-router's own testing-library entry applies its official jest mocks as
// an import side effect: react-native-gesture-handler/jestSetup, the
// react-native-reanimated mock, and an expo-linking mock — the same setup
// component/screen tests need, kept current with the expo-router version
// itself instead of hand-duplicated. react-native-maps has no such official
// mock; see __mocks__/react-native-maps.tsx (applied automatically).
require('expo-router/testing-library');

// The reanimated mock (applied just above) deliberately omits useReducedMotion
// ("ADD ME IF NEEDED" in its source). src/theme/motion.ts's usePressScale calls
// it, so patch it onto the already-mocked module — default to motion-enabled.
const Reanimated = require('react-native-reanimated');
if (typeof Reanimated.useReducedMotion !== 'function') {
  Reanimated.useReducedMotion = () => false;
}
