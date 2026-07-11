// Native live map — react-native-maps (Apple Maps on iOS, Google on Android).
// Google provider gets a customMapStyle matched to the sand/sea palette;
// Apple Maps has no style API (default cartography, muted mode still applies).
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapMarker, markerA11yLabel } from './MapMarker';
import { colors } from '../theme';
import { haptic } from '../theme/motion';
import { TLV_COAST, USER_LOCATION, CIRCLE_MARKERS } from '../data/beaches';
import type { CircleMarkerData } from '../data/beaches';
import type { LiveMapProps } from './LiveMap.types';

// Google Maps style JSON — sand/sea palette from the design tokens.
const SAND_SEA_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F3EAD4' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A9282' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F7EFDE' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#5FC4C0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1E8FA0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E3D3B0' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D9E4C4' }, { visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#EDE0C4' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
];

// A map marker re-rasterizes its custom view on every frame while
// tracksViewChanges is true — with an animated glyph that means a permanent
// redraw loop. Keep it true just long enough to paint, then switch it off; flip
// back on only when the marker's visual data actually changes (e.g. realtime
// player-count updates) so the new state rasterizes once.
function CircleMarker({
  m,
  onPress,
}: {
  m: CircleMarkerData;
  onPress?: (m: CircleMarkerData) => void;
}) {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    setTracks(true);
    const t = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(t);
  }, [m.state, m.count, m.label, m.size, m.variant, m.rotate]);

  return (
    <Marker
      coordinate={{ latitude: m.lat, longitude: m.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracks}
      accessibilityLabel={markerA11yLabel(m.state, m.count)}
      onPress={() => {
        haptic.medium(); // spec 03: marker select
        onPress?.(m);
      }}
    >
      <MapMarker
        state={m.state}
        size={m.size}
        count={m.count}
        label={m.label}
        variant={m.variant}
        rotate={m.rotate}
      />
    </Marker>
  );
}

export function LiveMap({
  markers = CIRCLE_MARKERS,
  showUser = true,
  dim = false,
  interactive = true,
  onMarkerPress,
  style,
  children,
}: LiveMapProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sandMap }, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={TLV_COAST}
        customMapStyle={SAND_SEA_STYLE}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
        showsPointsOfInterests={false}
      >
        {markers.map((m) => (
          <CircleMarker key={m.id} m={m} onPress={onMarkerPress} />
        ))}
        {showUser && (
          <Marker
            coordinate={{ latitude: USER_LOCATION.lat, longitude: USER_LOCATION.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.userDot} />
          </Marker>
        )}
      </MapView>
      {dim && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247,239,222,0.45)' }]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gpsBlue,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#12303A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
