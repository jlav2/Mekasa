import { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Txt, Icon } from '../src/components';
import { colors, fonts } from '../src/theme';
import { useStore } from '../src/store';
import type { ChatMessage } from '../src/data/models';

const CIRCLE_ID = 'frishman';

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

const toMsg = (m: ChatMessage): Msg => ({
  id: m.id,
  kind: m.kind,
  name: m.senderName,
  nameColor: m.senderColor,
  avatarLetter: m.avatarLetter,
  avatarColor: m.avatarColor,
  text: m.text,
  time: m.kind === 'in' || m.kind === 'out' ? m.time : undefined,
});

const QUICK_REPLIES = ['בדרך 🏃', 'מביא כדור', "עוד 10 דק'"];

function RingAvatar({ count }: { count: string }) {
  return (
    <View style={{ width: 46, height: 46 }}>
      <Svg width={46} height={46} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
        <Circle
          cx={32}
          cy={32}
          r={28}
          fill="none"
          stroke={colors.live}
          strokeWidth={3.5}
          strokeDasharray="52 7 38 9 44 6"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.ringAvatarInner}>
        <Txt style={{ fontFamily: fonts.extrabold, fontSize: 12, color: '#fff' }}>{count}</Txt>
      </View>
    </View>
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

function OutgoingBubble({ m }: { m: Msg }) {
  return (
    <View style={styles.outgoingRow}>
      <View style={styles.outgoingBubble}>
        <Txt style={styles.outgoingText}>{m.text}</Txt>
        <View style={styles.outgoingMeta}>
          <Txt style={styles.outgoingTime}>{m.time}</Txt>
          <Svg width={13} height={8} viewBox="0 0 16 10">
            <Path d="M1 5l3 3 6-7M7 8l2 0.5 6-7.5" fill="none" stroke={colors.live} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const circle = useStore((s) => s.circleById(CIRCLE_ID))!;
  const messages = useStore((s) => s.messages).filter((m) => m.circleId === CIRCLE_ID).map(toMsg);
  const sendMessage = useStore((s) => s.sendMessage);

  const send = (text: string) => {
    sendMessage(CIRCLE_ID, text);
    setDraft('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.sandBg }}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Svg width={170} height={170} viewBox="0 0 64 64" style={styles.headerDeco}>
          <Circle
            cx={32}
            cy={32}
            r={26}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="48 8 40 10 42 7"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="chevronRight" size={20} color="#fff" strokeWidth={2.4} />
          </Pressable>
          <RingAvatar count={`${circle.players.length}/${circle.capacity}`} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt style={styles.headerTitle} numberOfLines={1}>
              המעגל של עומר · חוף פרישמן
            </Txt>
            <View style={styles.headerSubRow}>
              <View style={styles.liveDot} />
              <Txt style={styles.headerSub}>משחק חי · {circle.players.length} שחקנים בצ'אט</Txt>
            </View>
          </View>
          <View style={styles.pinBtn}>
            <Icon name="pin" size={16} color="#fff" strokeWidth={1.7} />
          </View>
        </View>
      </View>

      {/* messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => {
          if (m.kind === 'join') return <JoinBubble key={m.id} text={m.text} />;
          if (m.kind === 'milestone') return <MilestoneBubble key={m.id} text={m.text} />;
          if (m.kind === 'out') return <OutgoingBubble key={m.id} m={m} />;
          return <IncomingBubble key={m.id} m={m} />;
        })}
      </ScrollView>

      {/* quick replies */}
      <View style={styles.quickRow}>
        {QUICK_REPLIES.map((q) => (
          <Pressable key={q} style={styles.quickChip} onPress={() => send(q)}>
            <Txt style={styles.quickChipText}>{q}</Txt>
          </Pressable>
        ))}
      </View>

      {/* input */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 20) + 24 }]}>
        <View style={styles.inputPill}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="כתוב למעגל…"
            placeholderTextColor={colors.faint}
            style={styles.input}
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
          />
          <Svg width={18} height={18} viewBox="0 0 20 20">
            <Circle cx="10" cy="10" r="8" fill="none" stroke={colors.faint} strokeWidth={1.7} />
            <Path d="M6.5 11.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M7 8h.01M13 8h.01" fill="none" stroke={colors.faint} strokeWidth={1.7} strokeLinecap="round" />
          </Svg>
        </View>
        <Pressable style={styles.sendFab} onPress={() => send(draft)} accessibilityRole="button" accessibilityLabel="שלח">
          <Icon name="send" size={18} color="#fff" strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.petrol,
    paddingHorizontal: 18,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  headerDeco: { position: 'absolute', left: -50, top: -30, opacity: 0.13 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAvatarInner: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 999,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.extrabold, fontSize: 16.5, color: '#fff' },
  headerSubRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.live },
  headerSub: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,.65)' },
  pinBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messagesContent: { padding: 16, paddingBottom: 8, gap: 10 },

  joinPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(14,79,94,.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  joinText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.muted },

  milestonePill: {
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,184,168,.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  milestoneText: { fontFamily: fonts.bold, fontSize: 12, color: colors.liveDeep },

  // incoming: right side (avatar on the right, RTL leading)
  incomingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '82%',
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
  incomingBubble: {
    flexShrink: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(14,79,94,.1)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  senderName: { fontFamily: fonts.bold, fontSize: 11 },
  msgText: { fontFamily: fonts.body, fontSize: 14.5, color: colors.ink, lineHeight: 21, marginTop: 2 },
  msgTime: { fontFamily: fonts.body, fontSize: 10, color: '#B9C4C9', textAlign: 'left', marginTop: 3 },

  // outgoing: mirrored — aligns LEFT (WhatsApp-RTL style)
  outgoingRow: {
    maxWidth: '82%',
    alignSelf: 'flex-start',
  },
  outgoingBubble: {
    backgroundColor: colors.petrol,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  outgoingText: { fontFamily: fonts.body, fontSize: 14.5, color: '#fff', lineHeight: 21 },
  outgoingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-start', marginTop: 3 },
  outgoingTime: { fontFamily: fonts.body, fontSize: 10, color: 'rgba(255,255,255,.55)' },

  quickRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 16, paddingVertical: 6, paddingBottom: 10 },
  quickChip: {
    backgroundColor: 'rgba(14,79,94,.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.petrol },

  inputRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  inputPill: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'rgba(14,79,94,.14)',
    paddingHorizontal: 16,
  },
  inputPlaceholder: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, color: colors.faint },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.ink,
    textAlign: 'right',
    paddingVertical: 0,
  },
  sendFab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.sunset,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.sunset,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    flexShrink: 0,
  },
});
