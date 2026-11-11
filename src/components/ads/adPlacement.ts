/**
 * Where the ads go in a page of listings. The number of ad slots follows the
 * page's size (one per AD_FREQUENCY listings, the first after
 * AD_FIRST_POSITION); where each slot lands is drawn from a seeded random
 * (`layoutSeed`, one per page load: see useAdLayoutSeed), so an ad isn't in
 * the same spot on every visit, yet stays put for as long as the page is
 * open: the same seed and page size always give the same slots.
 *
 * The rule: the page's listings are split into one equal stretch per slot,
 * and each slot lands anywhere in its stretch, but
 * - never before the AD_MIN_LEAD-th listing (an ad never opens the grid),
 * - never after the last listing (an ad never closes it),
 * - at least AD_MIN_GAP listings from the slot before it (half the gap kept
 *   free at each inner stretch boundary), so two ads are never neighbours.
 */

/** Listings between two ads, on average: one ad slot per this many. */
export const AD_FREQUENCY = 24
/**
 * Listings a page needs before it gets an ad slot beyond the first: the
 * first slot opens past this many, the next AD_FREQUENCY later, and so on
 * (below the market's default page size, 12, so a default page has one).
 */
export const AD_FIRST_POSITION = 8
/** Fewer listings than this get no ads. */
export const AD_MIN_LISTINGS = 10
/** Listings before the first ad, at least: an ad never opens the grid. */
export const AD_MIN_LEAD = 3
/** Listings between two ads, at least. */
export const AD_MIN_GAP = 8

/** How many ad slots a page of `count` listings gets. */
export function adSlotCount(count: number): number {
  if (count < AD_MIN_LISTINGS) return 0
  return Math.ceil((count - AD_FIRST_POSITION) / AD_FREQUENCY)
}

/** A small seeded PRNG (mulberry32): the same seed, the same sequence. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The listing each ad slot goes before (an index into the listings, so 0
 * would be "first"), ascending, for a page of `count` listings.
 */
export function adListingOffsets(count: number, layoutSeed: number): number[] {
  const slots = adSlotCount(count)
  if (slots === 0) return []
  const random = seededRandom(layoutSeed)
  const halfGap = Math.ceil(AD_MIN_GAP / 2)
  const offsets: number[] = []
  for (let k = 0; k < slots; k++) {
    const start = Math.round((k * count) / slots)
    const end = Math.round(((k + 1) * count) / slots)
    const lo = k === 0 ? AD_MIN_LEAD : start + halfGap
    const hi = k === slots - 1 ? count - 1 : end - halfGap
    // A stretch too short for its margins (not reachable with the constants
    // above) falls back to its middle, still clear of the slot before.
    const offset =
      hi >= lo
        ? lo + Math.floor(random() * (hi - lo + 1))
        : Math.max(Math.floor((start + end) / 2), (offsets[k - 1] ?? -1) + 1)
    offsets.push(offset)
  }
  return offsets
}

/**
 * The ad slots as indexes in the result (listings with the ads spliced in),
 * ascending: the k-th ad sits at its listing offset plus the k ads before it.
 */
export function adPositions(count: number, layoutSeed: number): number[] {
  return adListingOffsets(count, layoutSeed).map((offset, k) => offset + k)
}
