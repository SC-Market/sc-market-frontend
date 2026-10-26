/**
 * Layout constants shared by the market search pages (/market, /buyorders,
 * /market/category/*) and their skeletons, so the placeholder can't drift
 * from the real page.
 */

/** Card grid columns when the cards get the narrower width. */
export const LISTING_GRID_BREAKPOINTS = {
  xs: 6,
  sm: 4,
  md: 4,
  lg: 3,
  xl: 2.4,
  xxl: 2,
  xxxl: 12 / 8,
} as const

/** Card grid columns when the cards get the wider width (one more column). */
export const LISTING_GRID_BREAKPOINTS_WIDE = {
  xs: 6,
  sm: 4,
  md: 4,
  lg: 2.4,
  xl: 2,
  xxl: 12 / 7,
  xxxl: 12 / 8,
} as const

export type ListingGridBreakpoints =
  | typeof LISTING_GRID_BREAKPOINTS
  | typeof LISTING_GRID_BREAKPOINTS_WIDE

/**
 * /market grid columns. The filter panel sits beside the grid from lg up;
 * with it there and the nav drawer closed, the grid fits one more column.
 */
export function listingSearchGridBreakpoints(
  filterPanelBeside: boolean,
  navDrawerOpen: boolean,
): ListingGridBreakpoints {
  return !filterPanelBeside || navDrawerOpen
    ? LISTING_GRID_BREAKPOINTS
    : LISTING_GRID_BREAKPOINTS_WIDE
}

/** /buyorders grid columns: one more column unless the filter drawer is open. */
export function buyOrderGridBreakpoints(
  marketSidebarOpen: boolean,
): ListingGridBreakpoints {
  return marketSidebarOpen
    ? LISTING_GRID_BREAKPOINTS
    : LISTING_GRID_BREAKPOINTS_WIDE
}

/** Skeleton cards the listing grid shows while a page of results loads. */
export const LISTING_GRID_SKELETON_COUNT = 16
