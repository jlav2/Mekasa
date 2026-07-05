// Supabase repository — row↔model mapping, initial fetch, realtime
// subscriptions and write-through pushes. The store stays the single
// source of truth for the UI; everything here is fire-and-forget with
// console warnings on failure (offline demo keeps working).
import { supabase } from '../lib/supabase';
import type { AppNotification, ChatMessage, Circle, Player } from './models';

type CircleRow = {
  id: string;
  sport: Circle['sport'];
  sport_label: string;
  beach_id: string;
  beach_name: string;
  court: string;
  level_label: string;
  capacity: number;
  state: Circle['state'];
  is_open: boolean;
  host_id: string;
  host_name: string;
  start_label: string;
  distance_label: string;
  host_note: string | null;
  lat: number;
  lng: number;
  players?: PlayerRow[];
};

type PlayerRow = {
  id: string;
  circle_id: string;
  user_id: string;
  name: string;
  avatar_initial: string;
  avatar_color: string;
  position: number;
};

type MessageRow = {
  id: string;
  circle_id: string;
  kind: ChatMessage['kind'];
  sender_id: string | null;
  sender_name: string | null;
  sender_color: string | null;
  avatar_letter: string | null;
  avatar_color: string | null;
  text: string | null;
  time_label: string | null;
};

type NotificationRow = {
  id: string;
  kind: AppNotification['kind'];
  group: AppNotification['group'];
  title: string;
  body: string;
  time_label: string;
  unread: boolean;
};

const toPlayer = (r: PlayerRow): Player => ({
  id: r.user_id,
  name: r.name,
  avatarInitial: r.avatar_initial,
  avatarColor: r.avatar_color,
});

const toCircle = (r: CircleRow): Circle => ({
  id: r.id,
  sport: r.sport,
  sportLabel: r.sport_label,
  beachId: r.beach_id,
  beachName: r.beach_name,
  court: r.court,
  levelLabel: r.level_label,
  capacity: r.capacity,
  players: (r.players ?? []).sort((a, b) => a.position - b.position).map(toPlayer),
  waitlist: [],
  state: r.state,
  isOpen: r.is_open,
  hostId: r.host_id,
  hostName: r.host_name,
  startLabel: r.start_label,
  distanceLabel: r.distance_label,
  hostNote: r.host_note ?? undefined,
  lat: r.lat,
  lng: r.lng,
});

const toMessage = (r: MessageRow): ChatMessage => ({
  id: r.id,
  circleId: r.circle_id,
  kind: r.kind,
  senderId: r.sender_id ?? undefined,
  senderName: r.sender_name ?? undefined,
  senderColor: r.sender_color ?? undefined,
  avatarLetter: r.avatar_letter ?? undefined,
  avatarColor: r.avatar_color ?? undefined,
  text: r.text ?? '',
  time: r.time_label ?? '',
});

const toNotification = (r: NotificationRow): AppNotification => ({
  id: r.id,
  kind: r.kind,
  group: r.group,
  title: r.title,
  body: r.body,
  time: r.time_label,
  unread: r.unread,
});

const warn = (op: string) => (e: unknown) => console.warn(`[backend] ${op} failed:`, e);

export async function fetchAll(): Promise<{
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];
} | null> {
  if (!supabase) return null;
  const [circles, messages, notifications] = await Promise.all([
    supabase.from('circles').select('*, players(*)').order('created_at'),
    supabase.from('messages').select('*').order('created_at'),
    supabase.from('notifications').select('*').order('created_at'),
  ]);
  if (circles.error || messages.error || notifications.error) {
    warn('fetchAll')(circles.error ?? messages.error ?? notifications.error);
    return null;
  }
  return {
    circles: (circles.data as CircleRow[]).map(toCircle),
    messages: (messages.data as MessageRow[]).map(toMessage),
    notifications: (notifications.data as NotificationRow[]).map(toNotification),
  };
}

// Realtime — the store passes merge handlers that must be idempotent
// (our own optimistic writes echo back through these).
export function subscribeRealtime(handlers: {
  onPlayerInsert: (circleId: string, player: Player) => void;
  onCircleUpdate: (circle: Partial<Circle> & { id: string }) => void;
  onMessageInsert: (message: ChatMessage) => void;
  onNotificationUpdate: (id: string, unread: boolean) => void;
}): () => void {
  const sb = supabase;
  if (!sb) return () => {};
  const channel = sb
    .channel('mekasa-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players' }, (p) => {
      const r = p.new as PlayerRow;
      handlers.onPlayerInsert(r.circle_id, toPlayer(r));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'circles' }, (p) => {
      const r = p.new as CircleRow;
      handlers.onCircleUpdate({ id: r.id, state: r.state, isOpen: r.is_open });
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
      handlers.onMessageInsert(toMessage(p.new as MessageRow));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (p) => {
      const r = p.new as NotificationRow;
      handlers.onNotificationUpdate(r.id, r.unread);
    })
    .subscribe();
  return () => {
    sb.removeChannel(channel).catch(warn('unsubscribe'));
  };
}

// ---- write-through pushes (optimistic UI already applied locally) ----

export function pushJoin(circle: Circle, player: Player, events: ChatMessage[], nowFull: boolean) {
  const sb = supabase;
  if (!sb) return;
  sb
    .from('players')
    .insert({
      id: `${circle.id}:${player.id}`,
      circle_id: circle.id,
      user_id: player.id,
      name: player.name,
      avatar_initial: player.avatarInitial,
      avatar_color: player.avatarColor,
      position: circle.players.length,
    })
    .then(({ error }) => {
      if (error) return warn('pushJoin/player')(error);
      if (nowFull) {
        sb
          .from('circles')
          .update({ state: 'live' })
          .eq('id', circle.id)
          .then(({ error: e }) => e && warn('pushJoin/state')(e));
      }
      pushMessages(events);
    });
}

export function pushMessages(messages: ChatMessage[]) {
  if (!supabase || messages.length === 0) return;
  supabase
    .from('messages')
    .upsert(
      messages.map((m) => ({
        id: m.id,
        circle_id: m.circleId,
        kind: m.kind,
        sender_id: m.senderId ?? null,
        sender_name: m.senderName ?? null,
        sender_color: m.senderColor ?? null,
        avatar_letter: m.avatarLetter ?? null,
        avatar_color: m.avatarColor ?? null,
        text: m.text ?? null,
        time_label: m.time ?? null,
      })),
      { onConflict: 'id' },
    )
    .then(({ error }) => error && warn('pushMessages')(error));
}

export function pushMarkRead(ids: string[]) {
  if (!supabase || ids.length === 0) return;
  supabase
    .from('notifications')
    .update({ unread: false })
    .in('id', ids)
    .then(({ error }) => error && warn('pushMarkRead')(error));
}
