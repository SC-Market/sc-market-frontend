import { useEffect, useRef, useState, useCallback } from "react"
import { prefetchModule } from "../../util/prefetch"

// Shared observer pool to avoid creating multiple observers
class SharedIntersectionObserver {
  private static instance: SharedIntersectionObserver
  private observers = new Map<string, IntersectionObserver>()
  private callbacks = new Map<string, Set<() => void>>()

  static getInstance(): SharedIntersectionObserver {
    if (!SharedIntersectionObserver.instance) {
      SharedIntersectionObserver.instance = new SharedIntersectionObserver()
    }
    return SharedIntersectionObserver.instance
  }

  private createObserver(
    options: IntersectionObserverInit,
  ): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute("data-prefetch-key")
          if (key) {
            const callbacks = this.callbacks.get(key)
            if (callbacks) {
              callbacks.forEach((callback) => callback())
              // Remove callbacks after execution to prevent memory leaks
              this.callbacks.delete(key)
            }
          }
        }
      })
    }, options)
  }

  observe(
    element: HTMLElement,
    callback: () => void,
    options: IntersectionObserverInit = {},
  ): () => void {
    const key = `prefetch-${Math.random().toString(36).substr(2, 9)}`
    element.setAttribute("data-prefetch-key", key)

    // Create observer if it doesn't exist for these options
    const optionsKey = JSON.stringify(options)
    if (!this.observers.has(optionsKey)) {
      this.observers.set(optionsKey, this.createObserver(options))
    }

    const observer = this.observers.get(optionsKey)!

    // Store callback
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set())
    }
    this.callbacks.get(key)!.add(callback)

    observer.observe(element)

    // Return cleanup function
    return () => {
      observer.unobserve(element)
      this.callbacks.delete(key)
      element.removeAttribute("data-prefetch-key")
    }
  }

  // Cleanup all observers (useful for testing or app cleanup)
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
    this.callbacks.clear()
  }
}

interface UsePrefetchOnVisibleOptions {
  prefetchFn: () => Promise<any>
  prefetchKey: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  // Performance options
  debounceMs?: number
  maxConcurrent?: number
}

// Global prefetch queue to limit concurrent prefetches
class PrefetchQueue {
  private static instance: PrefetchQueue
  private queue: Array<() => Promise<void>> = []
  private running = 0
  private maxConcurrent = 3

  static getInstance(): PrefetchQueue {
    if (!PrefetchQueue.instance) {
      PrefetchQueue.instance = new PrefetchQueue()
    }
    return PrefetchQueue.instance
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max
  }

  async add(prefetchFn: () => Promise<void>): Promise<void> {
    if (this.running >= this.maxConcurrent) {
      // Queue the prefetch
      await new Promise<void>((resolve) => {
        this.queue.push(async () => {
          await prefetchFn()
          resolve()
        })
      })
    } else {
      this.running++
      try {
        await prefetchFn()
      } finally {
        this.running--
        this.processQueue()
      }
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift()
      if (next) {
        this.running++
        try {
          await next()
        } finally {
          this.running--
          this.processQueue()
        }
      }
    }
  }
}

export function usePrefetchOnVisible({
  prefetchFn,
  prefetchKey,
  threshold = 0.1,
  rootMargin = "100px",
  triggerOnce = true,
  debounceMs = 100,
  maxConcurrent = 3,
}: UsePrefetchOnVisibleOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const [hasPrefetched, setHasPrefetched] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Debounced prefetch function
  const debouncedPrefetch = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      if (hasPrefetched) return

      try {
        const queue = PrefetchQueue.getInstance()
        queue.setMaxConcurrent(maxConcurrent)

        await queue.add(async () => {
          await prefetchModule(prefetchFn, prefetchKey)
          setHasPrefetched(true)
          console.debug(`Prefetched on visibility: ${prefetchKey}`)
        })
      } catch (error) {
        console.warn(`Failed to prefetch on visibility ${prefetchKey}:`, error)
      }
    }, debounceMs)
  }, [prefetchFn, prefetchKey, hasPrefetched, debounceMs, maxConcurrent])

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasPrefetched) return

    const sharedObserver = SharedIntersectionObserver.getInstance()

    cleanupRef.current = sharedObserver.observe(element, debouncedPrefetch, {
      threshold,
      rootMargin,
    })

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debouncedPrefetch, threshold, rootMargin, hasPrefetched])

  return { elementRef, hasPrefetched }
}

// Export the shared observer for cleanup purposes
export { SharedIntersectionObserver, PrefetchQueue }
