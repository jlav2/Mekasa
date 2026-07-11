// App store — Zustand, composed from cohesive slices (auth, circles, chat,
// notifications, filter). Seeds from fixtures for instant first paint, then
// hydrate() replaces state from Supabase (when configured) and subscribes to
// realtime changes (see ./realtime). Actions apply optimistically and write
// through to the backend; realtime echoes are merged idempotently.
import { create } from 'zustand';
import { createAuthSlice } from './slices/auth';
import { createCirclesSlice } from './slices/circles';
import { createChatSlice } from './slices/chat';
import { createNotificationsSlice } from './slices/notifications';
import { createFilterSlice } from './slices/filter';
import { createBannerSlice } from './slices/bannerSlice';
import type { AppState } from './types';

export const useStore = create<AppState>((set, get) => ({
  ...createAuthSlice(set, get),
  ...createCirclesSlice(set, get),
  ...createChatSlice(set, get),
  ...createNotificationsSlice(set, get),
  ...createFilterSlice(set),
  ...createBannerSlice(set, get),
}));

// Dev-only debug handle (mirrors LiveMap.web's window.__mekasaMap) — lets the
// store be poked from the console/preview; stripped from production builds.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  (globalThis as any).__mekasaStore = useStore;
}

export { SPORT_CYCLE, LEVEL_CYCLE, matchesLevel } from './constants';
export type { CreateCircleInput, MapFilter } from './types';
