// MeKasa design tokens — "Circles in the Sand" (מעגלים בחול)
// Source of truth: README.md handoff (high-fidelity, final design intent).

export const colors = {
  petrol: '#0E4F5E', // primary
  petrolDeep: '#093A46', // paywall/splash gradient end
  petrolLight: '#155E6E',
  petrolLighter: '#1E8FA0', // sea gradient start
  ink: '#12303A', // headline/body on light
  sandBg: '#F7EFDE', // default screen background
  sandMap: '#F3EAD4', // map land
  card: '#FFFDF6', // cards, sheets, tab bar
  cardBlur: 'rgba(255,253,246,0.88)', // floating bars
  sunset: '#FF6B2C', // THE action color
  sunsetDeep: '#E85413', // text-on-light accent
  sunsetSoft: '#FFB05C', // PRO badge gradient end
  live: '#14B8A8', // live game / success / toggle-on
  liveBright: '#14D3BF', // live accent on petrol
  liveDeep: '#0E7A6E', // live text on light
  sandGlow: '#FFD9A0', // icon/accent on petrol
  amber: '#E8A13C',
  muted: '#5E7078', // secondary text
  faint: '#8A9AA2', // tertiary text / placeholders / inactive tabs
  hairline: 'rgba(14,79,94,0.09)',
  hairlineStrong: 'rgba(14,79,94,0.16)',
  outline: 'rgba(14,79,94,0.25)',
  chipBg: 'rgba(14,79,94,0.08)',
  whatsapp: '#25D366',
  danger: '#C0392B',
  gpsBlue: '#2E7CF6',
  white: '#FFFFFF',
  facebook: '#1877F2',
  // sea gradient stops
  sea1: '#1E8FA0',
  sea2: '#6ECEC9',
  sandStrip: '#F8E8BF',
  roads: '#E3D3B0',
  blocks: '#EDE0C4',
  park: '#D9E4C4',
} as const;

// Onboarding sky gradient (1a, 6c, splash, icon)
export const skyGradient = ['#FFC46B', '#FF9D52', '#F7EFDE'] as const;
export const petrolGradient = ['#0E4F5E', '#093A46'] as const;
export const beachHeroGradient = ['#0E4F5E', '#155E6E', '#1E8FA0'] as const;
export const proGradient = ['#FF6B2C', '#FFB05C'] as const;
export const iconGradient = ['#FFC46B', '#F0862F'] as const;

// Avatar fill palette (initial-letter avatars)
export const avatarPalette = [
  '#0E4F5E',
  '#14B8A8',
  '#E8A13C',
  '#7A6FB8',
  '#4E9B8F',
  '#5E7078',
] as const;

export const fonts = {
  // Karantina — Hebrew condensed display
  displayLight: 'Karantina_300Light',
  display: 'Karantina_400Regular',
  displayBold: 'Karantina_700Bold',
  // Heebo — body
  body: 'Heebo_400Regular',
  medium: 'Heebo_500Medium',
  semibold: 'Heebo_600SemiBold',
  bold: 'Heebo_700Bold',
  extrabold: 'Heebo_800ExtraBold',
} as const;

export const radii = {
  card: 22,
  cardSm: 20,
  listContainer: 18,
  chip: 22,
  chipSm: 10,
  badge: 11,
  sheet: 32,
  segmentOuter: 16,
  segmentInner: 12,
  // Android
  androidCard: 16,
  androidChip: 10,
  androidFab: 16,
  androidSearch: 28,
} as const;

export const spacing = {
  screenH: 22, // iOS horizontal padding
  screenHAndroid: 16,
  cardPad: 16,
  cardGap: 10,
  sectionGap: 20,
} as const;

export const shadows = {
  cta: {
    shadowColor: '#FF6B2C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 8,
  },
  petrolHero: {
    shadowColor: '#0E4F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 10,
  },
  floatMap: {
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 12,
  },
  card: {
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  tabBar: {
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  androidCard: {
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Section label style helper (12px, 800, faint, letter-spacing)
export const sectionLabel = {
  fontFamily: fonts.extrabold,
  fontSize: 12,
  color: colors.faint,
  letterSpacing: 0.5,
  textAlign: 'right' as const,
};

export const theme = { colors, fonts, radii, spacing, shadows } as const;
export type Theme = typeof theme;
