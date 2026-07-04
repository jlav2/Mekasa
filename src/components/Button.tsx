import { ReactNode } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Txt } from './Txt';
import { colors, fonts, shadows } from '../theme';

type Variant =
  | 'primary' // sunset fill + glow — THE cta
  | 'live' // teal fill
  | 'petrol'
  | 'secondary' // outlined
  | 'tonal' // soft petrol fill
  | 'whatsapp'
  | 'ghost'
  | 'danger';

const fills: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.sunset },
  live: { backgroundColor: colors.live },
  petrol: { backgroundColor: colors.petrol },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.outline,
  },
  tonal: { backgroundColor: 'rgba(14,79,94,0.1)' },
  whatsapp: { backgroundColor: colors.whatsapp },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.4)',
  },
};

const textColors: Record<Variant, string> = {
  primary: colors.white,
  live: colors.white,
  petrol: colors.white,
  secondary: colors.petrol,
  tonal: colors.petrol,
  whatsapp: colors.white,
  ghost: colors.petrol,
  danger: colors.danger,
};

const heights = { lg: 56, md: 50, sm: 40 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  loading,
  disabled,
  full = true,
  style,
  fontSize,
}: {
  label?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: keyof typeof heights;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
  fontSize?: number;
}) {
  const h = heights[size];
  const glow = variant === 'primary' ? shadows.cta : undefined;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { height: h, borderRadius: h / 2, opacity: disabled ? 0.5 : 1 },
        full && { alignSelf: 'stretch' },
        fills[variant],
        glow,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <View style={styles.row}>
          {icon}
          {label ? (
            <Txt
              style={{
                fontFamily: fonts.extrabold,
                fontSize: fontSize ?? (size === 'sm' ? 14 : 16),
                color: textColors[variant],
              }}
            >
              {label}
            </Txt>
          ) : null}
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
});
