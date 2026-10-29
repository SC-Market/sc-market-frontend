/**
 * First-screen-only card rendering for the card grids (/market,
 * /market/services, shop pages).
 *
 * A results page holds up to ~48 cards, but only about 12 are on screen at
 * 1440x900 (4-6 at 390). Rendering every card in the commit that shows the
 * results made that commit (and so `main[data-ready]`) wait for ~780 fibers
 * and their Emotion styles per card. Now the grid renders the cards that can
 * be on the first screen, a light fixed-size stub for each of the others, and
 * swaps the stubs for the real cards right after (next idle moment, in a
 * transition so input stays responsive).
 *
 * - No layout shift: a stub has the card's height, so nothing on screen
 *   moves when the real cards replace them (and they're off screen anyway).
 * - Links stay in the DOM from the first commit: a listing/service stub is
 *   the card's link (same href, the title as its text). Today these grids
 *   aren't prerendered (live data), but if one ever is, the server render
 *   isn't staged at all (no `window`): every card is in the HTML.
 * - Staging happens once per grid mount (the first page of results). Later
 *   result changes (filters, pagination) render every card directly, so a
 *   card the visitor is looking at never turns back into a stub.
 */
import React, { startTransition, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { breakpointsValues } from "../../hooks/styles/theme/constants"

type BreakpointKey = keyof typeof breakpointsValues

const BREAKPOINTS_DESC = (
  Object.keys(breakpointsValues) as BreakpointKey[]
).sort((a, b) => breakpointsValues[b] - breakpointsValues[a])

/**
 * Columns a MUI Grid row has at `width`, for item spans like `{ xs: 6, lg: 3 }`
 * (12 / span of the largest breakpoint at or below `width`).
 */
export function gridColumnsAt(
  width: number,
  spans: Partial<Record<string, number>>,
): number {
  for (const bp of BREAKPOINTS_DESC) {
    const span = spans[bp]
    if (span != null && width >= breakpointsValues[bp]) {
      return span > 0 ? Math.max(1, Math.round(12 / span)) : 1
    }
  }
  return 1
}

export interface FirstScreen {
  /** Cards that can be on the first screen: render these at once. */
  count: number
  /** Cards in the first two rows: their images get fetchpriority="high". */
  priorityCount: number
}

/**
 * How many cards of a grid can be on the first screen: columns at the
 * viewport width times the rows of `rowHeight` px that fit its height (the
 * whole viewport, so the estimate is never short of what's visible).
 * Server render: everything (Infinity), nothing is staged.
 */
export function firstScreenCards(
  spans: Partial<Record<string, number>>,
  rowHeight: number,
): FirstScreen {
  if (typeof window === "undefined") {
    return { count: Infinity, priorityCount: 0 }
  }
  const columns = gridColumnsAt(window.innerWidth, spans)
  const rows = Math.max(1, Math.ceil(window.innerHeight / rowHeight))
  return { count: columns * rows, priorityCount: columns * Math.min(2, rows) }
}

/**
 * How many of `total` cards to render fully now. The first time a grid has
 * more than `firstScreen` cards it returns `firstScreen`, then (next idle
 * moment, in a transition) `total` for the rest of the grid's life.
 */
export function useFirstScreenRender(
  total: number,
  firstScreen: number,
): number {
  const [full, setFull] = useState(false)
  const staged = !full && total > firstScreen

  useEffect(() => {
    if (!staged) return
    let cancelled = false
    const run = () => {
      if (!cancelled) startTransition(() => setFull(true))
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 300 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }
    const id = window.setTimeout(run, 0)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [staged])

  return staged ? firstScreen : total
}

/**
 * A card's stand-in until it renders: the card's box (fixed height, card
 * radius, a faint fill) and, when the card is a link, that link with the
 * card's title. Plain elements and inline styles, no Emotion.
 */
export function CardStub(props: {
  height: number
  /** The card's link target; omitted for cards that aren't links. */
  to?: string
  /** The link text (the card's title). */
  label?: string
}) {
  const { height, to, label } = props
  const theme = useTheme()
  const style: React.CSSProperties = {
    display: "block",
    boxSizing: "border-box",
    height,
    overflow: "hidden",
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.action.hover,
    padding: 12,
    fontSize: "0.75rem",
    lineHeight: 1.3,
    // text.primary is the dull grey in this theme.
    color: theme.palette.text.primary,
    textDecoration: "none",
  }
  if (!to) return <div data-card-stub="" style={style} aria-hidden />
  return (
    <Link data-card-stub="" to={to} style={style}>
      {label}
    </Link>
  )
}
