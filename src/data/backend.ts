// Supabase repository — row↔model mapping, initial fetch, realtime
// subscriptions and write-through pushes. The store stays the single
// source of truth for the UI; everything here is fire-and-forget with
// console warnings on failure (offline demo keeps working).
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import type { AppNotification, ChatMessage, Circle, Player, SportProfile } from './models';

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
  waitlist?: WaitlistRow[];
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

type WaitlistRow = {
  id: string;
  circle_id: string;
  user_id: string;
  name: string;
  avatar_initial: string;
  avatar_color: string;
  created_at: string;
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
  circle_id: string | null;
};

const toPlayer = (r: PlayerRow): Player => ({
  id: r.user_id,
  name: r.name,
  avatarInitial: r.avatar_initial,
  avatarColor: r.avatar_color,
});

const toWaitlistPlayer = (r: WaitlistRow): Player => ({
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
  waitlist: (r.waitlist ?? [])
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
    .map(toWaitlistPlayer),
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
  circleId: r.circle_id ?? undefined,
});

const warn = (op: string) => (e: unknown) => console.warn(`[backend] ${op} failed:`, e);

// ---- auth ----

export async function sessionInfo(): Promise<{ id: string; isAnonymous: boolean } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  return { id: u.id, isAnonymous: !!u.is_anonymous };
}

// Identity carried on the auth session itself (local read, no network round-trip):
// email-signup stores { name, username } in user_metadata; OAuth providers fill
// name/full_name/avatar. Lets a brand-new account seed its profile from real data
// instead of the demo fixture.
export async function authMetadata(): Promise<{
  name?: string;
  username?: string;
  email?: string;
} | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  const m = (u.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  return {
    name: str(m.name) ?? str(m.full_name) ?? str(m.user_name),
    username: str(m.username) ?? str(m.user_name),
    email: u.email ?? undefined,
  };
}

// Guest access — anonymous session so RLS-scoped browsing works without an account.
export async function signInGuest(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: signIn, error } = await supabase.auth.signInAnonymously();
  if (error) {
    warn('signInGuest')(error);
    return null;
  }
  return signIn.user?.id ?? null;
}

export type AuthResult = { ok: boolean; error?: string; userId?: string; needsConfirmation?: boolean };

export async function usernameAvailable(username: string): Promise<boolean> {
  if (!supabase) return true;
  const { data, error } = await supabase.rpc('username_available', { u: username });
  if (error) {
    warn('usernameAvailable')(error);
    return true; // don't block signup on a check failure; unique constraint backstops
  }
  return data === true;
}

export async function signUpEmail(
  email: string,
  password: string,
  name: string,
  username: string,
): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, username } },
  });
  if (error) return { ok: false, error: error.message };
  // No session back → email confirmation is enabled; caller routes to OTP entry.
  return { ok: true, userId: data.user?.id, needsConfirmation: !data.session };
}

// Re-send the signup confirmation code (same 6-digit email OTP).
export async function resendEmailOtp(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// 6-digit code from the confirmation email (in-app, no magic-link app hopping).
export async function verifyEmailOtp(email: string, token: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return { ok: false, error: error.message };
  return { ok: true, userId: data.user?.id };
}

// Log in with email OR username (+ password). Username resolves to its email.
export async function signInPassword(identifier: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  let email = identifier.trim();
  if (!email.includes('@')) {
    // Password-gated resolver: returns the email only when the password matches,
    // so a wrong password / unknown username both yield null (no email leak, no
    // "does this account exist" oracle).
    const { data, error } = await supabase.rpc('email_for_username', { u: email, p: password });
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: 'שם משתמש או סיסמה שגויים' };
    email = data as string;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, userId: data.user?.id };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut().catch(warn('signOut'));
}

// Permanently delete the signed-in account: a security-definer RPC removes the
// caller's data (hosted circles cascade to their players + messages) and the
// auth user itself, then we drop the now-invalid local session.
export async function deleteAccount(): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const { error } = await supabase.rpc('delete_account');
  if (error) return { ok: false, error: error.message };
  await supabase.auth.signOut().catch(warn('deleteAccount/signOut'));
  return { ok: true };
}

// Send a password-recovery email (6-digit code when the recovery template uses
// {{ .Token }}; link otherwise). Delivery needs an SMTP provider configured.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const redirectTo = makeRedirectUri({ scheme: 'mekasa', path: 'auth-callback' });
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Verify the recovery code (establishes a session), then set the new password.
export async function confirmPasswordReset(
  email: string,
  token: string,
  newPassword: string,
): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
  if (error) return { ok: false, error: error.message };
  const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
  if (upErr) return { ok: false, error: upErr.message };
  return { ok: true, userId: data.user?.id };
}

// Apple / Google OAuth. Web: full-page redirect (supabase parses the hash on
// return via detectSessionInUrl). Native: open the provider in a web browser,
// then exchange the returned PKCE code for a session. Requires the provider to
// be enabled in the Supabase dashboard (client id/secret) — otherwise errors.
export async function signInWithProvider(provider: 'apple' | 'google'): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: 'לא מחובר לשרת' };
  const redirectTo = makeRedirectUri({ scheme: 'mekasa', path: 'auth-callback' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) return { ok: false, error: error.message };
  if (Platform.OS === 'web') return { ok: true }; // browser redirects; session on return

  // Native: drive the auth session ourselves
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { ok: false, error: 'ההתחברות בוטלה' };
  const code = new URL(result.url).searchParams.get('code');
  if (!code) return { ok: false, error: 'לא התקבל קוד אימות' };
  const { data: session, error: exErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exErr) return { ok: false, error: exErr.message };
  return { ok: true, userId: session.user?.id };
}

export async function fetchProfile(userId: string): Promise<{
  name: string;
  username?: string;
  isPro: boolean;
  sports?: SportProfile[];
  homeBeaches?: string[];
} | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('name, username, is_pro, sports, home_beaches')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name,
    username: data.username ?? undefined,
    isPro: data.is_pro,
    sports: data.sports ?? undefined,
    homeBeaches: data.home_beaches ?? undefined,
  };
}

export function upsertProfile(p: {
  userId: string;
  name: string;
  avatarInitial: string;
  avatarColor: string;
  isPro: boolean;
  username?: string;
  sports?: SportProfile[];
  homeBeaches?: string[];
}) {
  if (!supabase) return;
  const row: Record<string, unknown> = {
    user_id: p.userId,
    name: p.name,
    avatar_initial: p.avatarInitial,
    avatar_color: p.avatarColor,
    is_pro: p.isPro,
  };
  if (p.username !== undefined) row.username = p.username;
  if (p.sports !== undefined) row.sports = p.sports;
  if (p.homeBeaches !== undefined) row.home_beaches = p.homeBeaches;
  supabase
    .from('profiles')
    .upsert(row, { onConflict: 'user_id' })
    .then(({ error }) => error && warn('upsertProfile')(error));
}

export async function fetchAll(): Promise<{
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];
} | null> {
  if (!supabase) return null;
  const [circles, messages, notifications] = await Promise.all([
    supabase.from('circles').select('*, players(*), waitlist(*)').order('created_at'),
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
  onPlayerRemove: (circleId: string, userId: string) => void;
  onWaitlistInsert: (circleId: string, player: Player) => void;
  onWaitlistRemove: (circleId: string, userId: string) => void;
  onCircleInsert: (circle: Circle) => void;
  onCircleUpdate: (circle: Partial<Circle> & { id: string }) => void;
  onCircleRemove: (id: string) => void;
  onMessageInsert: (message: ChatMessage) => void;
  onNotificationInsert: (notification: AppNotification) => void;
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
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'players' }, (p) => {
      // DELETE payloads carry only the replica-identity (primary key = "<circle>:<user>")
      const id = (p.old as Partial<PlayerRow>).id;
      if (id) {
        const sep = id.indexOf(':');
        handlers.onPlayerRemove(id.slice(0, sep), id.slice(sep + 1));
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'waitlist' }, (p) => {
      const r = p.new as WaitlistRow;
      handlers.onWaitlistInsert(r.circle_id, toWaitlistPlayer(r));
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'waitlist' }, (p) => {
      const id = (p.old as Partial<WaitlistRow>).id;
      if (id) {
        const sep = id.indexOf(':');
        handlers.onWaitlistRemove(id.slice(0, sep), id.slice(sep + 1));
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'circles' }, (p) => {
      // players arrive via their own INSERT events right after
      handlers.onCircleInsert(toCircle(p.new as CircleRow));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'circles' }, (p) => {
      const r = p.new as CircleRow;
      handlers.onCircleUpdate({ id: r.id, state: r.state, isOpen: r.is_open });
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'circles' }, (p) => {
      const id = (p.old as Partial<CircleRow>).id;
      if (id) handlers.onCircleRemove(id);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
      handlers.onMessageInsert(toMessage(p.new as MessageRow));
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (p) => {
      handlers.onNotificationInsert(toNotification(p.new as NotificationRow));
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

// Resolves false when the DB rejects the join (e.g. the capacity-guard trigger
// lost a race to another joiner) so the caller can roll back its optimistic state.
export async function pushJoin(circle: Circle, player: Player, events: ChatMessage[]): Promise<boolean> {
  const sb = supabase;
  if (!sb) return true; // offline demo — nothing to reject
  // The full-circle state flip happens in a DB trigger (the joiner isn't the
  // host, so RLS forbids updating the circle row from here).
  const { error } = await sb.from('players').insert({
    id: `${circle.id}:${player.id}`,
    circle_id: circle.id,
    user_id: player.id,
    name: player.name,
    avatar_initial: player.avatarInitial,
    avatar_color: player.avatarColor,
    position: circle.players.length,
  });
  if (error) {
    warn('pushJoin/player')(error);
    return false;
  }
  pushMessages(events);
  return true;
}

// Resolves false when persisting fails so the caller can drop the optimistic circle.
export async function pushCreateCircle(circle: Circle, host: Player, events: ChatMessage[]): Promise<boolean> {
  const sb = supabase;
  if (!sb) return true; // offline demo — nothing to reject
  // Order matters under RLS: circle (host_id = uid) → host player row →
  // opening message (requires membership).
  const { error } = await sb.from('circles').insert({
    id: circle.id,
    sport: circle.sport,
    sport_label: circle.sportLabel,
    beach_id: circle.beachId,
    beach_name: circle.beachName,
    court: circle.court,
    level_label: circle.levelLabel,
    capacity: circle.capacity,
    state: circle.state,
    is_open: circle.isOpen,
    host_id: circle.hostId,
    host_name: circle.hostName,
    start_label: circle.startLabel,
    distance_label: circle.distanceLabel,
    host_note: circle.hostNote ?? null,
    lat: circle.lat,
    lng: circle.lng,
  });
  if (error) {
    warn('pushCreateCircle/circle')(error);
    return false;
  }
  const { error: hostErr } = await sb.from('players').insert({
    id: `${circle.id}:${host.id}`,
    circle_id: circle.id,
    user_id: host.id,
    name: host.name,
    avatar_initial: host.avatarInitial,
    avatar_color: host.avatarColor,
    position: 0,
  });
  if (hostErr) {
    warn('pushCreateCircle/host')(hostErr);
    // Don't leave a hostless circle behind (players/messages cascade).
    await sb.from('circles').delete().eq('id', circle.id);
    return false;
  }
  pushMessages(events);
  return true;
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

export function pushLeave(circleId: string, userId: string) {
  const sb = supabase;
  if (!sb) return;
  sb
    .from('players')
    .delete()
    .eq('id', `${circleId}:${userId}`)
    .then(({ error }) => error && warn('pushLeave')(error));
}

export function pushJoinWaitlist(circleId: string, player: Player) {
  const sb = supabase;
  if (!sb) return;
  sb
    .from('waitlist')
    .insert({
      id: `${circleId}:${player.id}`,
      circle_id: circleId,
      user_id: player.id,
      name: player.name,
      avatar_initial: player.avatarInitial,
      avatar_color: player.avatarColor,
    })
    .then(({ error }) => error && warn('pushJoinWaitlist')(error));
}

export function pushLeaveWaitlist(circleId: string, userId: string) {
  const sb = supabase;
  if (!sb) return;
  sb
    .from('waitlist')
    .delete()
    .eq('id', `${circleId}:${userId}`)
    .then(({ error }) => error && warn('pushLeaveWaitlist')(error));
}

export function pushMarkRead(ids: string[]) {
  if (!supabase || ids.length === 0) return;
  supabase
    .from('notifications')
    .update({ unread: false })
    .in('id', ids)
    .then(({ error }) => error && warn('pushMarkRead')(error));
}
