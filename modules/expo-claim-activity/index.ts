// Local Expo module: control the "שריון מקום" Live Activity from JS.
// Returns null on web/Android, or when the native target isn't built into the
// app yet — callers (src/lib/liveActivity.ts) treat null as a no-op, so the
// in-app ClaimCountdownRing fallback keeps working regardless.

export interface ClaimActivityNativeModule {
  isSupported(): boolean;
  start(info: Record<string, unknown>): Promise<string | null>;
  update(id: string, info: Record<string, unknown>): Promise<void>;
  end(id: string): Promise<void>;
}

let mod: ClaimActivityNativeModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rn = require('expo-modules-core').requireOptionalNativeModule;
  mod = typeof rn === 'function' ? (rn('ExpoClaimActivity') as ClaimActivityNativeModule | null) : null;
} catch {
  mod = null;
}

export const ExpoClaimActivity = mod;
