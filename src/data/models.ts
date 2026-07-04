// Domain model — from the handoff's "State Management (sketch)" section.

export type Sport = 'footvolley' | 'altinha' | 'volleyball';
export type Level = 1 | 2 | 3 | 4; // 1 מתחיל … 4 מקצוען

export type SportProfile = {
  sport: Sport;
  level: Level;
  verifiedByPeers: boolean;
};

export type User = {
  id: string;
  name: string;
  avatarInitial: string;
  avatarColor: string;
  city: string;
  memberSince: number;
  sports: SportProfile[];
  homeBeaches: string[];
  followedBeaches: string[]; // cap 3 free / 5 pro
  isPro: boolean;
  stats: { circles: number; beaches: number; partners: number; hours: number };
};

export type Player = {
  id: string;
  name: string;
  avatarInitial: string;
  avatarColor: string;
};

export type CircleState = 'scheduled' | 'live' | 'missing' | 'full' | 'closed' | 'cancelled';

export type Circle = {
  id: string;
  sport: Sport;
  sportLabel: string;
  beachId: string;
  beachName: string;
  court: string;
  levelLabel: string;
  capacity: number;
  players: Player[];
  waitlist: Player[];
  state: CircleState;
  isOpen: boolean; // open = anyone at level joins; closed = host approves
  hostId: string;
  hostName: string;
  startLabel: string; // "התחיל לפני 20 דק'" / "ראשון 18:00"
  distanceLabel: string; // "300 מ' ממך"
  hostNote?: string;
  lat: number;
  lng: number;
};

export type ChatMessage = {
  id: string;
  circleId: string;
  kind: 'in' | 'out' | 'join' | 'milestone';
  senderId?: string;
  senderName?: string;
  senderColor?: string;
  avatarLetter?: string;
  avatarColor?: string;
  text: string;
  time: string;
};

export type NotificationKind = 'hot' | 'social' | 'tournament' | 'summary' | 'upsell';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  group: 'now' | 'today';
  title: string;
  body?: string;
  time: string;
  unread: boolean;
};

export type Tournament = {
  id: string;
  beachId: string;
  beachName: string;
  title: string;
  sportLabel: string;
  format: string;
  teamsCap: number;
  teamsRegistered: number;
  fee: string;
  prize: string;
  dateLabel: string;
};
