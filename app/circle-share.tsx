import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen, Txt, Button, Icon, WhatsappGlyph } from '../src/components';
import { colors, fonts } from '../src/theme';

export default function CircleShare() {
  const router = useRouter();

  return (
    <Screen scroll edges={{ top: true, bottom: true }} contentStyle={{ paddingTop: 30, flexGrow: 1 }}>
      <View style={{ flex: 1 }}>
        {/* success ring + check */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={96} height={96} viewBox="0 0 96 96" style={StyleSheet.absoluteFill}>
              <Circle
                cx={48}
                cy={48}
                r={40}
                fill="none"
                stroke={colors.live}
                strokeWidth={4}
                strokeDasharray="70 12 54 14 60 10"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.checkCircle}>
              <Svg width={30} height={24} viewBox="0 0 14 11">
                <Path
                  d="M1.5 5.5l3.5 3.5 7.5-7.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 52, color: colors.petrol, marginTop: 16 }}>
            המעגל פתוח!
          </Txt>
          <Txt style={{ fontSize: 14, color: colors.muted, marginTop: 6, lineHeight: 21.7, textAlign: 'center', maxWidth: 260 }}>
            שחקנים בסביבה כבר קיבלו התראה. עכשיו תביא את החבר'ה שלך.
          </Txt>
        </View>

        {/* share card preview */}
        <View style={{ marginTop: 24 }}>
          <Txt style={{ fontSize: 12, fontFamily: fonts.extrabold, color: colors.faint, letterSpacing: 0.5, marginBottom: 8 }}>
            ככה זה ייראה בוואטסאפ
          </Txt>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Svg width={130} height={130} viewBox="0 0 64 64" style={{ position: 'absolute', left: -36, top: -24, opacity: 0.15 }}>
                <Circle
                  cx={32}
                  cy={32}
                  r={26}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeDasharray="48 8 40 10"
                  strokeLinecap="round"
                />
              </Svg>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                <View style={styles.missingBadge}>
                  <Txt style={{ fontSize: 10.5, fontFamily: fonts.extrabold, color: '#fff' }}>חסרים 3</Txt>
                </View>
                <Txt style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>mekasa.app/c/8kq2</Txt>
              </View>
              <Txt style={{ fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: '#fff', marginTop: 8 }}>
                אלטינה · חוף גורדון · ראשון 18:00
              </Txt>
              <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>
                גיא פתח מעגל · לחץ להצטרף בשנייה
              </Txt>
            </View>
            <View style={styles.previewFooter}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={8} fill="none" stroke={colors.petrol} strokeWidth={2} strokeDasharray="18 4 14 4" strokeLinecap="round" />
                <Circle cx={12} cy={12} r={2.6} fill={colors.petrol} />
              </Svg>
              <Txt style={{ fontSize: 12, fontFamily: fonts.bold, color: colors.petrol }}>
                MeKasa · מצטרפים בלחיצה, בלי הרשמה בטלפון
              </Txt>
            </View>
          </View>
        </View>

        {/* share actions */}
        <View style={{ marginTop: 'auto', paddingTop: 24, gap: 10 }}>
          <Button
            label="שתף בוואטסאפ"
            variant="whatsapp"
            size="lg"
            icon={<WhatsappGlyph size={22} />}
            onPress={() => router.push('/map')}
          />
          <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
            <Button
              label="העתק קישור"
              variant="secondary"
              size="md"
              fontSize={14}
              icon={<Icon name="link" size={15} color={colors.petrol} strokeWidth={1.8} />}
              style={{ flex: 1 }}
            />
            <Button
              label="עוד אפשרויות"
              variant="secondary"
              size="md"
              fontSize={14}
              icon={<Icon name="share" size={15} color={colors.petrol} strokeWidth={1.8} />}
              style={{ flex: 1 }}
            />
          </View>
          <Txt
            style={{ textAlign: 'center', fontSize: 13, fontFamily: fonts.semibold, color: colors.faint, marginTop: 4 }}
            onPress={() => router.push('/map')}
          >
            דלג — אל המפה
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkCircle: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 32,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.live,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  previewHeader: {
    backgroundColor: colors.petrol,
    paddingHorizontal: 18,
    paddingVertical: 16,
    overflow: 'hidden',
  },
  missingBadge: {
    backgroundColor: colors.sunset,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  previewFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
