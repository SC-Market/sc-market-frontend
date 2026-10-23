import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import { useHydrated } from "./useHydrated"

/**
 * `useState(initial)` for state seeded from a value that differs between the
 * server and the browser, such as a breakpoint (`useState(!isMobile)`).
 *
 * During a server or hydration render, breakpoint hooks return the server
 * default (desktop), so a plain `useState(!isMobile)` would keep the desktop
 * seed on phones after `hydrateRoot`. This hook re-seeds the state once,
 * with the real value, right after hydration. After that the state is
 * ordinary `useState`: later changes to `initial` are ignored, as before.
 *
 * In a client-only `createRoot` render (the SPA today), `useHydrated()` is
 * already `true` on the first render, the seed is the real value, and the
 * effect never sets state, so it behaves exactly like `useState(initial)`.
 */
export function useHydratedInitialState<T>(
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const hydrated = useHydrated()
  const [state, setState] = useState(initial)
  const seededDuringHydration = useRef(!hydrated)

  useEffect(() => {
    if (hydrated && seededDuringHydration.current) {
      seededDuringHydration.current = false
      setState(initial)
    }
  }, [hydrated, initial])

  return [state, setState]
}
