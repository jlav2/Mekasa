import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Txt } from './Txt';
import { colors, fonts } from '../theme';

// Startup / loading splash — the animated runtime version of design 9-6d
// ("אייקון וספלאש"). The native expo-splash-screen shows a static PNG of the
// ring mark on orange for the very first frame; this JS splash takes over
// while fonts load and the initial session check runs, adding the wordmark,
// the sunset→petrol horizon gradient, and the pulsing loading dots that a
// static image can't render.

// liveDot pulse — matches the design's keyframe (opacity 1 → .35 → 1).
const dotPulse = {
  '0%': { opacity: 1 },
  '50%': { opacity: 0.35 },
  '100%': { opacity: 1 },
};

function PulseDot({ delay }: { delay: number }) {
  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFDF6',
        animationName: dotPulse,
        animationDuration: '1200ms',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

export function BrandSplash() {
  return (
    <LinearGradient
      // sunset → hard "sea horizon" break at 62% → petrol deep (design 9-6d)
      colors={['#FFC46B', '#FF9D52', '#F0862F', '#0E4F5E', '#093A46']}
      locations={[0, 0.34, 0.62, 0.622, 1]}
      style={styles.fill}
    >
      <View style={styles.center}>
        {/* sand-ring logo mark */}
        <View style={styles.ring}>
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Circle
              cx={80}
              cy={80}
              r={58}
              fill="none"
              stroke="#FFFDF6"
              strokeWidth={7}
              strokeDasharray="112 17 86 20 96 15"
              strokeLinecap="round"
              transform="rotate(-25 80 80)"
            />
            <Circle cx={80} cy={80} r={16} fill="#FFFDF6" />
          </Svg>
        </View>

        <Txt style={styles.wordmark}>מקאסה</Txt>
        <Txt style={styles.tagline}>המעגל הבא שלך כבר על החול</Txt>
      </View>

      <View style={styles.dots}>
        <PulseDot delay={0} />
        <PulseDot delay={200} />
        <PulseDot delay={400} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 160, height: 160, marginTop: -90 },
  wordmark: {
    fontFamily: fonts.displayBold,
    fontSize: 72,
    lineHeight: 72,
    color: '#FFFDF6',
    marginTop: 26,
    textShadowColor: 'rgba(9,58,70,.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: 'rgba(255,253,246,.85)',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  dots: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
});
