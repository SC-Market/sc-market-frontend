import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * `false` while rendering on the server and during the hydration render,
 * `true` everywhere else.
 *
 * React only consults `getServerSnapshot` for server rendering and hydration.
 * A client-only `createRoot` render (what the SPA does today) reads
 * `getSnapshot` from the very first render, so gating on this hook changes
 * nothing for the SPA. Under `hydrateRoot`, the first client render matches
 * the server HTML, then React re-renders with `true`.
 *
 * Use it to gate output that depends on browser-only state (localStorage,
 * the cached profile, `window`) so the server and first client render agree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
