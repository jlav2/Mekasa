import { Text, TextProps, StyleSheet, I18nManager } from 'react-native';
import { colors, fonts } from '../theme';

type Variant =
  | 'display' // Karantina bold — headlines/wordmark
  | 'displayLight'
  | 'title' // card titles
  | 'body'
  | 'bodyStrong'
  | 'secondary'
  | 'label' // small bold labels/badges
  | 'button';

const base: Record<Variant, object> = {
  display: { fontFamily: fonts.displayBold, color: colors.ink, lineHeight: undefined },
  displayLight: { fontFamily: fonts.displayLight, color: colors.ink },
  title: { fontFamily: fonts.displayBold, color: colors.ink, fontSize: 30 },
  body: { fontFamily: fonts.body, color: colors.ink, fontSize: 14.5, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.bold, color: colors.ink, fontSize: 14 },
  secondary: { fontFamily: fonts.medium, color: colors.muted, fontSize: 12.5 },
  label: { fontFamily: fonts.extrabold, color: colors.faint, fontSize: 11 },
  button: { fontFamily: fonts.extrabold, color: colors.white, fontSize: 16 },
};

export function Txt({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  return (
    <Text
      {...rest}
      style={[styles.rtl, base[variant], style]}
      allowFontScaling={false}
    />
  );
}

const styles = StyleSheet.create({
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
