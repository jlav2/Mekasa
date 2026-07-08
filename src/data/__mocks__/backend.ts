// Manual mock for the Supabase repository layer. Activated project-wide via
// jest.mock('./src/data/backend') in jest.setup.js — store tests exercise real
// slice logic against this boundary instead of a live network/DB, which is
// covered separately by hand-verification against the live project.
export const sessionInfo = jest.fn(async () => null as { id: string; isAnonymous: boolean } | null);
export const authMetadata = jest.fn(async () => null as { name?: string; username?: string; email?: string } | null);
export const signInGuest = jest.fn(async () => null as string | null);
export const signInPassword = jest.fn(async () => ({ ok: false }));
export const signInWithProvider = jest.fn(async () => ({ ok: false }));
export const requestPasswordReset = jest.fn(async () => ({ ok: true }));
export const confirmPasswordReset = jest.fn(async () => ({ ok: false }));
export const deleteAccount = jest.fn(async () => ({ ok: true }));
export const signOut = jest.fn(async () => undefined);
export const signUpEmail = jest.fn(async () => ({ ok: false }));
export const resendEmailOtp = jest.fn(async () => ({ ok: true }));
export const verifyEmailOtp = jest.fn(async () => ({ ok: false }));
export const usernameAvailable = jest.fn(async () => true);
export const fetchProfile = jest.fn(async () => null);
export const upsertProfile = jest.fn();
export const fetchAll = jest.fn(async () => null);
export const subscribeRealtime = jest.fn(() => () => {});
export const pushJoin = jest.fn(async () => true);
export const pushCreateCircle = jest.fn(async () => true);
export const pushMessages = jest.fn();
export const pushLeave = jest.fn();
export const pushJoinWaitlist = jest.fn();
export const pushLeaveWaitlist = jest.fn();
export const pushMarkRead = jest.fn();
