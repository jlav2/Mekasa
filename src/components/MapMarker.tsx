import { memo, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { SandRing } from './SandRing';
import { PulseHalo } from './ui';
import { Txt } from './Txt';
import { Icon } from './icons';
import { colors, fonts } from '../theme';

export type MarkerState = 'live' | 'missing' | 'tournament' | 'neutral';

const stateColor: Record<MarkerState, string> = {
  live: colors.live,
  missing: colors.sunset,
  tournament: colors.petrol,
  neutral: colors.muted,
};

// Sand-ring circle marker sized by proximity/importance (44–72px).
function MapMarkerBase({
  state = 'neutral',
  size = 56,
  count,
  label,
  variant = 0,
  rotate = -30,
  style,
}: {
  state?: MarkerState;
  size?: number;
  count?: string; // e.g. "3/4"
  label?: string; // e.g. "חסר 1"
  variant?: number;
  rotate?: number;
  style?: ViewStyle;
}) {
  const color = stateColor[state];
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {state === 'live' && <PulseHalo color={color} size={size} />}
      <SandRing size={size} color={color} strokeWidth={3.5} variant={variant} rotate={rotate} fill="rgba(255,253,246,0.92)">
        <Content state={state} count={count} label={label} color={color} size={size} />
      </SandRing>
    </View>
  );
}

function Content({ state, count, label, color, size }: { state: MarkerState; count?: string; label?: string; color: string; size: number }) {
  if (state === 'tournament') {
    return <Icon name="flag" size={size * 0.4} color={color} />;
  }
  return (
    <View style={{ alignItems: 'center' }}>
      {count ? (
        <Txt style={{ fontFamily: fonts.displayBold, fontSize: size * 0.34, color: colors.ink, lineHeight: size * 0.36 }}>{count}</Txt>
      ) : null}
      {label ? (
        <Txt style={{ fontFamily: fonts.extrabold, fontSize: 9, color }}>{label}</Txt>
      ) : null}
    </View>
  );
}

// Memoized: markers re-render on every map/store update otherwise.
export const MapMarker = memo(MapMarkerBase);
