import { resetStore, useStore } from '../testUtils/testStore';
import { SPORT_CYCLE, LEVEL_CYCLE } from '../constants';

beforeEach(resetStore);

describe('cycleFilter', () => {
  it('starts at "all" for both sport and level', () => {
    expect(useStore.getState().filter).toEqual({ sport: 'all', level: 'all' });
  });

  it('cycles the sport filter through SPORT_CYCLE in order', () => {
    for (let i = 1; i < SPORT_CYCLE.length; i++) {
      useStore.getState().cycleFilter('sport');
      expect(useStore.getState().filter.sport).toBe(SPORT_CYCLE[i]);
    }
    // one more cycle wraps back to the start
    useStore.getState().cycleFilter('sport');
    expect(useStore.getState().filter.sport).toBe(SPORT_CYCLE[0]);
  });

  it('cycles the level filter through LEVEL_CYCLE independently of sport', () => {
    useStore.getState().cycleFilter('sport');
    useStore.getState().cycleFilter('level');
    expect(useStore.getState().filter).toEqual({ sport: SPORT_CYCLE[1], level: LEVEL_CYCLE[1] });
  });
});
