import { matchesLevel, SPORT_CYCLE, LEVEL_CYCLE } from '../constants';

describe('matchesLevel', () => {
  it('matches everything when the filter is "all"', () => {
    expect(matchesLevel('בינוניים', 'all')).toBe(true);
    expect(matchesLevel('פתוח לכולם', 'all')).toBe(true);
  });

  it('matches an exact level label', () => {
    expect(matchesLevel('בינוניים', 'בינוניים')).toBe(true);
  });

  it('does not match a different specific level', () => {
    expect(matchesLevel('בינוניים', 'מתחילים')).toBe(false);
  });

  it('treats "פתוח לכולם" circles as matching any specific level filter', () => {
    expect(matchesLevel('פתוח לכולם', 'מתחילים')).toBe(true);
    expect(matchesLevel('פתוח לכולם', 'מקצוענים')).toBe(true);
  });
});

describe('cycle orders', () => {
  it('sport cycle starts with "all" and has no duplicates', () => {
    expect(SPORT_CYCLE[0]).toBe('all');
    expect(new Set(SPORT_CYCLE).size).toBe(SPORT_CYCLE.length);
  });

  it('level cycle starts with "all" and has no duplicates', () => {
    expect(LEVEL_CYCLE[0]).toBe('all');
    expect(new Set(LEVEL_CYCLE).size).toBe(LEVEL_CYCLE.length);
  });
});
