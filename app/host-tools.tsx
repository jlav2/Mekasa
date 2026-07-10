import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Screen, Txt, Avatar, Icon, HeroIconButton } from '../src/components';
import { colors, fonts, shadows } from '../src/theme';

type Requester = {
  letter: string;
  color: string;
  name: string;
  meta: string;
};

const REQUESTS: Requester[] = [
  { letter: 'ר', color: '#7A6FB8', name: 'רועי ברק', meta: 'בינוני · 23 מעגלים · שיחקתם פעמיים' },
  { letter: 'מ', color: '#4E9B8F', name: 'מאיה כהן', meta: 'מתחילה · 4 מעגלים · חדשה בחוף' },
];

function ApproveButton() {
  return (
    <View style={styles.approveBtn}>
      <Svg width={15} height={12} viewBox="0 0 14 11">
        <Path d="M1.5 5.5l3.5 3.5 7.5-7.5" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

function DeclineButton() {
  return (
    <View style={styles.declineBtn}>
      <Icon name="x" size={12} color={colors.faint} strokeWidth={2} />
    </View>
  );
}

export default function HostTools() {
  const router = useRouter();

  return (
    <Screen padded={false} edges={{ top: true, bottom: true }} bg={colors.sandBg}>
      {/* header */}
      <View style={styles.header}>
        <HeroIconButton variant="card" onPress={() => router.back()}>
          <Icon name="chevronRight" size={18} color={colors.petrol} strokeWidth={2.4} />
        </HeroIconButton>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 40, color: colors.petrol }}>
            המעגל שלך
          </Txt>
          <Txt style={{ fontSize: 12, color: colors.muted, fontFamily: fonts.semibold }}>
            אלטינה · חוף גורדון · ראשון 18:00
          </Txt>
        </View>
        <View style={styles.hostBadge}>
          <Txt style={{ fontSize: 11.5, fontFamily: fonts.extrabold, color: '#E85413' }}>אתה המארח</Txt>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 10 }}>
        {/* pending requests */}
        <Txt style={{ fontSize: 12, fontFamily: fonts.extrabold, color: colors.sunsetDeep, letterSpacing: 0.5, paddingRight: 6 }}>
          2 בקשות הצטרפות
        </Txt>
        <View style={styles.pendingCard}>
          {REQUESTS.map((r, i) => (
            <View
              key={r.name}
              style={[styles.reqRow, i < REQUESTS.length - 1 && styles.rowBorder]}
            >
              <Avatar letter={r.letter} color={r.color} size={44} />
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>{r.name}</Txt>
                <Txt style={{ fontSize: 11.5, color: colors.faint }}>{r.meta}</Txt>
              </View>
              <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
                <ApproveButton />
                <DeclineButton />
              </View>
            </View>
          ))}
        </View>

        {/* current players */}
        <Txt style={{ fontSize: 12, fontFamily: fonts.extrabold, color: colors.faint, letterSpacing: 0.5, paddingRight: 6, marginTop: 2 }}>
          בפנים · 2/5
        </Txt>
        <View style={styles.playersCard}>
          <View style={[styles.reqRow, styles.rowBorder]}>
            <Avatar letter="ג" color={colors.petrol} size={40} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>גיא לוי (אתה)</Txt>
              <Txt style={{ fontSize: 11.5, color: colors.faint }}>מארח</Txt>
            </View>
          </View>
          <View style={styles.reqRow}>
            <Avatar letter="ד" color={colors.live} size={40} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: colors.ink }}>דניאל</Txt>
              <Txt style={{ fontSize: 11.5, color: colors.faint }}>אישר הגעה</Txt>
            </View>
            <Txt style={{ fontSize: 12.5, fontFamily: fonts.bold, color: colors.faint }}>הסר</Txt>
          </View>
        </View>

        {/* host actions */}
        <View style={styles.playersCard}>
          <Pressable style={[styles.actionRow, styles.rowBorder]}>
            <Icon name="edit" size={17} color={colors.petrol} strokeWidth={1.8} />
            <Txt style={{ flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.ink }}>
              ערוך פרטים — שעה, רמה, מקומות
            </Txt>
            <Icon name="chevronLeft" size={13} color="#B9C4C9" strokeWidth={2} />
          </Pressable>
          <Pressable style={[styles.actionRow, styles.rowBorder]}>
            <Icon name="chat" size={17} color={colors.petrol} strokeWidth={1.8} />
            <Txt style={{ flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.ink }}>
              שתף שוב בוואטסאפ
            </Txt>
            <Icon name="chevronLeft" size={13} color="#B9C4C9" strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.actionRow}>
            <Icon name="x" size={17} color={colors.danger} strokeWidth={2} />
            <Txt style={{ flex: 1, fontSize: 14, fontFamily: fonts.semibold, color: colors.danger }}>
              בטל את המעגל
            </Txt>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
  },
  hostBadge: {
    backgroundColor: 'rgba(255,107,44,.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pendingCard: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,44,.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    ...shadows.card,
    shadowColor: colors.sunset,
    shadowOpacity: 0.1,
  },
  playersCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  reqRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  approveBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.live,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  declineBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
