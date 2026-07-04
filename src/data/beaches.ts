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
