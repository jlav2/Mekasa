// Manual mock for react-native-maps — a native-only library with no jest
// mock of its own. Applied automatically for every test that imports
// 'react-native-maps' (Jest convention: root-level __mocks__/<pkg>.{js,tsx}
// next to node_modules, no explicit jest.mock() call needed).
// Renders MapView/Marker as plain Views so RTL can query into their children
// and drive their event props (fireEvent.press(marker) calls marker.onPress).
// Untyped (any) props deliberately — real usage passes react-native-maps-only
// props (coordinate, anchor, tracksViewChanges, initialRegion, ...) that don't
// belong to View's own type, and this file's only job is to pass them through.
import { forwardRef } from 'react';
import { View } from 'react-native';

const MapView = forwardRef<View, any>(function MockMapView(
  { children, testID = 'mock-map-view', ...rest }: any,
  ref,
) {
  return (
    <View ref={ref} testID={testID} {...rest}>
      {children}
    </View>
  );
});

export const Marker = forwardRef<View, any>(function MockMarker(
  { children, testID = 'mock-map-marker', ...rest }: any,
  ref,
) {
  return (
    <View ref={ref} testID={testID} {...rest}>
      {children}
    </View>
  );
});

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = undefined;

export default MapView;
