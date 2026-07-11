// src/lib/liveActivity.ts
// App-facing wrapper around the ExpoClaimActivity native module (§10c). Safe
// everywhere: on web/Android, when the widget target hasn't been built, or on
// iOS < 16.2 every call is a no-op — the in-app ClaimCountdownRing (motion §04)
// remains the guaranteed fallback.

import { Platform } from 'react-native';
import { ExpoClaimActivity } from '../../modules/expo-claim-activity';

export type ClaimActivityInput = {
  circleName: string;
  beachName: string;
  gameTime: string; // display string, e.g. "10:00"
  deepLink: string; // mekasa://claim/{token} (opens the claim screen)
  avatars: string[]; // up to 3 initials, stacked on the lock screen
  expiresAt: number; // ms epoch — the server claim deadline
  waitingBehind: number;
};

export function isLiveActivitySupported(): boolean {
  return Platform.OS === 'ios' && !!ExpoClaimActivity && ExpoClaimActivity.isSupported();
}

// One claim activity at a time (matches the one-claim-per-user model).
let currentId: string | null = null;

export async function startClaimActivity(input: ClaimActivityInput): Promise<void> {
  if (!isLiveActivitySupported() || currentId) return;
  try {
    currentId = (await ExpoClaimActivity!.start(input as unknown as Record<string, unknown>)) ?? null;
  } catch {
    currentId = null;
  }
}

export async function updateClaimActivity(patch: Pick<ClaimActivityInput, 'expiresAt' | 'waitingBehind'>): Promise<void> {
  if (!isLiveActivitySupported() || !currentId) return;
  try {
    await ExpoClaimActivity!.update(currentId, patch as unknown as Record<string, unknown>);
  } catch {
    /* no-op */
  }
}

export async function endClaimActivity(): Promise<void> {
  if (!isLiveActivitySupported() || !currentId) return;
  const id = currentId;
  currentId = null;
  try {
    await ExpoClaimActivity!.end(id);
  } catch {
    /* no-op */
  }
}
