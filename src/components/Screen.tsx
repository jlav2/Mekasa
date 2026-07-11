import { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  ViewStyle,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { PullToRefresh } from './PullToRefresh';

// App-content screen wrapper. Device chrome (status bar area, home indicator) is
// handled by safe-area insets; we do NOT draw bezels/gesture nav (per handoff).
export function Screen({
  children,
  scroll = false,
  bg = colors.sandBg,
  padded = true,
  edges = { top: true, bottom: true },
  keyboardAvoiding = false,
  onRefresh,
  style,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  bg?: string;
  padded?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
  keyboardAvoiding?: boolean; // lift content above the on-screen keyboard (forms)
  onRefresh?: () => void | Promise<void>; // scroll screens: enables pull-to-refresh (spec 08)
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: edges.bottom ? insets.bottom : 0,
    paddingHorizontal: padded ? 22 : 0,
  };
  // No-op on web (RNW renders it as a plain View); real behavior on iOS/Android.
  const kav = (node: ReactNode) =>
    keyboardAvoiding ? (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {node}
      </KeyboardAvoidingView>
    ) : (
      node
    );

  if (scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: bg }, style]}>
        {kav(
          onRefresh ? (
            <PullToRefresh onRefresh={onRefresh} contentContainerStyle={[pad, contentStyle]}>
              {children}
            </PullToRefresh>
          ) : (
            <ScrollView
              contentContainerStyle={[pad, contentStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ),
        )}
      </View>
    );
  }
  return kav(
    <View style={[{ flex: 1, backgroundColor: bg }, pad, style, contentStyle]}>
      {children}
    </View>,
  );
}

export const androidTopInset =
  Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0;
