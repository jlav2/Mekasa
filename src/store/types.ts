import type { AppNotification, ChatMessage, Circle, Sport, SportProfile, User } from '../data/models';
import type { BeachOption } from '../data/beaches';
import type { AuthResult } from '../data/backend';
import type { BannerSlice } from './slices/bannerSlice';

export type CreateCircleInput = {
  sport: Sport;
  sportLabel: string;
  missing: number; // players wanted besides the host
  levelLabel: string;
  startLabel: string;
  scheduled: boolean;
  isOpen: boolean;
};

export type MapFilter = { sport: Sport | 'all'; level: string | 'all' };

// A simple one-line message, or the richer "spot taken" join-race card
// (rendered by the shared Toast component using circleById to look up
// display info — kept generic since the failure can originate from any
// screen that calls joinCircle: map, notifications, circle detail).
export type ToastState = { kind: 'message'; message: string } | { kind: 'joinRace'; circleId: string };

export type AppState = {
  user: User;
  circles: Circle[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  live: boolean; // true once hydrated from Supabase
  loading: boolean; // true until the first hydrate/goLive attempt resolves (success or failure)
  authKind: 'none' | 'guest' | 'user'; // account status
  toast: ToastState | null;
  draftBeach: BeachOption; // create-circle location choice (set by beach-picker)
  filter: MapFilter; // map chip filters

  // derived helpers
  circleById: (id: string) => Circle | undefined;
  messagesFor: (circleId: string) => ChatMessage[];
  isJoined: (circleId: string) => boolean;
  isWaitlisted: (circleId: string) => boolean;
  unreadCount: () => number;

  // auth
  hydrate: () => Promise<void>;
  continueAsGuest: () => Promise<boolean>;
  signUpEmail: (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => Promise<AuthResult & { name: string; username: string; email: string }>;
  verifyOtp: (email: string, token: string, name: string, username: string) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  logIn: (identifier: string, password: string) => Promise<AuthResult>;
  signInWithProvider: (provider: 'apple' | 'google') => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  confirmPasswordReset: (email: string, token: string, newPassword: string) => Promise<AuthResult>;
  logOut: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  checkUsername: (username: string) => Promise<boolean>;
  setSports: (sports: SportProfile[]) => void;
  setName: (name: string) => void;
  showToast: (toast: ToastState) => void;
  clearToast: () => void;

  // circles + chat + notifications + filter
  setDraftBeach: (beach: BeachOption) => void;
  cycleFilter: (key: keyof MapFilter) => void;
  createCircle: (input: CreateCircleInput) => string;
  joinCircle: (circleId: string) => void;
  leaveCircle: (circleId: string) => void;
  joinWaitlist: (circleId: string) => void;
  leaveWaitlist: (circleId: string) => void;
  sendMessage: (circleId: string, text: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
} & BannerSlice; // in-app banner queue (turn 11)

export type Set = (partial: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
export type Get = () => AppState;
// Each slice contributes part of the combined state, sharing one set/get.
export type SliceCreator<T> = (set: Set, get: Get) => T;
