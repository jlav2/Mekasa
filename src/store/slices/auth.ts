import { CHAT_MESSAGES, CIRCLES, CURRENT_USER, NOTIFICATIONS } from '../../data/fixtures';
import {
  sessionInfo,
  signInGuest,
  signInPassword,
  signInWithProvider as backendOAuth,
  requestPasswordReset as backendRequestReset,
  confirmPasswordReset as backendConfirmReset,
  deleteAccount as backendDeleteAccount,
  signOut as backendSignOut,
  signUpEmail as backendSignUpEmail,
  upsertProfile,
  usernameAvailable,
  verifyEmailOtp,
  resendEmailOtp,
} from '../../data/backend';
import { isSupabaseConfigured } from '../../lib/supabase';
import { deriveInitial } from '../helpers';
import { goLive, teardownRealtime } from '../realtime';
import type { AppState, Set, Get } from '../types';

// Reset to the offline fixture seed (logout / account deletion).
const SEED = {
  user: CURRENT_USER,
  circles: CIRCLES,
  messages: CHAT_MESSAGES,
  notifications: NOTIFICATIONS,
  live: false as const,
  authKind: 'none' as const,
};

type AuthSlice = Pick<
  AppState,
  | 'user'
  | 'authKind'
  | 'live'
  | 'hydrate'
  | 'continueAsGuest'
  | 'signUpEmail'
  | 'verifyOtp'
  | 'resendOtp'
  | 'logIn'
  | 'signInWithProvider'
  | 'requestPasswordReset'
  | 'confirmPasswordReset'
  | 'logOut'
  | 'deleteAccount'
  | 'checkUsername'
  | 'setSports'
  | 'setName'
>;

export const createAuthSlice = (set: Set, get: Get): AuthSlice => ({
  user: CURRENT_USER,
  authKind: 'none',
  live: false,

  hydrate: async () => {
    if (!isSupabaseConfigured || get().live) return;
    // Only go live if a session already exists (returning user / guest).
    // New visitors land on /login; auth actions establish the session.
    const info = await sessionInfo();
    if (info) await goLive(set, get, info.id, info.isAnonymous ? 'guest' : 'user');
  },

  continueAsGuest: async () => {
    const uid = await signInGuest();
    if (uid) await goLive(set, get, uid, 'guest');
    return !!uid;
  },

  signUpEmail: async (email, password, name, username) => {
    const res = await backendSignUpEmail(email, password, name, username);
    if (res.ok && !res.needsConfirmation && res.userId) {
      // confirmation disabled → session already active
      await goLive(set, get, res.userId, 'user', name, username);
    }
    return { ...res, name, username, email };
  },

  verifyOtp: async (email, token, name, username) => {
    const res = await verifyEmailOtp(email, token);
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user', name, username);
    return res;
  },

  resendOtp: (email) => resendEmailOtp(email),

  logIn: async (identifier, password) => {
    const res = await signInPassword(identifier, password);
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user');
    return res;
  },

  signInWithProvider: async (provider) => {
    const res = await backendOAuth(provider);
    // Web redirects away and re-hydrates on return; native returns a userId here.
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user');
    return res;
  },

  requestPasswordReset: (email) => backendRequestReset(email),

  confirmPasswordReset: async (email, token, newPassword) => {
    const res = await backendConfirmReset(email, token, newPassword);
    if (res.ok && res.userId) await goLive(set, get, res.userId, 'user');
    return res;
  },

  logOut: async () => {
    teardownRealtime();
    await backendSignOut();
    set({ ...SEED });
  },

  deleteAccount: async () => {
    const res = await backendDeleteAccount();
    if (!res.ok) return res;
    // Wipe the session locally, exactly like a logout.
    teardownRealtime();
    set({ ...SEED });
    return res;
  },

  checkUsername: (username) => usernameAvailable(username),

  setSports: (sports) => {
    const user = { ...get().user, sports };
    set({ user });
    if (get().live) {
      upsertProfile({
        userId: user.id,
        name: user.name,
        avatarInitial: user.avatarInitial,
        avatarColor: user.avatarColor,
        isPro: user.isPro,
        sports,
        homeBeaches: user.homeBeaches,
      });
    }
  },

  setName: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const user = { ...get().user, name: trimmed, avatarInitial: deriveInitial(trimmed) };
    set({ user });
    if (get().live) {
      // Identity-only write — omit sports/homeBeaches so a concurrent setSports
      // (both fire from onboarding's "continue") can't be clobbered by a stale value.
      upsertProfile({
        userId: user.id,
        name: user.name,
        avatarInitial: user.avatarInitial,
        avatarColor: user.avatarColor,
        isPro: user.isPro,
      });
    }
  },
});
