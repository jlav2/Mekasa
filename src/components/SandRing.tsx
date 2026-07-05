import { memo, ReactNode } from 'react';
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

function SandRingBase({
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

// Memoized: primitive props, so unrelated re-renders skip the whole ring tree.
// (Memo only helps call sites without children — decor rings, badges, markers.)
export const SandRing = memo(SandRingBase);

// Faded oversized ring, absolutely positioned as hero/card decoration.
// Callers pass position offsets via `style` ({ left: -70, top: -40 }).
function DecorRingBase({
  size = 240,
  color = '#fff',
  opacity = 0.14,
  variant = 1,
  rotate = 0,
  strokeWidth = 2,
  style,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  variant?: number;
  rotate?: number;
  strokeWidth?: number;
  style?: any;
}) {
  return (
    <SandRing
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      variant={variant}
      rotate={rotate}
      style={[{ position: 'absolute', opacity }, style]}
    />
  );
}

// Call sites pass inline style literals ({ left: -70, top: -40 }) whose identity
// changes every render — compare style by contents so the memo actually holds.
export const DecorRing = memo(DecorRingBase, (prev, next) => {
  if (
    prev.size !== next.size ||
    prev.color !== next.color ||
    prev.opacity !== next.opacity ||
    prev.variant !== next.variant ||
    prev.rotate !== next.rotate ||
    prev.strokeWidth !== next.strokeWidth
  ) {
    return false;
  }
  return prev.style === next.style || JSON.stringify(prev.style) === JSON.stringify(next.style);
});

// Sand ring around a solid center disc — the count/glyph badge used in
// notifications, list rows and chat headers.
export function RingBadge({
  size = 48,
  color = colors.sunset,
  centerBg,
  variant = 1,
  rotate = 0,
  strokeWidth = 4,
  inset = 9,
  style,
  children,
}: {
  size?: number;
  color?: string;
  centerBg?: string;
  variant?: number;
  rotate?: number;
  strokeWidth?: number;
  inset?: number;
  style?: any;
  children?: ReactNode;
}) {
  const inner = size - inset * 2;
  return (
    <SandRing size={size} color={color} strokeWidth={strokeWidth} variant={variant} rotate={rotate} style={style}>
      <View
        style={[
          styles.center,
          { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: centerBg ?? color },
        ]}
      >
        {children}
      </View>
    </SandRing>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
