import { useState, useCallback, useRef, useEffect } from "react"

/**
 * Hook for infinite scroll pagination.
 * Returns a ref to attach to a sentinel element at the bottom of the list.
 */
export function useInfiniteScroll(options: {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}) {
  const { hasMore, isLoading, onLoadMore, threshold = 200 } = options
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { rootMargin: `${threshold}px` },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore, threshold])

  return sentinelRef
}
