// Manual mock for expo-location — a native-only library with no jest mock of
// its own. Applied automatically for every test that imports 'expo-location'
// (Jest convention: root-level __mocks__/<pkg>.{js,ts} next to node_modules,
// no explicit jest.mock() call needed). Defaults to "granted" so screens that
// merely check permission status render their normal (non-denied) path;
// override per-test with jest.mocked(getForegroundPermissionsAsync).

export const getForegroundPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));

export const requestForegroundPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));
