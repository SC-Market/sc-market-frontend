import type {
  ListingSearchResult,
  SearchItemSummary,
} from "../../../../store/api/v2/market"
import { isFungibleType } from "./fungibility"

export type ListingGroupEntry =
  | { kind: "single"; key: string; listing: ListingSearchResult }
  | {
      kind: "group"
      key: string
      /** This page's listings of the item, cheapest first. */
      listings: ListingSearchResult[]
      /** The item over ALL its matching listings, every result page. */
      summary: SearchItemSummary
    }

/**
 * The grid's cards for one result page. A fungible item (./fungibility.ts) with
 * more than one matching listing in the WHOLE search (the search's
 * item_summaries, not only this page) is one group card, at its first listing
 * on the page; everything else is a single listing card. Grouping is by
 * game_item_id, the catalog identity (names drift and collide).
 */
export function buildGroupEntries(
  listings: readonly ListingSearchResult[],
  itemSummaries: readonly SearchItemSummary[],
): ListingGroupEntry[] {
  const summaries = new Map(itemSummaries.map((s) => [s.game_item_id, s]))
  const groupOf = (l: ListingSearchResult) => {
    if (!isFungibleType(l.game_item_type) || !l.game_item_id) return undefined
    const summary = summaries.get(l.game_item_id)
    return summary && summary.listing_count > 1 ? summary : undefined
  }

  const pageListings = new Map<string, ListingSearchResult[]>()
  for (const l of listings) {
    if (!groupOf(l)) continue
    const arr = pageListings.get(l.game_item_id)
    if (arr) arr.push(l)
    else pageListings.set(l.game_item_id, [l])
  }

  const emitted = new Set<string>()
  const entries: ListingGroupEntry[] = []
  for (const l of listings) {
    const summary = groupOf(l)
    if (!summary) {
      entries.push({ kind: "single", key: `s:${l.listing_id}`, listing: l })
      continue
    }
    if (emitted.has(l.game_item_id)) continue
    emitted.add(l.game_item_id)
    const sorted = [...pageListings.get(l.game_item_id)!].sort(
      (a, b) => (a.price_min ?? 0) - (b.price_min ?? 0),
    )
    entries.push({
      kind: "group",
      key: `g:${l.game_item_id}`,
      listings: sorted,
      summary,
    })
  }
  return entries
}
