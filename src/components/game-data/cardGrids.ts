/**
 * The card grids of the game-data pages (blueprints, missions, ores,
 * locations, items, manufacturers, ships): columns, gap and a card's height.
 * Each page lays out its cards with its shape and shows CardGridSkeleton
 * with the same shape while they load, so the placeholder grid and the
 * real one have the same columns and gaps (no shift when the cards arrive).
 */

/** Legacy MUI Grid item spans per breakpoint (12 = full row). */
export interface CardGridItemSpans {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

export interface CardGridShape {
  /** Grid container spacing (theme spacing units) */
  spacing: number
  /** Grid item spans */
  item: CardGridItemSpans
  /** A loaded card's typical height (px), for its placeholder */
  cardHeight: number
}

/** /blueprints */
export const BLUEPRINT_CARD_GRID: CardGridShape = {
  spacing: 2,
  item: { xs: 12, sm: 6, md: 4, lg: 3 },
  cardHeight: 270,
}

/** /missions: two cards a row on phones */
export const MISSION_CARD_GRID: CardGridShape = {
  spacing: 0.75,
  item: { xs: 6, sm: 6, md: 4, lg: 3 },
  cardHeight: 180,
}

/** /mining/ores */
export const ORE_CARD_GRID: CardGridShape = {
  spacing: 1.5,
  item: { xs: 12, sm: 6, md: 4, lg: 3 },
  cardHeight: 180,
}

/** /mining/locations */
export const MINING_LOCATION_CARD_GRID: CardGridShape = {
  spacing: 1.5,
  item: { xs: 12, sm: 6, md: 4, lg: 3 },
  cardHeight: 180,
}

/** A wiki item card's height (ItemGridCard: fixed). */
export const WIKI_ITEM_CARD_HEIGHT = 280

/** /wiki/items */
export const WIKI_ITEM_CARD_GRID: CardGridShape = {
  spacing: 1,
  item: { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4 },
  cardHeight: WIKI_ITEM_CARD_HEIGHT,
}

/** /wiki/manufacturers */
export const MANUFACTURER_CARD_GRID: CardGridShape = {
  spacing: 2,
  item: { xs: 12, sm: 6, md: 4, lg: 3 },
  cardHeight: 180,
}

/** /wiki/ships */
export const SHIP_CARD_GRID: CardGridShape = {
  spacing: 1.25,
  item: { xs: 6, sm: 4, md: 3 },
  cardHeight: 250,
}
