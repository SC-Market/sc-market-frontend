/**
 * React.lazy with stale-chunk recovery. Use this instead of `lazy()` /
 * `React.lazy()` (a test in src/util/__tests__/lazyWithRetry.guard.test.ts
 * fails on new bare calls).
 *
 * React.lazy calls its factory once and caches a rejection for good, so a
 * chunk that 404s after a deploy would otherwise throw to the nearest error
 * boundary on the first failure. Here the factory goes through
 * retryDynamicImport: retried in place, then the shared rate-limited reload.
 */
import {
  createElement,
  lazy,
  useState,
  type ComponentProps,
  type ComponentType,
  type LazyExoticComponent,
} from "react"
import { retryDynamicImport } from "./retryDynamicImport"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() => retryDynamicImport(factory))
}

/** A lazily loaded component whose chunk can be loaded ahead of its render. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export type PreloadableComponent<T extends ComponentType<any>> = ComponentType<
  ComponentProps<T>
> & {
  /** Start loading the chunk (cached; a failure is retried on the next call). */
  preload: () => Promise<void>
}

/**
 * lazyWithRetry, plus `preload()`. Once the chunk is in, the component renders
 * it directly instead of through React.lazy, which suspends at least once even
 * for a chunk that has already arrived: that one suspension shows the nearest
 * Suspense fallback, i.e. one more skeleton swap. A parent that preloads its
 * children's chunks in parallel with its own gets them rendered with it.
 *
 * Whether to go through React.lazy is decided once per mount, so a mounted
 * component is never swapped (and remounted) when its chunk arrives.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  let loaded: T | null = null
  let pending: Promise<{ default: T }> | null = null

  function load(): Promise<{ default: T }> {
    if (!pending) {
      pending = retryDynamicImport(factory).then(
        (module) => {
          loaded = module.default
          return module
        },
        (error: unknown) => {
          pending = null
          throw error
        },
      )
    }
    return pending
  }

  const LazyComponent = lazy(load)

  function Preloadable(props: ComponentProps<T>) {
    const [Component] = useState<ComponentType<ComponentProps<T>>>(
      () => (loaded ?? LazyComponent) as ComponentType<ComponentProps<T>>,
    )
    return createElement(Component, props)
  }

  return Object.assign(Preloadable, {
    preload: () => load().then(() => undefined),
  })
}
