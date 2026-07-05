// Real Tel Aviv beach coordinates for the live map.
import type { MarkerState } from '../components/MapMarker';

export type CircleMarkerData = {
  id: string;
  beach: string;
  lat: number;
  lng: number;
  state: MarkerState;
  size: number; // 44–72 by proximity/importance
  count?: string;
  label?: string;
  variant?: number;
  rotate?: number;
};

// Map camera: Tel Aviv coastline
export const TLV_COAST = {
  latitude: 32.0825,
  longitude: 34.7695,
  latitudeDelta: 0.022,
  longitudeDelta: 0.014,
} as const;

export const CIRCLE_MARKERS: CircleMarkerData[] = [
  {
    id: 'frishman',
    beach: 'חוף פרישמן',
    lat: 32.0809,
    lng: 34.767,
    state: 'missing',
    size: 72,
    count: '3/4',
    label: 'חסר 1',
    variant: 0,
    rotate: -30,
  },
  {
    id: 'gordon',
    beach: 'חוף גורדון',
    lat: 32.0846,
    lng: 34.7686,
    state: 'live',
    size: 56,
    count: '4/4',
    variant: 1,
    rotate: 20,
  },
  {
    id: 'hilton',
    beach: 'חוף הילטון',
    lat: 32.0894,
    lng: 34.7706,
    state: 'tournament',
    size: 48,
    variant: 2,
    rotate: -60,
  },
  {
    id: 'metzitzim',
    beach: 'חוף מציצים',
    lat: 32.0966,
    lng: 34.7724,
    state: 'live',
    size: 44,
    count: '6/6',
    variant: 3,
    rotate: 45,
  },
];

// Demo user location — Bograshov beach area
export const USER_LOCATION = { lat: 32.0779, lng: 34.7662 } as const;

// Selectable beaches for create-circle / beach-picker
export type BeachOption = { id: string; name: string; court: string; lat: number; lng: number };
export const BEACH_OPTIONS: BeachOption[] = [
  { id: 'frishman', name: 'חוף פרישמן', court: 'מגרש 2, ליד המציל', lat: 32.0809, lng: 34.767 },
  { id: 'gordon', name: 'חוף גורדון', court: 'ליד המים', lat: 32.0846, lng: 34.7686 },
  { id: 'hilton', name: 'חוף הילטון', court: 'מגרש 1', lat: 32.0894, lng: 34.7706 },
  { id: 'metzitzim', name: 'מצודת הים', court: 'מגרש 1', lat: 32.0966, lng: 34.7724 },
  { id: 'bograshov', name: 'חוף בוגרשוב', court: 'על החול', lat: 32.0785, lng: 34.7655 },
];

export function distanceLabelFrom(lat: number, lng: number): string {
  // haversine from the demo user location
  const R = 6371000;
  const dLat = ((lat - USER_LOCATION.lat) * Math.PI) / 180;
  const dLng = ((lng - USER_LOCATION.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((USER_LOCATION.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const m = 2 * R * Math.asin(Math.sqrt(a));
  return m < 950 ? `${Math.max(50, Math.round(m / 50) * 50)} מ' ממך` : `${(m / 1000).toFixed(1)} ק"מ`;
}

// Live markers derived from store circles (only actionable states are mapped;
// scheduled circles stay off the map, matching the 1c legend). Known seeded
// ids keep their hand-tuned design look; new circles get stable generated
// variance from their id hash.
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

type CircleLike = {
  id: string;
  beachName: string;
  lat: number;
  lng: number;
  state: string;
  capacity: number;
  players: unknown[];
};

export function markersFromCircles(circles: CircleLike[]): CircleMarkerData[] {
  const tuned = new Map(CIRCLE_MARKERS.map((m) => [m.id, m]));
  const live = circles
    .filter((c) => c.state === 'live' || c.state === 'missing')
    .map((c): CircleMarkerData => {
      const missing = c.capacity - c.players.length;
      const base = tuned.get(c.id);
      const h = Math.abs(hash(c.id));
      return {
        id: c.id,
        beach: c.beachName,
        lat: c.lat,
        lng: c.lng,
        state: c.state === 'live' ? 'live' : 'missing',
        size: base?.size ?? 60,
        count: `${c.players.length}/${c.capacity}`,
        label: c.state === 'missing' ? (missing === 1 ? 'חסר 1' : `חסרים ${missing}`) : undefined,
        variant: base?.variant ?? h % 5,
        rotate: base?.rotate ?? ((h % 12) * 30 - 180),
      };
    });
  const tournament = CIRCLE_MARKERS.find((m) => m.state === 'tournament');
  return tournament ? [...live, tournament] : live;
}
