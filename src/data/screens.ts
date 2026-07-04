// Manifest of all canvas screens → app routes. Drives the dev gallery.
export type ScreenEntry = { id: string; title: string; route: string; platform?: 'iOS' | 'Android' };
export type ScreenGroup = { group: string; screens: ScreenEntry[] };

export const SCREEN_GROUPS: ScreenGroup[] = [
  {
    group: 'אונבורדינג',
    screens: [
      { id: '1a', title: 'כניסה', route: '/login' },
      { id: '1b', title: 'ענף ורמה', route: '/onboarding-sport' },
      { id: '6b', title: 'הרשאות', route: '/onboarding-permissions' },
    ],
  },
  {
    group: 'המפה (הגיבור)',
    screens: [
      { id: '1c', title: 'מפה — כרטיס צף', route: '/map' },
      { id: '1d', title: 'מפה — רשימה', route: '/map-list' },
      { id: '1e', title: 'מפה — מצב ריק', route: '/map-empty' },
    ],
  },
  {
    group: 'מחזור חיי מעגל',
    screens: [
      { id: '1f', title: 'פרטי מעגל', route: '/circle-detail' },
      { id: '8c', title: 'מעגל מלא / המתנה', route: '/circle-waitlist' },
      { id: '1g', title: 'פתיחת מעגל', route: '/create-circle' },
      { id: '8d', title: 'בוחר חוף', route: '/beach-picker' },
      { id: '6a', title: 'שיתוף מעגל', route: '/circle-share' },
      { id: '8a', title: 'נחיתת קישור', route: '/link-landing' },
      { id: '8b', title: 'כלי מארח', route: '/host-tools' },
      { id: '6c', title: 'דירוג אחרי משחק', route: '/rating' },
    ],
  },
  {
    group: 'צ׳אט',
    screens: [
      { id: '2a', title: 'צ׳אט מעגל', route: '/chat' },
      { id: '3a', title: 'צ׳אט מעגל', route: '/chat-android', platform: 'Android' },
    ],
  },
  {
    group: 'התראות · המעגלים שלי · פרופיל',
    screens: [
      { id: '3b', title: 'התראות', route: '/notifications' },
      { id: '4a', title: 'המעגלים שלי — קרובים', route: '/my-circles' },
      { id: '5a', title: 'קבועים', route: '/recurring' },
      { id: '5b', title: 'היסטוריה', route: '/history' },
      { id: '1h', title: 'פרופיל', route: '/profile' },
      { id: '8e', title: 'הגדרות', route: '/settings' },
    ],
  },
  {
    group: 'חוף וטורניר',
    screens: [
      { id: '7a', title: 'עמוד חוף', route: '/beach' },
      { id: '7b', title: 'עמוד טורניר', route: '/tournament' },
      { id: '7c', title: 'לוח טורניר', route: '/bracket' },
    ],
  },
  {
    group: 'מונטיזציה ומותג',
    screens: [
      { id: '1i', title: 'פיילוול', route: '/paywall' },
      { id: '6d', title: 'אייקון + Splash', route: '/brand' },
    ],
  },
  {
    group: 'Android (Material 3)',
    screens: [
      { id: '1j', title: 'מפה', route: '/map-android', platform: 'Android' },
      { id: '1k', title: 'פרטי מעגל', route: '/circle-detail-android', platform: 'Android' },
    ],
  },
];

export const ALL_SCREENS = SCREEN_GROUPS.flatMap((g) => g.screens);
