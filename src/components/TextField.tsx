import { forwardRef } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { Txt } from './Txt';
import { colors, fonts } from '../theme';

// Shared RTL text field for the auth forms (login / signup / forgot / reset).
// Renders an optional label+hint row above a bordered input container. Pass
// `pill` for the rounded login style, or `containerStyle` to tweak per-screen.
type Props = TextInputProps & {
  label?: string;
  hint?: string;
  hintColor?: string;
  pill?: boolean;
  containerStyle?: ViewStyle;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, hint, hintColor, pill, containerStyle, style, ...rest },
  ref,
) {
  return (
    <View>
      {label || hint ? (
        <View style={styles.labelRow}>
          {label ? <Txt style={styles.label}>{label}</Txt> : <View />}
          {hint ? <Txt style={[styles.hint, hintColor ? { color: hintColor } : null]}>{hint}</Txt> : null}
        </View>
      ) : null}
      <View style={[styles.wrap, pill && styles.wrapPill, containerStyle]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.faint}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: 13, fontFamily: fonts.extrabold, color: colors.ink },
  hint: { fontSize: 12, fontFamily: fonts.bold, color: colors.live },
  wrap: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  wrapPill: { borderRadius: 27, paddingHorizontal: 20 },
  input: { fontSize: 15, color: colors.ink, fontFamily: fonts.body, textAlign: 'right', writingDirection: 'rtl' },
});
