import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { CircleMarkerData } from '../data/beaches';

export type LiveMapProps = {
  markers?: CircleMarkerData[];
  showUser?: boolean;
  dim?: boolean; // muted map for the empty state
  interactive?: boolean;
  onMarkerPress?: (m: CircleMarkerData) => void;
  style?: ViewStyle;
  children?: ReactNode; // overlays rendered above the map
};
