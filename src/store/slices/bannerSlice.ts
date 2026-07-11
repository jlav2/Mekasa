// src/store/slices/bannerSlice.ts
// In-app banner queue: one visible, chat coalescing, suppression matrix.
// Spec: design_handoff_mekasa_banners/README.md (canvas #11d = source of truth)
// Registered in src/store/index.ts alongside the existing slices.

import type { Set, Get } from '../types';

export type BannerKind =
  | 'claim' // persistent, countdown ring
  | 'claimExpired'
  | 'newCircle'
  | 'chat' // coalescing
  | 'hostRequest' // inline approve/decline
  | 'startingSoon'
  | 'tournament';

export interface Banner {
  id: string;
  kind: BannerKind;
  title: string;
  body: string;
  circleId?: string;
  /** claim: server expiry (ms epoch) — drives ClaimCountdownRing */
  expiresAt?: number;
  /** claim: claim token for deep link */
  claimToken?: string;
  /** hostRequest: join request id for approve/decline */
  requestId?: string;
  /** chat: sender for coalescing + avatar initial */
  senderName?: string;
  senderColor?: string;
  /** chat: coalesced count ("עומר +2 הודעות") */
  coalesced: number;
  /** tournament etc.: explicit route override */
  route?: string;
  createdAt: number;
}

export interface BannerContext {
  pathname: string;
  /** circle id of the currently open circle/chat/manage screen, if any */
  circleId?: string;
  /** true while the user is on an active-game screen */
  liveGameActive?: boolean;
}

/** Auto-dismiss per kind (ms). null = persistent (claim). */
export const BANNER_DURATION: Record<BannerKind, number | null> = {
  claim: null,
  claimExpired: 5000,
  newCircle: 5000,
  chat: 4000,
  hostRequest: 8000,
  startingSoon: 6000,
  tournament: 5000,
};

const INFO_KINDS: BannerKind[] = ['newCircle', 'chat', 'startingSoon', 'tournament', 'claimExpired'];
const MAX_QUEUE = 2;

/** Suppression matrix (#11d). True = do NOT show. Routes match the real app:
 *  circle detail is /c/[id], chat is /chat, manage is /host-tools, claim is
 *  /circle-waitlist. */
export function isSuppressed(b: Pick<Banner, 'kind' | 'circleId'>, ctx: BannerContext): boolean {
  const onCircle = (p: string) => ctx.pathname.startsWith(p) && ctx.circleId === b.circleId;
  switch (b.kind) {
    case 'claim':
      return ctx.pathname.startsWith('/circle-waitlist'); // claim screen shows it itself
    case 'claimExpired':
      return ctx.pathname.startsWith('/circle-waitlist');
    case 'newCircle':
      return onCircle('/c/') || !!ctx.liveGameActive || ctx.pathname.startsWith('/create');
    case 'chat':
      return onCircle('/chat') || !!ctx.liveGameActive || ctx.pathname.startsWith('/rating');
    case 'hostRequest':
      return ctx.pathname.startsWith('/host-tools');
    case 'startingSoon':
      return onCircle('/c/');
    case 'tournament':
      return ctx.pathname.startsWith('/tournament');
  }
}

export interface BannerSlice {
  banner: Banner | null;
  bannerQueue: Banner[];
  bannerContext: BannerContext;
  setBannerContext: (ctx: Partial<BannerContext>) => void;
  /** Enqueue from realtime / foreground-push handlers. Applies suppression + coalescing. */
  showBanner: (b: Omit<Banner, 'id' | 'coalesced' | 'createdAt'>) => void;
  /** Dismiss the visible banner (swipe/timer/tap). Promotes the next queued one. */
  dismissBanner: () => void;
}

let seq = 0;

export const createBannerSlice = (set: Set, get: Get): BannerSlice => ({
  banner: null,
  bannerQueue: [],
  bannerContext: { pathname: '/' },

  setBannerContext: (ctx) => set((s) => ({ bannerContext: { ...s.bannerContext, ...ctx } })),

  showBanner: (input) => {
    const s = get();
    if (isSuppressed(input, s.bannerContext)) return;

    // Chat coalescing: same circle + sender while visible or queued → bump count.
    if (input.kind === 'chat') {
      const match = (x: Banner | null) =>
        !!x && x.kind === 'chat' && x.circleId === input.circleId && x.senderName === input.senderName;
      if (match(s.banner)) {
        set({ banner: { ...(s.banner as Banner), coalesced: (s.banner as Banner).coalesced + 1, body: input.body, createdAt: nowMs() } });
        return;
      }
      const qi = s.bannerQueue.findIndex(match);
      if (qi >= 0) {
        const q = [...s.bannerQueue];
        q[qi] = { ...q[qi], coalesced: q[qi].coalesced + 1, body: input.body };
        set({ bannerQueue: q });
        return;
      }
    }

    const banner: Banner = { ...input, id: `bn${++seq}`, coalesced: 0, createdAt: nowMs() };

    // Empty stage → show now.
    if (!s.banner) {
      set({ banner });
      return;
    }
    // Visible claim is never displaced; a new claim replaces anything.
    if (s.banner.kind === 'claim' && banner.kind !== 'claim') {
      const q = [...s.bannerQueue, banner];
      // cap queue: drop oldest info-type first
      while (q.length > MAX_QUEUE) {
        const di = q.findIndex((x) => INFO_KINDS.includes(x.kind));
        q.splice(di >= 0 ? di : 0, 1);
      }
      set({ bannerQueue: q });
      return;
    }
    // Otherwise: new pushes old out (component animates exit on id change).
    set({ banner });
  },

  dismissBanner: () =>
    set((s) => {
      const [next, ...rest] = s.bannerQueue;
      return { banner: next ?? null, bannerQueue: rest };
    }),
});

// Date.now() indirection kept in one place (createdAt is only used for ordering
// and coalescing freshness, never persisted).
function nowMs(): number {
  return Date.now();
}
