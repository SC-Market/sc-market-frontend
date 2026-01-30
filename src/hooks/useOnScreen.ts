import { RefObject, useEffect, useMemo, useState } from "react"

export function useOnScreen(
  ref?: RefObject<HTMLElement | null> | null,
): boolean {
  if (!ref) {
    return false
  }

  const [isIntersecting, setIntersecting] = useState(false)

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting),
      ),
    [ref],
  )

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  return isIntersecting
}
