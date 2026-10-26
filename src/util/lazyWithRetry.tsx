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
import { lazy, type ComponentType, type LazyExoticComponent } from "react"
import { retryDynamicImport } from "./retryDynamicImport"

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() => retryDynamicImport(factory))
}
