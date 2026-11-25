import { useLayoutEffect, useRef } from "react"
import { useHydrated } from "../../../../hooks/ssr/useHydrated"

/**
 * One entrance stagger for the whole redesigned market grid, in the order the
 * cards are SHOWN (reading order: row by row, then across each row).
 *
 * Before this, every card ran its own entrance: group cards and ads faded in
 * with a delay of `50 + 50 * index` ms (uncapped: card 30 waited 1.5 s), while
 * single listing cards had no fade at all and appeared at once. So singles
 * popped in first, then the groups and ads trickled in around them, and the
 * stagger also restarted from 0 for every batch of cards mounted later.
 *
 * Now the grid owns the reveal: after each commit it finds the grid items that
 * are new DOM nodes (a new page, new filter results, a card added), sorts them
 * by their rendered position and fades them in with a capped stagger. Cards already shown never animate again (re-renders,
 * expanding a group, the first-screen stubs turning into cards: same nodes),
 * and nodes rendered by the server (hydration) are left as they are.
 * Reduced motion: no animation.
 */

export interface RevealRect {
  top: number
  left: number
  bottom: number
  right: number
}

export interface RevealTiming {
  /** Delay between one card and the next, ms. */
  step: number
  /** No card waits longer than this, however many are on screen, ms. */
  maxDelay: number
}

export const REVEAL_TIMING: RevealTiming = { step: 35, maxDelay: 350 }
export const REVEAL_DURATION = 240

/**
 * The reveal delay for each rect, by its place in reading order. Rects whose
 * tops are within `rowTolerance` px are one row (grid rows line up, but
 * sub-pixel layout can differ), ordered by `left` (or by `right`, descending,
 * on right-to-left pages).
 *
 * Every new card is planned, on screen or not: after a page change the page
 * is still smooth-scrolling up to the grid when the cards mount, so what is
 * "on screen" at that moment is not what the visitor ends up looking at. The
 * cap keeps the cards past the first rows from waiting any longer.
 */
export function planReveal(
  rects: readonly RevealRect[],
  timing: RevealTiming = REVEAL_TIMING,
  options: { rtl?: boolean; rowTolerance?: number } = {},
): number[] {
  const { rtl = false, rowTolerance = 4 } = options
  const order = rects
    .map((rect, i) => ({ rect, i }))
    .sort((a, b) => {
      const dy = a.rect.top - b.rect.top
      if (Math.abs(dy) > rowTolerance) return dy
      return rtl ? b.rect.right - a.rect.right : a.rect.left - b.rect.left
    })

  const delays: number[] = rects.map(() => 0)
  order.forEach(({ i }, rank) => {
    delays[i] = Math.min(rank * timing.step, timing.maxDelay)
  })
  return delays
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Attach the returned ref to the Grid container; its direct children (the
 * grid items) are what gets revealed.
 */
export function useStaggeredReveal<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null)
  const seen = useRef(new WeakSet<Element>())
  // false during the hydration render: the server's cards are already on
  // screen, so they are marked seen instead of animated.
  const hydrated = useHydrated()

  // Every commit (no deps): only new nodes do any work.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const fresh: HTMLElement[] = []
    for (const child of Array.from(container.children)) {
      if (seen.current.has(child)) continue
      seen.current.add(child)
      if (child instanceof HTMLElement) fresh.push(child)
    }
    if (fresh.length === 0 || !hydrated || prefersReducedMotion()) return
    if (typeof fresh[0].animate !== "function") return

    const delays = planReveal(
      fresh.map((el) => el.getBoundingClientRect()),
      REVEAL_TIMING,
      { rtl: getComputedStyle(container).direction === "rtl" },
    )
    fresh.forEach((el, i) => {
      const delay = delays[i]
      // Opacity only: useFlip owns these nodes' transform. fill "backwards"
      // holds opacity 0 through the delay from this (pre-paint) frame on, and
      // nothing is left behind once the animation ends.
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: REVEAL_DURATION,
        delay,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "backwards",
      })
    })
  })

  return containerRef
}
