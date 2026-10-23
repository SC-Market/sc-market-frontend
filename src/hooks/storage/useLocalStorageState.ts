import { useCallback, useSyncExternalStore } from "react"

// Same-tab writes made through this hook. `storage` events only fire in other
// tabs, and cross-tab syncing is deliberately not done here.
const listeners = new Map<string, Set<() => void>>()
// Values set while localStorage is unavailable (blocked or full), so the
// setter still takes effect for the rest of the page's lifetime.
const unpersisted = new Map<string, string>()

function readRaw(key: string): string | null {
  const pending = unpersisted.get(key)
  if (pending !== undefined) return pending
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    unpersisted.delete(key)
  } catch {
    unpersisted.set(key, value)
  }
  listeners.get(key)?.forEach((notify) => notify())
}

const getServerSnapshot = () => null

/**
 * A string-enum preference persisted in localStorage, e.g. a grid/list toggle.
 *
 * Reads go through `useSyncExternalStore` with a `null` server snapshot, so a
 * server render and the hydration render both use `defaultValue`, and the
 * stored value is applied right after hydration. A client-only render (the
 * SPA today) reads the stored value on the first render, exactly like a
 * `useState(() => localStorage.getItem(key))` initializer did.
 *
 * Stored values not in `allowed` (missing, stale, or hand-edited) read as
 * `defaultValue`. Components using the same key stay in sync within the tab.
 */
export function useLocalStorageState<T extends string>(
  key: string,
  defaultValue: T,
  allowed: readonly T[],
): [T, (value: T) => void] {
  const subscribe = useCallback(
    (notify: () => void) => {
      let keyListeners = listeners.get(key)
      if (!keyListeners) {
        keyListeners = new Set()
        listeners.set(key, keyListeners)
      }
      keyListeners.add(notify)
      return () => {
        keyListeners.delete(notify)
        if (keyListeners.size === 0) listeners.delete(key)
      }
    },
    [key],
  )
  const getSnapshot = useCallback(() => readRaw(key), [key])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value =
    raw !== null && (allowed as readonly string[]).includes(raw)
      ? (raw as T)
      : defaultValue

  const setValue = useCallback((next: T) => writeRaw(key, next), [key])

  return [value, setValue]
}
