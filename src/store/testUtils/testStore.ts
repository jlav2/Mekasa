// Shared test harness — reuses the REAL composed store (src/store/index.ts) so
// slice tests exercise the exact production wiring, not a duplicated stand-in.
// Each test file gets its own fresh module registry (and therefore its own
// pristine `useStore` singleton), so this only needs to guard against bleed
// *within* a single file's it() blocks.
import { useStore } from '../index';
import type { AppState } from '../types';

const INITIAL_STATE: AppState = useStore.getState();

export function resetStore() {
  useStore.setState(INITIAL_STATE, true);
}

export { useStore };
