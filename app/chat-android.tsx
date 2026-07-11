import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Txt, Icon, RingBadge, HeroIconButton } from '../src/components';
import { colors, fonts } from '../src/theme';

type Msg = {
  id: string;
  kind: 'in' | 'out' | 'join' | 'milestone';
  name?: string;
  nameColor?: string;
  avatarLetter?: string;
  avatarColor?: string;
  text?: string;
  time?: string;
};

const MESSAGES: Msg[] = [
  { id: 'm0', kind: 'join', text: 'נועה הצטרפה למעגל · 17:42' },
  {
    id: 'm1',
    kind: 'in',
    name: 'עומר · מארח',
    nameColor: colors.sunset,
    avatarLetter: 'ע',
    avatarColor: colors.petrol,
    text: 'חבר\'ה אנחנו במגרש 2, ליד סוכת המציל. הרשת כבר למעלה 💪',
    time: '17:44',
  },
  {
    id: 'm2',
    kind: 'in',
    name: 'נועה',
    nameColor: colors.amber,
    avatarLetter: 'נ',
    avatarColor: colors.amber,
    text: 'מביאה כדור נוסף ליתר ביטחון',
    time: '17:46',
  },
  { id: 'm3', kind: 'out', text: 'יוצא עכשיו, 5 דקות ואני שם', time: '17:47' },
  { id: 'm4', kind: 'milestone', text: 'המעגל התמלא — 4/4. משחקים!' },
  {
    id: 'm5',
    kind: 'in',
    name: 'דניאל',
    nameColor: colors.live,
    avatarLetter: 'ד',
    avatarColor: colors.live,
    text: 'מישהו מביא רמקול? 🎵',
    time: '17:49',
  },
];

const QUICK_REPLIES = ['בדרך 🏃', 'מביא כדור', "עוד 10 דק'"];

function RingAvatar() {
  return (
    <RingBadge size={44} color={colors.live} variant={0} strokeWidth={3.5} inset={6} rotate={0}>
      <Txt style={{ fontFamily: fonts.bold, fontSize: 11, color: '#fff' }}>4/4</Txt>
    </RingBadge>
  );
}

function JoinBubble({ text }: { text?: string }) {
  return (
    <View style={styles.joinPill}>
      <Txt style={styles.joinText}>{text}</Txt>
    </View>
  );
}

function MilestoneBubble({ text }: { text?: string }) {
  return (
    <View style={styles.milestonePill}>
      <Svg width={15} height={15} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="8" fill="none" stroke={colors.liveDeep} strokeWidth={2} strokeDasharray="18 4 14 4" strokeLinecap="round" />
        <Circle cx="12" cy="12" r="2.6" fill={colors.liveDeep} />
      </Svg>
      <Txt style={styles.milestoneText}>{text}</Txt>
    </View>
  );
}

// M3 incoming: radius 4/20/20/20 (sharp corner top-right, near the avatar)
function IncomingBubble({ m }: { m: Msg }) {
  return (
    <View style={styles.incomingRow}>
      <View style={[styles.avatar, { backgroundColor: m.avatarColor }]}>
        <Txt style={styles.avatarLetter}>{m.avatarLetter}</Txt>
      </View>
      <View style={styles.incomingBubble}>
        <Txt style={[styles.senderName, { color: m.nameColor }]}>{m.name}</Txt>
        <Txt style={styles.msgText}>{m.text}</Txt>
        <Txt style={styles.msgTime}>{m.time}</Txt>
      </View>
    </View>
  );
}

// M3 outgoing: mirrored radius 20/4/20/20, aligned LEFT
function OutgoingBubble({ m }: { m: Msg }) {
  return (
    <View style={styles.outgoingRow}>
      <View style={styles.outgoingBubble}>
        <Txt style={styles.outgoingText}>{m.text}</Txt>
        <View style={styles.outgoingMeta}>
          <Txt style={styles.outgoingTime}>{m.time}</Txt>
          {/* spec 05: read receipt fades in */}
          <Animated.View entering={FadeIn.duration(160)}>
            <Svg width={13} height={8} viewBox="0 0 16 10">
              <Path d="M1 5l3 3 6-7M7 8l2 0.5 6-7.5" fill="none" stroke={colors.live} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

export default function ChatAndroid() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduced = useReducedMotion();

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      {/* app bar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarRow}>
          <HeroIconButton size={48} variant="card" onPress={() => router.back()} accessibilityLabel="חזור">
            <Icon name="chevronRight" size={18} color={colors.ink} strokeWidth={2} />
          </HeroIconButton>
          <RingAvatar />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt style={styles.appBarTitle} numberOfLines={1}>
              המעגל של עומר · חוף פרישמן
            </Txt>
            <View style={styles.appBarSubRow}>
              <View style={styles.liveDot} />
              <Txt style={styles.appBarSub}>משחק חי · 4 שחקנים</Txt>
            </View>
          </View>
          <View style={styles.iconBtn}>
            <Icon name="pin" size={18} color={colors.ink} strokeWidth={1.7} />
          </View>
        </View>
      </View>

      {/* messages */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {MESSAGES.map((m, i) => {
          let bubble: React.ReactNode;
          if (m.kind === 'join') bubble = <JoinBubble text={m.text} />;
          else if (m.kind === 'milestone') bubble = <MilestoneBubble text={m.text} />;
          else if (m.kind === 'out') bubble = <OutgoingBubble m={m} />;
          else bubble = <IncomingBubble m={m} />;
          return (
            <Animated.View
              key={m.id}
              // spec 05: bubbles spring in (staggered here since this is a static showcase)
              entering={
                reduced
                  ? FadeIn.duration(160)
                  : FadeInDown.springify().damping(16).stiffness(220).delay(Math.min(i, 5) * 60)
              }
            >
              {bubble}
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* quick replies — outlined M3 chips */}
      <View style={styles.quickRow}>
        {QUICK_REPLIES.map((q) => (
          <Pressable key={q} style={styles.quickChip}>
            <Txt style={styles.quickChipText}>{q}</Txt>
          </Pressable>
        ))}
      </View>

      {/* M3 input */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputField}>
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="8" fill="none" stroke="#49454F" strokeWidth={1.7} />
            <Path d="M6.5 11.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M7 8h.01M13 8h.01" fill="none" stroke="#49454F" strokeWidth={1.7} strokeLinecap="round" />
          </Svg>
          <Txt style={styles.inputPlaceholder}>כתוב למעגל…</Txt>
          <Svg width={17} height={17} viewBox="0 0 20 20">
            <Rect x="7" y="2" width="6" height="11" rx="3" fill="none" stroke="#49454F" strokeWidth={1.7} />
            <Path d="M4 10a6 6 0 0012 0M10 16v2.5" fill="none" stroke="#49454F" strokeWidth={1.7} strokeLinecap="round" />
          </Svg>
        </View>
        <Pressable style={styles.sendBtn}>
          <Icon name="send" size={19} color="#fff" strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: colors.sandBg,
    shadowColor: 'rgba(14,79,94,.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  appBarRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, height: 72, paddingHorizontal: 8 },
  iconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appBarTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  appBarSubRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
  appBarSub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },

  messagesContent: { padding: 16, paddingBottom: 8, gap: 10 },

  joinPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(14,79,94,.08)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  joinText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.muted },

  milestonePill: {
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,184,168,.12)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  milestoneText: { fontFamily: fonts.bold, fontSize: 12, color: colors.liveDeep },

  incomingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '82%',
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontFamily: fonts.semibold, fontSize: 13, color: '#fff' },
  // M3 radius: 4 (top-right, near avatar) / 20 / 20 / 20
  incomingBubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.1)',
    borderTopRightRadius: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  senderName: { fontFamily: fonts.bold, fontSize: 11 },
  msgText: { fontFamily: fonts.body, fontSize: 14.5, color: colors.ink, lineHeight: 21, marginTop: 2 },
  msgTime: { fontFamily: fonts.body, fontSize: 10, color: '#B9C4C9', textAlign: 'left', marginTop: 3 },

  outgoingRow: { maxWidth: '82%', alignSelf: 'flex-start' },
  // mirrored M3 radius: 20 / 4 (top-left, near edge) / 20 / 20
  outgoingBubble: {
    backgroundColor: colors.petrol,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  outgoingText: { fontFamily: fonts.body, fontSize: 14.5, color: '#fff', lineHeight: 21 },
  outgoingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  outgoingTime: { fontFamily: fonts.body, fontSize: 10, color: 'rgba(255,255,255,.55)' },

  quickRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 16, paddingVertical: 6, paddingBottom: 10 },
  quickChip: {
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.28)',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  quickChipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.petrol },

  inputRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 0 },
  inputField: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDE4CF',
    paddingHorizontal: 18,
  },
  inputPlaceholder: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: '#49454F' },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    flexShrink: 0,
  },
});
