import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { Screen, Txt, SegmentedControl, AvatarStack, TabBar, ProBadge } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

export default function Recurring() {
  const router = useRouter();
  const [segment, setSegment] = useState(1);
  const [rsvp, setRsvp] = useState<'in' | 'out'>('in');

  const onSegment = (i: number) => {
    setSegment(i);
    if (i === 0) router.push('/my-circles');
    if (i === 2) router.push('/history');
  };

  return (
    <Screen scroll contentStyle={{ paddingBottom: 120 }}>
      <Txt style={{ fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 56, color: colors.petrol, marginTop: 8 }}>
        המעגלים שלי
      </Txt>
      <SegmentedControl options={['קרובים', 'קבועים', 'היסטוריה']} value={segment} onChange={onSegment} style={{ marginTop: 14 }} />

      <View style={{ gap: 10, marginTop: 16 }}>
        {/* active recurring hero */}
        <View style={styles.hero}>
          <Svg width={190} height={190} viewBox="0 0 64 64" style={styles.heroDeco}>
            <Circle cx={32} cy={32} r={26} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="48 8 40 10 42 7" strokeLinecap="round" />
          </Svg>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <View style={styles.timePill}>
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" fill="none" stroke="#FFD9A0" strokeWidth={2.4} strokeLinecap="round" />
                <Path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke="#FFD9A0" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Txt style={{ fontSize: 11.5, fontFamily: fonts.bold, color: colors.sandGlow }}>כל שלישי · 18:30</Txt>
            </View>
            <Txt style={{ marginRight: 'auto', fontSize: 12, fontFamily: fonts.bold, color: colors.liveBright }}>הבא: בעוד יומיים</Txt>
          </View>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 36, color: '#fff', marginTop: 10 }}>
            הקבוע של שלישי · פרישמן
          </Txt>
          <Txt style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>
            פוצ'יוולי · בינוניים · מגרש 2 · נפתח אוטומטית ב־16:00
          </Txt>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <AvatarStack
              people={[
                { letter: 'ג', color: colors.sunset },
                { letter: 'ד', color: colors.live },
                { letter: 'נ', color: colors.amber },
              ]}
              size={32}
              border={colors.petrol}
              emptySlot
              emptyLabel="+2"
              emptyBorder="rgba(255,255,255,.16)"
            />
            <Txt style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)' }}>5 קבועים · אישרו 3</Txt>
          </View>
          <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 14 }}>
            <Pressable
              onPress={() => setRsvp('in')}
              style={[styles.rsvpBtn, { backgroundColor: rsvp === 'in' ? colors.live : 'rgba(255,255,255,.14)' }, rsvp === 'in' && styles.rsvpGlow]}
            >
              <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: '#fff' }}>מגיע ✓</Txt>
            </Pressable>
            <Pressable onPress={() => setRsvp('out')} style={styles.rsvpOut}>
              <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: '#fff' }}>הפעם לא</Txt>
            </Pressable>
          </View>
        </View>

        {/* active recurring row 2 */}
        <View style={styles.row}>
          <View style={{ width: 48, height: 48 }}>
            <Svg width={48} height={48} viewBox="0 0 64 64" style={{ position: 'absolute' }}>
              <Circle
                cx={32}
                cy={32}
                r={26}
                fill="none"
                stroke={colors.live}
                strokeWidth={4}
                strokeDasharray="52 7 38 9 44 6"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.recurIconWrap}>
              <Svg width={18} height={18} viewBox="0 0 32 32">
                <Circle cx={16} cy={16} r={11} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="8 5" strokeLinecap="round" />
                <Circle cx={16} cy={8} r={2} fill="#fff" />
                <Circle cx={23.5} cy={13.5} r={2} fill="#fff" />
                <Circle cx={20.5} cy={22.5} r={2} fill="#fff" />
                <Circle cx={11.5} cy={22.5} r={2} fill="#fff" />
                <Circle cx={8.5} cy={13.5} r={2} fill="#fff" />
              </Svg>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.rowTitle}>שישי בוקר · אלטינה בגורדון</Txt>
            <Txt style={styles.rowMeta}>כל שישי 8:00 · 7 קבועים · אתה משתתף</Txt>
          </View>
          <View style={styles.activeBadge}>
            <Txt style={{ fontSize: 11.5, fontFamily: fonts.extrabold, color: colors.liveDeep }}>פעיל</Txt>
          </View>
        </View>

        {/* paused recurring */}
        <View style={[styles.row, { opacity: 0.65 }]}>
          <View style={styles.pausedIconWrap}>
            <Svg width={18} height={18} viewBox="0 0 20 20">
              <Line x1={6} y1={4} x2={6} y2={16} stroke={colors.muted} strokeWidth={2.6} strokeLinecap="round" />
              <Line x1={14} y1={4} x2={14} y2={16} stroke={colors.muted} strokeWidth={2.6} strokeLinecap="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={styles.rowTitle}>ראשון ערב · כדורעף במצודה</Txt>
            <Txt style={styles.rowMeta}>מושהה עד ספטמבר · 6 קבועים</Txt>
          </View>
          <Txt style={{ fontSize: 13, fontFamily: fonts.bold, color: colors.petrol }}>חדש</Txt>
        </View>

        {/* new recurring CTA */}
        <Pressable style={styles.ctaCard}>
          <View style={styles.ctaIcon}>
            <Svg width={18} height={18} viewBox="0 0 18 18">
              <Line x1={9} y1={2} x2={9} y2={16} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
              <Line x1={2} y1={9} x2={16} y2={9} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 14, fontFamily: fonts.extrabold, color: colors.ink }}>פתח מעגל קבוע חדש</Txt>
            <Txt style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>יום, שעה וחוף — והוא ייפתח לבד כל שבוע</Txt>
          </View>
          <ProBadge size={10.5} />
        </Pressable>
      </View>

      <TabBar active="circles" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.petrol,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    ...shadows.petrolHero,
  },
  heroDeco: { position: 'absolute', left: -55, top: -40, opacity: 0.14 },
  timePill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rsvpBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 21 },
  rsvpGlow: { shadowColor: colors.live, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 4 },
  rsvpOut: { alignItems: 'center', justifyContent: 'center', height: 42, paddingHorizontal: 18, borderRadius: 21, backgroundColor: 'rgba(255,255,255,.14)' },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
  },
  recurIconWrap: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    bottom: 9,
    borderRadius: 15,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 14.5, fontFamily: fonts.bold, color: colors.ink },
  rowMeta: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  activeBadge: { backgroundColor: 'rgba(20,184,168,.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  ctaCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,107,44,.5)',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,107,44,.04)',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cta,
  },
});
