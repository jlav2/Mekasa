import { Redirect } from 'expo-router';

// Canvas screen 2a is the frishman circle — the real screen now lives at /c/[id].
export default function CircleDetailAlias() {
  return <Redirect href="/c/frishman" />;
}
