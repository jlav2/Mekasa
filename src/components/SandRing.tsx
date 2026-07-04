import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

// The signature hand-drawn sand circle. Vary dashArray + rotation per instance
// so no two look identical.
const DASH_PRESETS = [
  '52 7 38 9 44 6',
  '48 8 40 10 42 7',
  '60 9 50 8',
  '70 12 54 14 60 10',
  '66 10 50 12 56 9',
];

export function SandRing({
  size = 64,
  color = colors.petrol,
  strokeWidth = 3.5,
  variant = 0,
  rotate = -30,
  fill = 'none',
  style,
  children,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
  variant?: number;
  rotate?: number;
  fill?: string;
  style?: any;
  children?: ReactNode;
}) {
  // scale the recipe (authored for a 64px box, r=26) to any size
  const s = size / 64;
  const cx = size / 2;
  const r = 26 * s;
  const dash = DASH_PRESETS[variant % DASH_PRESETS.length]
    .split(' ')
    .map((n) => (parseFloat(n) * s).toFixed(1))
    .join(' ');
  return (
    <View style={[{ width: size, height: size }, styles.center, style]}>
      {/* rotate the outer View (works on web + native) rather than the SVG element,
          which avoids react-native-svg-web's transform-origin DOM warning */}
      <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${rotate}deg` }] }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dash}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
