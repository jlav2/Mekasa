import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Txt,
  Avatar,
  SandRing,
  StatusDot,
  Icon,
  HeroIconButton,
} from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

// Screen 1k — circle detail, Material 3 flavor (Roboto/system chrome, Heebo content).
export default function CircleDetailAndroid() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg, paddingTop: insets.top }}>
      {/* M3 app bar */}
      <View style={styles.appbar}>
        <HeroIconButton size={48} variant="card" onPress={() => router.back()} accessibilityLabel="חזור">
          <Icon name="chevronLeft" size={20} color={colors.ink} strokeWidth={2} />
        </HeroIconButton>
        <Txt style={{ flex: 1, fontSize: 20, fontFamily: fonts.medium, color: colors.ink }}>פרטי מעגל</Txt>
        <HeroIconButton size={48} variant="card" accessibilityLabel="שתף מעגל">
          <Icon name="share" size={19} color={colors.ink} strokeWidth={1.7} />
        </HeroIconButton>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4 }}>
        {/* hero card (radius 20, not full-bleed) */}
        <View style={styles.hero}>
          <SandRing size={180} color="#fff" strokeWidth={2} variant={0} rotate={0} style={{ position: 'absolute', left: -50, top: -30, opacity: 0.14 }} />
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <View style={styles.stateBadge}>
              <StatusDot color="#fff" size={6} />
              <Txt style={{ color: '#fff', fontSize: 11.5, fontFamily: fonts.bold }}>חסר שחקן</Txt>
            </View>
            <View style={styles.sportBadge}>
              <Txt style={{ color: colors.sandGlow, fontSize: 11.5, fontFamily: fonts.semibold }}>פוצ'יוולי · בינוניים</Txt>
            </View>
          </View>
          <Txt style={{ fontSize: 26, fontFamily: fonts.bold, color: '#fff', marginTop: 12, lineHeight: 32 }}>
            המעגל של עומר · חוף פרישמן
          </Txt>
          <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', marginTop: 6, fontFamily: fonts.medium }}>
            התחיל לפני 20 דק' · מגרש 2 · 300 מ' ממך
          </Txt>
        </View>

        {/* players */}
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 }}>
          <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>שחקנים</Txt>
          <Txt style={{ fontSize: 12.5, fontFamily: fonts.bold, color: colors.sunsetDeep }}>3/4 — חסר אחד</Txt>
        </View>
        <View style={{ flexDirection: 'row-reverse', gap: 12, marginTop: 10 }}>
          <Player letter="ע" name="עומר" color={colors.petrol} />
          <Player letter="ד" name="דניאל" color={colors.live} />
          <Player letter="נ" name="נועה" color={colors.amber} />
          <View style={{ alignItems: 'center', gap: 5 }}>
            <View style={styles.emptyAvatar}>
              <Txt style={{ fontSize: 22, color: colors.sunsetDeep, fontFamily: fonts.semibold }}>+</Txt>
            </View>
            <Txt style={{ fontSize: 11, fontFamily: fonts.bold, color: colors.sunsetDeep }}>זה אתה?</Txt>
          </View>
        </View>

        {/* M3 list */}
        <View style={styles.list}>
          <View style={[styles.listRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(14,79,94,.08)' }]}>
            <Icon name="clock" size={20} color={colors.petrol} strokeWidth={1.8} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 14.5, color: colors.ink }}>משחקים עד השקיעה</Txt>
              <Txt style={{ fontSize: 12, color: colors.faint }}>בערך עד 19:30</Txt>
            </View>
          </View>
          <View style={styles.listRow}>
            <Icon name="pin" size={20} color={colors.petrol} strokeWidth={1.8} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 14.5, color: colors.ink }}>ניווט למגרש</Txt>
              <Txt style={{ fontSize: 12, color: colors.faint }}>חוף פרישמן, מגרש 2</Txt>
            </View>
            <Icon name="chevronLeft" size={14} color="#B9C4C9" strokeWidth={2} />
          </View>
        </View>

        {/* host note */}
        <View style={styles.note}>
          <Icon name="bell" size={16} color={colors.live} strokeWidth={1.8} />
          <Txt style={{ fontSize: 12.5, color: colors.liveDeep, fontFamily: fonts.medium }}>
            "מביאים כדור, תביאו מים" — עומר
          </Txt>
        </View>
      </View>

      {/* bottom buttons */}
      <View style={{ flexDirection: 'row-reverse', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 14 }}>
        <Pressable onPress={() => router.push('/chat')} style={[styles.primaryBtn]}>
          <Txt style={{ color: '#fff', fontSize: 15, fontFamily: fonts.semibold }}>אני בפנים</Txt>
        </Pressable>
        <Pressable onPress={() => router.push('/chat')} style={styles.tonalBtn}>
          <Txt style={{ color: colors.petrol, fontSize: 15, fontFamily: fonts.semibold }}>צ'אט המעגל</Txt>
        </Pressable>
      </View>
    </View>
  );
}

function Player({ letter, name, color }: { letter: string; name: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <Avatar letter={letter} size={56} color={color} />
      <Txt style={{ fontSize: 11, fontFamily: fonts.semibold, color: colors.ink }}>{name}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  appbar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, height: 64, paddingHorizontal: 4 },
  hero: { backgroundColor: colors.petrol, borderRadius: 20, padding: 20, overflow: 'hidden' },
  stateBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.sunset, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sportBadge: { backgroundColor: 'rgba(255,255,255,.14)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  emptyAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.sunset, backgroundColor: '#FFF3EA', alignItems: 'center', justifyContent: 'center' },
  list: { backgroundColor: colors.card, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: colors.hairline },
  listRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 16 },
  note: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: 'rgba(20,184,168,.12)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 12 },
  primaryBtn: { flex: 1, height: 52, borderRadius: 26, backgroundColor: colors.sunset, alignItems: 'center', justifyContent: 'center', ...shadows.cta },
  tonalBtn: { height: 52, borderRadius: 26, paddingHorizontal: 20, backgroundColor: 'rgba(14,79,94,.1)', alignItems: 'center', justifyContent: 'center' },
});
