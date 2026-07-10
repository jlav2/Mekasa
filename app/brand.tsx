import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, Txt, Icon, HeroIconButton } from '../src/components';
import { colors, fonts, iconGradient } from '../src/theme';

// The 6d icon recipe: sunset gradient square, petrol sea wave, cream sand-ring + dot.
function AppIconGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={StyleSheet.absoluteFill}>
      <Path d="M0 88 Q30 84 60 88 T120 87 V120 H0 Z" fill={colors.petrol} />
      <Circle
        cx={60}
        cy={56}
        r={34}
        fill="none"
        stroke="#FFFDF6"
        strokeWidth={6}
        strokeDasharray="66 10 50 12 56 9"
        strokeLinecap="round"
      />
      <Circle cx={60} cy={56} r={10} fill="#FFFDF6" />
    </Svg>
  );
}

function AppIcon({ size, radius }: { size: number; radius: number }) {
  return (
    <LinearGradient
      colors={iconGradient as any}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}
    >
      <AppIconGlyph size={size} />
    </LinearGradient>
  );
}

function LoadingDots() {
  return (
    <View style={styles.dotsRow}>
      <View style={[styles.dot, { opacity: 0.9 }]} />
      <View style={[styles.dot, { opacity: 0.45 }]} />
      <View style={[styles.dot, { opacity: 0.45 }]} />
    </View>
  );
}

function SplashPreview() {
  return (
    <View style={styles.splashFrame}>
      <LinearGradient
        colors={['#FFC46B', '#FF9D52', '#F0862F', colors.petrol, colors.petrolDeep]}
        locations={[0, 0.34, 0.62, 0.622, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.splashContent}>
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
          />
          <Circle cx={80} cy={80} r={16} fill="#FFFDF6" />
        </Svg>
        <Txt style={styles.wordmark}>מקאסה</Txt>
        <Txt style={styles.tagline}>המעגל הבא שלך כבר על החול</Txt>
      </View>
      <View style={styles.dotsWrap}>
        <LoadingDots />
      </View>
    </View>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.tileCol}>
      {children}
      <Txt style={styles.tileLabel}>{label}</Txt>
    </View>
  );
}

export default function Brand() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Screen scroll bg={colors.sandBg}>
      <View style={styles.header}>
        <HeroIconButton variant="card" onPress={() => router.back()}>
          <Icon name="chevronRight" size={18} color={colors.ink} strokeWidth={2.2} />
        </HeroIconButton>
        <Txt style={styles.headerTitle}>אייקון אפליקציה + Splash</Txt>
      </View>

      {/* icon board */}
      <View style={styles.iconBoard}>
        <Tile label="iOS · 120pt">
          <AppIcon size={120} radius={27} />
        </Tile>
        <View style={{ gap: 14, flex: 1 }}>
          <View style={styles.iconRow}>
            <AppIcon size={56} radius={13} />
            <Txt style={styles.iconRowLabel}>מסך הבית</Txt>
          </View>
          <View style={styles.iconRow}>
            <AppIcon size={56} radius={28} />
            <Txt style={styles.iconRowLabel}>Android · adaptive</Txt>
          </View>
        </View>
      </View>

      <Txt style={styles.sectionLabel}>מסך פתיחה (Splash)</Txt>
      <SplashPreview />

      <View style={{ height: 30 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  iconBoard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 28,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    padding: 20,
  },
  tileCol: { alignItems: 'center', gap: 10 },
  tileLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.muted },
  iconRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  iconRowLabel: { fontSize: 11, fontFamily: fonts.semibold, color: colors.faint },
  sectionLabel: { fontFamily: fonts.extrabold, fontSize: 12, color: colors.faint, letterSpacing: 0.5, marginTop: 28, marginBottom: 10, paddingRight: 4 },
  splashFrame: {
    height: 480,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  wordmark: {
    fontFamily: fonts.displayBold,
    fontSize: 72,
    lineHeight: 72,
    color: '#FFFDF6',
    marginTop: 22,
    textShadowColor: 'rgba(9,58,70,.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: { fontSize: 14, fontFamily: fonts.semibold, color: 'rgba(255,253,246,.85)', marginTop: 6, letterSpacing: 0.3 },
  dotsWrap: { position: 'absolute', bottom: 70, alignSelf: 'center' },
  dotsRow: { flexDirection: 'row', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFDF6' },
});
