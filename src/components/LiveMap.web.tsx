// Web live map — MapLibre GL over a free Carto vector basemap, recolored at
// runtime to the design's sand/sea palette. Sand-ring markers are real
// geo-anchored maplibre Markers with the RN components portaled in.
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import { MapMarker } from './MapMarker';
import { colors } from '../theme';
import { TLV_COAST, USER_LOCATION, CIRCLE_MARKERS } from '../data/beaches';
import type { LiveMapProps } from './LiveMap.types';

const BASE_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

// Minimal maplibre CSS (markers + canvas) so we don't depend on CSS imports.
const MAPLIBRE_CSS = `
.maplibregl-map{overflow:hidden;font:inherit}
.maplibregl-canvas-container,.maplibregl-canvas{position:absolute;left:0;top:0}
.maplibregl-canvas{outline:none}
.maplibregl-marker{position:absolute;top:0;left:0;will-change:transform}
.maplibregl-ctrl-attrib{position:absolute;bottom:0;left:0;font:10px/1.4 Heebo,sans-serif;color:#8A9AA2;background:rgba(255,253,246,.7);padding:1px 6px;border-radius:0 6px 0 0}
.maplibregl-ctrl-attrib a{color:#8A9AA2;text-decoration:none}
`;

function injectCss() {
  if (document.getElementById('maplibre-css')) return;
  const el = document.createElement('style');
  el.id = 'maplibre-css';
  el.textContent = MAPLIBRE_CSS;
  document.head.appendChild(el);
}

// Recolor the basemap to the design palette.
function applyPalette(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', colors.sandMap);
      } else if (layer.type === 'fill') {
        if (id.includes('water') || id.includes('ocean')) {
          map.setPaintProperty(layer.id, 'fill-color', '#5FC4C0');
        } else if (id.includes('park') || id.includes('green') || id.includes('grass') || id.includes('wood') || id.includes('landcover')) {
          map.setPaintProperty(layer.id, 'fill-color', colors.park);
        } else if (id.includes('building')) {
          map.setPaintProperty(layer.id, 'fill-color', colors.blocks);
          map.setPaintProperty(layer.id, 'fill-outline-color', colors.roads);
        } else if (id.includes('sand') || id.includes('beach')) {
          map.setPaintProperty(layer.id, 'fill-color', colors.sandStrip);
        } else {
          map.setPaintProperty(layer.id, 'fill-color', colors.sandMap);
        }
      } else if (layer.type === 'line') {
        if (id.includes('water') || id.includes('river')) {
          map.setPaintProperty(layer.id, 'line-color', '#5FC4C0');
        } else {
          map.setPaintProperty(layer.id, 'line-color', colors.roads);
        }
      } else if (layer.type === 'symbol') {
        map.setPaintProperty(layer.id, 'text-color', '#8A9282');
        map.setPaintProperty(layer.id, 'text-halo-color', colors.sandBg);
        // hide icons (POI pins etc.) — keep the map quiet like the design
        map.setPaintProperty(layer.id, 'icon-opacity', 0);
      }
    } catch {
      // some layers reject certain paint props — skip quietly
    }
  }
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
  const containerRef = useRef<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const [markerEls, setMarkerEls] = useState<Record<string, HTMLElement>>({});

  useEffect(() => {
    const node: HTMLElement | null = containerRef.current as any;
    if (!node) return;
    injectCss();
    // pin the container inline — inline styles win over any stylesheet order
    Object.assign(node.style, { position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' });

    const map = new maplibregl.Map({
      container: node,
      style: BASE_STYLE,
      center: [TLV_COAST.longitude, TLV_COAST.latitude],
      zoom: 13.6,
      attributionControl: { compact: true } as any,
      interactive,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    if (typeof __DEV__ !== 'undefined' && __DEV__) (window as any).__mekasaMap = map;
    // 'style.load' fires as soon as the style JSON is parsed (the 'load' event
    // can be held up indefinitely by pending resources); 'idle' is the safety net.
    // once-only: the base style is set at mount and never swapped, so the palette
    // only needs applying a single time (whichever of these fires first).
    const restyle = () => applyPalette(map);
    map.once('style.load', restyle);
    map.once('idle', restyle);
    if (map.isStyleLoaded()) restyle();

    // user dot
    if (showUser) {
      const u = document.createElement('div');
      u.style.cssText =
        'width:18px;height:18px;border-radius:50%;background:' +
        colors.gpsBlue +
        ';border:3px solid #fff;box-shadow:0 2px 6px rgba(18,48,58,.25);z-index:1';
      new maplibregl.Marker({ element: u, anchor: 'center' })
        .setLngLat([USER_LOCATION.lng, USER_LOCATION.lat])
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // map instance + user dot are static per screen — mount once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // circle markers — reconcile maplibre Marker instances against the (live)
  // markers prop, so circles added/removed/filtered after mount update without
  // a remount. Diffing is imperative against markersRef (idempotent under React
  // 19's double effect invocation); markerEls is a pure state set for the portals.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = markersRef.current;
    const wanted = new Set(markers.map((m) => m.id));
    const nextEls: Record<string, HTMLElement> = {};
    for (const m of markers) {
      let marker = existing[m.id];
      if (!marker) {
        const el = document.createElement('div');
        el.style.zIndex = '2';
        marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([m.lng, m.lat]).addTo(map);
        existing[m.id] = marker;
      } else {
        marker.setLngLat([m.lng, m.lat]);
      }
      nextEls[m.id] = marker.getElement();
    }
    for (const id of Object.keys(existing)) {
      if (!wanted.has(id)) {
        existing[id].remove();
        delete existing[id];
      }
    }
    setMarkerEls(nextEls);
  }, [markers]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sandMap }, style]}>
      <View ref={containerRef} style={StyleSheet.absoluteFill} />
      {/* portal the RN sand-ring markers into maplibre's marker elements */}
      {markers.map((m) =>
        markerEls[m.id]
          ? createPortal(
              <Pressable onPress={() => onMarkerPress?.(m)} style={{ cursor: 'pointer' } as any}>
                <MapMarker
                  state={m.state}
                  size={m.size}
                  count={m.count}
                  label={m.label}
                  variant={m.variant}
                  rotate={m.rotate}
                />
              </Pressable>,
              markerEls[m.id]
            )
          : null
      )}
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
