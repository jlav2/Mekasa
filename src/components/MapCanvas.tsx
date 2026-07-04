import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Path,
  Line,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { colors } from '../theme';

// Stylized SVG map placeholder — sea (west/left) → sand strip → land grid.
// Replace with a real map provider styled to this palette in production.
export function MapCanvas({
  style,
  dim = false,
  children,
}: {
  style?: ViewStyle;
  dim?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="sea" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.sea1} />
            <Stop offset="1" stopColor={colors.sea2} />
          </SvgGradient>
        </Defs>
        {/* land base */}
        <Rect x="0" y="0" width="400" height="800" fill={colors.sandMap} />
        {/* sea on the west (left) */}
        <Path d="M0 0 H150 Q120 220 150 420 Q125 620 150 800 H0 Z" fill="url(#sea)" />
        {/* sand strip along the coast */}
        <Path
          d="M150 0 Q120 220 150 420 Q125 620 150 800 L182 800 Q152 620 178 420 Q150 220 182 0 Z"
          fill={colors.sandStrip}
        />
        {/* street grid on land */}
        <G stroke={colors.roads} strokeWidth={7} opacity={0.9}>
          <Line x1="230" y1="0" x2="230" y2="800" />
          <Line x1="300" y1="0" x2="300" y2="800" />
          <Line x1="360" y1="0" x2="360" y2="800" />
          <Line x1="182" y1="150" x2="400" y2="150" />
          <Line x1="182" y1="330" x2="400" y2="330" />
          <Line x1="182" y1="500" x2="400" y2="500" />
          <Line x1="182" y1="660" x2="400" y2="660" />
        </G>
        {/* blocks */}
        <G fill={colors.blocks}>
          <Rect x="240" y="165" width="50" height="150" rx="4" />
          <Rect x="312" y="165" width="38" height="150" rx="4" />
          <Rect x="240" y="345" width="50" height="140" rx="4" />
          <Rect x="312" y="515" width="38" height="130" rx="4" />
        </G>
        {/* park */}
        <Rect x="240" y="515" width="50" height="130" rx="10" fill={colors.park} />
        {/* beach labels */}
        <SvgText x="165" y="120" fill="#8A9282" fontSize="11" fontWeight="600" textAnchor="middle" transform="rotate(-88 165 120)">
          חוף פרישמן
        </SvgText>
        <SvgText x="168" y="440" fill="#8A9282" fontSize="11" fontWeight="600" textAnchor="middle" transform="rotate(-88 168 440)">
          חוף גורדון
        </SvgText>
      </Svg>
      {dim && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247,239,222,0.45)' }]} />}
      {children}
    </View>
  );
}
