import { useState, useEffect, useRef } from "react"
import throttle from "lodash/throttle"

/**
 * Custom hook that throttles a value update
 * @param value - The value to throttle
 * @param delay - The throttle delay in milliseconds
 * @returns The throttled value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const throttledUpdate = useRef(throttle((newValue: T) => {
    setThrottledValue(newValue)
  }, delay))

  useEffect(() => {
    throttledUpdate.current(value)
  }, [value])

  useEffect(() => {
    return () => {
      throttledUpdate.current.cancel()
    }
  }, [])

  return throttledValue
}
