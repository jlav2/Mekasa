import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { sessionInfo } from '../src/data/backend';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { BrandSplash } from '../src/components';

// Minimum time the branded splash stays up so it reads as a deliberate splash
// rather than flashing away — the session check is near-instant in offline
// fixture mode, so without this the animated splash (9-6d) would barely show.
const MIN_SPLASH_MS = 1100;

// App entry: returning users with a live session skip straight to the map;
// everyone else starts at login (1a). The gallery lives at /gallery.
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setTarget('/login');
      return;
    }
    sessionInfo().then((info) => setTarget(info ? '/map' : '/login'));
  }, []);

  // Hold the branded splash until BOTH the route is resolved and the minimum
  // display time has elapsed.
  if (!target || !minElapsed) return <BrandSplash />;
  return <Redirect href={target as any} />;
}
