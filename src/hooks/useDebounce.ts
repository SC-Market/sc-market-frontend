import { useState, useEffect, useMemo } from "react"
import debounce from "lodash/debounce"

/**
 * Custom hook that debounces a value update.
 *
 * The returned value only updates after `delay` ms have elapsed without the
 * input value changing (trailing edge). This is the behavior every consumer
 * wants for search inputs: fire the network request once the user pauses,
 * not on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const debouncedUpdate = useMemo(
    () => debounce((newValue: T) => setDebouncedValue(newValue), delay),
    [delay],
  )

  useEffect(() => {
    debouncedUpdate(value)
  }, [value, debouncedUpdate])

  // Cancel a pending update on unmount (and when the delay changes).
  useEffect(() => () => debouncedUpdate.cancel(), [debouncedUpdate])

  return debouncedValue
}
