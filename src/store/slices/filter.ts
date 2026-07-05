import { LEVEL_CYCLE, SPORT_CYCLE } from '../constants';
import type { AppState, Set } from '../types';

type FilterSlice = Pick<AppState, 'filter' | 'cycleFilter'>;

export const createFilterSlice = (set: Set): FilterSlice => ({
  filter: { sport: 'all', level: 'all' },

  cycleFilter: (key) =>
    set((s) => {
      const cycle = key === 'sport' ? SPORT_CYCLE : LEVEL_CYCLE;
      const i = cycle.indexOf(s.filter[key] as never);
      const next = cycle[(i + 1) % cycle.length];
      return { filter: { ...s.filter, [key]: next } };
    }),
});
