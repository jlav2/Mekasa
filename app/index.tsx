import { Redirect } from 'expo-router';

// App entry: the real flow starts at login (1a).
// The full screen gallery lives at /gallery (also reachable from Settings).
export default function Index() {
  return <Redirect href="/login" />;
}
