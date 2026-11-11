import { useSyncExternalStore } from "react"

let pageLoadSeed: number | null = null

/** This page load's seed: drawn once, then the same until the next load. */
export function getPageLoadSeed(): number {
  if (pageLoadSeed === null) {
    const values = new Uint32Array(1)
    try {
      crypto.getRandomValues(values)
      pageLoadSeed = values[0]
    } catch {
      pageLoadSeed = Math.floor(Math.random() * 2 ** 32)
    }
  }
  return pageLoadSeed
}

/** Test hook: draw a new seed on the next read. */
export function resetPageLoadSeed(): void {
  pageLoadSeed = null
}

/** The server render's seed (and the hydration render's, matching it). */
export const SERVER_AD_LAYOUT_SEED = 0

const subscribe = () => () => {}

/**
 * The seed for where the ads go in the market grid (insertAds, adPositions):
 * one per page load, so the ads land in different spots on each visit but
 * stay put through re-renders, refetches, filtering and pagination while the
 * page is open.
 *
 * The SPA (createRoot, what /market ships) reads the page-load seed from the
 * very first render, so the ads are placed once, with no shift. Under
 * hydrateRoot the server and the hydration render use SERVER_AD_LAYOUT_SEED,
 * so they agree, and the page-load seed applies right after.
 */
export function useAdLayoutSeed(): number {
  return useSyncExternalStore(
    subscribe,
    getPageLoadSeed,
    () => SERVER_AD_LAYOUT_SEED,
  )
}
