import { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

// App-content screen wrapper. Device chrome (status bar area, home indicator) is
// handled by safe-area insets; we do NOT draw bezels/gesture nav (per handoff).
export function Screen({
  children,
  scroll = false,
  bg = colors.sandBg,
  padded = true,
  edges = { top: true, bottom: true },
  style,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  bg?: string;
  padded?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: edges.bottom ? insets.bottom : 0,
    paddingHorizontal: padded ? 22 : 0,
  };

  if (scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: bg }, style]}>
        <ScrollView
          contentContainerStyle={[pad, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[{ flex: 1, backgroundColor: bg }, pad, style, contentStyle]}>
      {children}
    </View>
  );
}

export const androidTopInset =
  Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0;
