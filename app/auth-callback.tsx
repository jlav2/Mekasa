import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { sessionInfo } from '../src/data/backend';
import { colors } from '../src/theme';

// OAuth redirect landing (web). supabase-js parses the code/hash from the URL on
// load (detectSessionInUrl); we then route based on whether a session exists.
export default function AuthCallback() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let tries = 0;
    const tick = () => {
      sessionInfo().then((info) => {
        if (info) setTarget('/map');
        else if (tries++ < 10) setTimeout(tick, 300);
        else setTarget('/login');
      });
    };
    tick();
  }, []);

  if (!target) return <View style={{ flex: 1, backgroundColor: colors.sandBg }} />;
  return <Redirect href={target as any} />;
}
