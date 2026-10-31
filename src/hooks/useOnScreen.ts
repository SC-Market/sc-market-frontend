import { RefObject, useEffect, useState } from "react"

/**
 * Whether `ref`'s element is in the viewport. False until the browser says
 * otherwise (and always on the server: the observer is created in an
 * effect, never during render, so server renders don't need
 * IntersectionObserver).
 */
export function useOnScreen(
  ref?: RefObject<HTMLElement | null> | null,
): boolean {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const element = ref?.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return ref ? isIntersecting : false
}
