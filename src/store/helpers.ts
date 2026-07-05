import type { User } from '../data/models';
import { avatarPalette } from '../theme';

export const nowTime = () =>
  new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

export const msgId = () => `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const deriveInitial = (name: string) => name.trim().charAt(0) || '·';

// Stable per-user avatar color so a returning account keeps the same tint even
// though we don't read avatar_color back from the profile row.
export const avatarColorFor = (uid: string) => {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return avatarPalette[h % avatarPalette.length];
};

// A brand-new account starts empty — it must NEVER inherit the demo fixture
// (CURRENT_USER: 'גיא לוי' + Pro + fake sports/beaches/stats), which would
// otherwise leak in via the store's seed state and get persisted to Supabase.
export function freshUser(uid: string, name: string): User {
  return {
    id: uid,
    name,
    avatarInitial: deriveInitial(name),
    avatarColor: avatarColorFor(uid),
    city: 'תל אביב',
    memberSince: new Date().getFullYear(),
    sports: [],
    homeBeaches: [],
    followedBeaches: [],
    isPro: false,
    stats: { circles: 0, beaches: 0, partners: 0, hours: 0 },
  };
}
