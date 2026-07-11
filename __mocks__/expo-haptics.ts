// Auto-applied manual mock (node_modules package → picked up without jest.mock()).
// The real module calls into a native haptics bridge that doesn't exist under
// Jest; the app-level `haptic` wrapper (src/theme/motion.ts) already no-ops off
// iOS/Android, but component tests run with Platform.OS === 'ios', so the calls
// DO fire. These no-op resolved promises keep them harmless and assertable.
export const selectionAsync = jest.fn(() => Promise.resolve());
export const impactAsync = jest.fn(() => Promise.resolve());
export const notificationAsync = jest.fn(() => Promise.resolve());

export enum ImpactFeedbackStyle {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Rigid = 'rigid',
  Soft = 'soft',
}

export enum NotificationFeedbackType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}
