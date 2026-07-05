import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { sessionInfo } from '../src/data/backend';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { colors } from '../src/theme';

// App entry: returning users with a live session skip straight to the map;
// everyone else starts at login (1a). The gallery lives at /gallery.
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setTarget('/login');
      return;
    }
    sessionInfo().then((info) => setTarget(info ? '/map' : '/login'));
  }, []);

  if (!target) return <View style={{ flex: 1, backgroundColor: colors.sandBg }} />;
  return <Redirect href={target as any} />;
}
