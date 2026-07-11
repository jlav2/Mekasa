// Auto-applied manual mock (node_modules package). expo-notifications calls a
// native bridge that doesn't exist under Jest; these no-op stubs keep the
// channel/category setup + copy/route helpers testable.
export enum AndroidImportance {
  UNSPECIFIED = -1000,
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
  MAX = 5,
}

export const setNotificationChannelAsync = jest.fn(() => Promise.resolve());
export const setNotificationCategoryAsync = jest.fn(() => Promise.resolve());
export const getPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));
export const requestPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));
export const getExpoPushTokenAsync = jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' }));
export const setBadgeCountAsync = jest.fn(() => Promise.resolve());
export const setNotificationHandler = jest.fn();
export const addNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
export const addNotificationReceivedListener = jest.fn(() => ({ remove: jest.fn() }));

export type NotificationResponse = {
  actionIdentifier: string;
  notification: { request: { content: { data?: Record<string, unknown> } } };
};
