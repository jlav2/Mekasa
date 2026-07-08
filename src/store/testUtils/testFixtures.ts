import type { Circle } from '../../data/models';

export function makeCircle(overrides: Partial<Circle> = {}): Circle {
  return {
    id: 'test-circle',
    sport: 'footvolley',
    sportLabel: "פוצ'יוולי",
    beachId: 'frishman',
    beachName: 'חוף פרישמן',
    court: 'מגרש',
    levelLabel: 'בינוניים',
    capacity: 2,
    players: [],
    waitlist: [],
    state: 'missing',
    isOpen: true,
    hostId: 'other-host',
    hostName: 'מארח',
    startLabel: 'עכשיו',
    distanceLabel: "100 מ'",
    lat: 32.08,
    lng: 34.77,
    ...overrides,
  };
}
