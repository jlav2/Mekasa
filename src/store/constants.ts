import type { Sport } from '../data/models';

// Cycle orders for the two functional map chips
export const SPORT_CYCLE: (Sport | 'all')[] = ['all', 'footvolley', 'altinha', 'volleyball'];
export const LEVEL_CYCLE: (string | 'all')[] = ['all', 'מתחילים', 'בינוניים', 'מקצוענים'];

// Level match for the map filter: circles open to all levels ('פתוח לכולם')
// match every selection — otherwise picking any level hides them entirely.
export const matchesLevel = (levelLabel: string, level: string | 'all') =>
  level === 'all' || levelLabel === level || levelLabel === 'פתוח לכולם';
