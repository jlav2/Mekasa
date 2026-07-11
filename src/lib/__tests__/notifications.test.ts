import {
  urlToRoute,
  routeFromNotification,
  bannerKindFromCategory,
  PUSH_COPY,
  CATEGORY,
} from '../notifications';

describe('urlToRoute (deep link → expo-router path)', () => {
  it('maps a circle link to the real /c/[id] route (not the alias)', () => {
    expect(urlToRoute('mekasa://circle/frishman')).toBe('/c/frishman');
  });
  it('maps chat', () => {
    expect(urlToRoute('mekasa://chat/abc')).toBe('/chat?circle=abc');
  });
  it('maps manage → host-tools', () => {
    expect(urlToRoute('mekasa://circle/x/manage')).toBe('/host-tools');
  });
  it('maps rsvp → the circle detail', () => {
    expect(urlToRoute('mekasa://circle/x/rsvp')).toBe('/c/x');
  });
  it('maps claim to the waitlist screen', () => {
    expect(urlToRoute('mekasa://claim/tok123')).toBe('/circle-waitlist?claim=tok123');
  });
  it('maps tournament', () => {
    expect(urlToRoute('mekasa://tournament/t1')).toBe('/tournament');
  });
  it('returns null for a non-mekasa url', () => {
    expect(urlToRoute('https://example.com')).toBeNull();
  });
});

describe('routeFromNotification', () => {
  const make = (actionIdentifier: string, url?: string) =>
    ({ actionIdentifier, notification: { request: { content: { data: url ? { url } : {} } } } }) as any;

  it('does not navigate for background actions', () => {
    expect(routeFromNotification(make('host.approve', 'mekasa://circle/x'))).toBeNull();
    expect(routeFromNotification(make('rsvp.yes', 'mekasa://circle/x'))).toBeNull();
  });
  it('routes a plain tap by the payload url', () => {
    expect(routeFromNotification(make('expo.modules.notifications.actions.DEFAULT', 'mekasa://chat/x'))).toBe(
      '/chat?circle=x',
    );
  });
});

describe('bannerKindFromCategory', () => {
  it('maps categories to banner kinds', () => {
    expect(bannerKindFromCategory(CATEGORY.claim)).toBe('claim');
    expect(bannerKindFromCategory(CATEGORY.host)).toBe('hostRequest');
    expect(bannerKindFromCategory(CATEGORY.chat)).toBe('chat');
  });
  it('returns null for rsvp (notifications tab only, no in-app banner)', () => {
    expect(bannerKindFromCategory(CATEGORY.rsvp)).toBeNull();
    expect(bannerKindFromCategory(undefined)).toBeNull();
  });
});

describe('PUSH_COPY (matrix source of truth)', () => {
  it('claim copy carries the 5-minute framing', () => {
    const c = PUSH_COPY.claimOpened({ circle: "פוצ'יוולי", beach: 'פרישמן', time: '10:00', until: '9:46' });
    expect(c.title).toContain('5 דקות');
    expect(c.body).toContain('9:46');
  });
});
