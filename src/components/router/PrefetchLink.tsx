import React, { useRef, useEffect } from "react"
import { Link, LinkProps } from "react-router-dom"
import { prefetchModule } from "../../util/prefetch"

interface PrefetchLinkProps extends LinkProps {
  prefetchFn?: () => Promise<any>
  prefetchKey?: string
  prefetchDelay?: number
}

export function PrefetchLink({
  prefetchFn,
  prefetchKey,
  prefetchDelay = 100,
  children,
  ...linkProps
}: PrefetchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const linkElement = linkRef.current
    if (!linkElement || !prefetchFn || !prefetchKey) return

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
        prefetchModule(prefetchFn, prefetchKey)
      }, prefetchDelay)
    }

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    linkElement.addEventListener("mouseenter", handleMouseEnter)
    linkElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      linkElement.removeEventListener("mouseenter", handleMouseEnter)
      linkElement.removeEventListener("mouseleave", handleMouseLeave)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [prefetchFn, prefetchKey, prefetchDelay])

  return (
    <Link ref={linkRef} {...linkProps}>
      {children}
    </Link>
  )
}
