import React, { useMemo, useState } from "react"
import { Grid } from "@mui/material"
import { useBreakpointUp } from "../../../../hooks/layout/useBreakpoint"
import { formatMarketUrl } from "../../domain/urls"
import type { SearchItemSummary } from "../../../../store/api/v2/market"
import { ListingSkeleton } from "../../../../components/skeletons"
import { EmptyListings } from "../../../../components/empty-states"
import { useFlip } from "./useFlip"
import { useStaggeredReveal } from "./useStaggeredReveal"
import { AdCard } from "../../../../components/ads/AdCard"
import { MARKET_ADS, insertAds } from "../../../../components/ads/adConfig"
import { useCampaignAd } from "../../../../components/ads/useCampaignAd"
import { useAdLayoutSeed } from "../../../../components/ads/useAdLayoutSeed"
import type { AdConfig } from "../../../../components/ads/types"
import { type ListingGridProps } from "../ListingSearchV2"
import { ListingCardV2 } from "../ListingCardV2"
import {
  LISTING_CARD_HEIGHT,
  LISTING_CARD_ROW_HEIGHT,
} from "../marketSearchLayout"
import {
  CardStub,
  firstScreenCards,
  useFirstScreenRender,
} from "../../../../components/grid/firstScreen"

import { GroupCard } from "./GroupCard"
import { type ListingGroupEntry, buildGroupEntries } from "./groupEntries"

export interface GroupedListingGridProps extends ListingGridProps {
  /** The search's item_summaries: each page item over every result page. */
  itemSummaries: SearchItemSummary[]
}

type GridEntry = ListingGroupEntry | { kind: "ad"; key: string; ad: AdConfig }

/** Breakpoint keys from largest to smallest, matching the custom theme. */
const BP_ORDER = ["xxxl", "xxl", "xl", "lg", "md", "sm", "xs"] as const

const GroupedListingGridInner = React.forwardRef<
  HTMLDivElement,
  GroupedListingGridProps
>(function GroupedListingGrid(
  { listings, itemSummaries, loading, error, onRetry, gridBreakpoints },
  ref,
) {
  const [expanded, setExpanded] = useState<string | null>(null)

  // Animate the reorder: when a card expands and earlier row-mates get bumped
  // below the full-width panel, FLIP makes them slide instead of jumping.
  const { register } = useFlip(expanded)

  // The cards' entrance: one stagger in the order they are shown, owned here
  // (the cards themselves don't fade in). See ./useStaggeredReveal.ts.
  const revealRef = useStaggeredReveal<HTMLDivElement>()

  // The in-universe ads go between cards, as in the flat grid (insertAds).
  const campaignAd = useCampaignAd()
  const adLayoutSeed = useAdLayoutSeed()
  const entries = useMemo(
    (): GridEntry[] =>
      insertAds(
        buildGroupEntries(listings, itemSummaries),
        (entry) => entry.key,
        MARKET_ADS,
        campaignAd,
        adLayoutSeed,
      ).map(
        (entry, i): GridEntry =>
          "_isAd" in entry
            ? { kind: "ad", key: `ad:${i}`, ad: entry.ad }
            : entry,
      ),
    [listings, itemSummaries, campaignAd, adLayoutSeed],
  )

  // Reactively track which breakpoints are active (largest → smallest). Hooks
  // must run unconditionally, so query every key regardless of gridBreakpoints.
  const xs = useBreakpointUp("xs")
  const sm = useBreakpointUp("sm")
  const md = useBreakpointUp("md")
  const lg = useBreakpointUp("lg")
  const xl = useBreakpointUp("xl")
  const xxl = useBreakpointUp("xxl")
  const xxxl = useBreakpointUp("xxxl")

  // Columns per row = 12 / (active span). Walk largest → smallest to find the
  // biggest breakpoint that is both active AND defined in gridBreakpoints.
  const columns = useMemo(() => {
    const up: Record<string, boolean> = { xs, sm, md, lg, xl, xxl, xxxl }
    for (const bp of BP_ORDER) {
      if (up[bp] && gridBreakpoints[bp] != null) {
        const span = gridBreakpoints[bp]
        return span > 0 ? Math.max(1, Math.round(12 / span)) : 1
      }
    }
    // Fall back to md-equivalent if nothing matched.
    const span = gridBreakpoints.md ?? 4
    return span > 0 ? Math.max(1, Math.round(12 / span)) : 1
  }, [xs, sm, md, lg, xl, xxl, xxxl, gridBreakpoints])

  // When a card is expanded, hoist it to the start of its own row so the earlier
  // cards in that row flow AFTER the full-width panel (bumped down, no gap).
  const orderedEntries = useMemo(() => {
    if (!expanded) return entries.map((entry, index) => ({ entry, index }))
    const expandedIndex = entries.findIndex((e) => e.key === expanded)
    if (expandedIndex < 0)
      return entries.map((entry, index) => ({ entry, index }))
    const rowStart = Math.floor(expandedIndex / columns) * columns
    const withIndex = entries.map((entry, index) => ({ entry, index }))
    if (rowStart === expandedIndex) return withIndex
    const before = withIndex.slice(0, rowStart)
    const rest = withIndex.slice(rowStart)
    const expandedItem = rest.find((x) => x.index === expandedIndex)!
    const restWithout = rest.filter((x) => x.index !== expandedIndex)
    return [...before, expandedItem, ...restWithout]
  }, [entries, expanded, columns])

  // Only the first screen of cards in the commit that shows the results;
  // the rest right after (components/grid/firstScreen.tsx).
  const firstScreen = firstScreenCards(gridBreakpoints, LISTING_CARD_ROW_HEIGHT)
  const rendered = useFirstScreenRender(entries.length, firstScreen.count)
  const priority = (index: number) => index < firstScreen.priorityCount

  if (loading) {
    return (
      <Grid container spacing={1}>
        {new Array(16).fill(undefined).map((_, i) => (
          <Grid item {...gridBreakpoints} key={i}>
            <ListingSkeleton />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (listings.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={true}
          isError={error}
          onRetry={onRetry}
          showCreateAction={false}
        />
      </Grid>
    )
  }

  return (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1} ref={revealRef}>
        {orderedEntries.map(({ entry, index }) =>
          index >= rendered ? (
            <Grid
              item
              {...gridBreakpoints}
              key={entry.key}
              ref={register(entry.key)}
            >
              {entry.kind === "single" ? (
                <CardStub
                  height={LISTING_CARD_HEIGHT}
                  to={formatMarketUrl(entry.listing)}
                  label={entry.listing.title}
                />
              ) : (
                <CardStub height={LISTING_CARD_HEIGHT} />
              )}
            </Grid>
          ) : entry.kind === "ad" ? (
            <Grid
              item
              {...gridBreakpoints}
              key={entry.key}
              ref={register(entry.key)}
            >
              <AdCard
                ad={entry.ad}
                index={index}
                noGridWrapper
                animate={false}
              />
            </Grid>
          ) : entry.kind === "single" ? (
            <Grid
              item
              {...gridBreakpoints}
              key={entry.key}
              ref={register(entry.key)}
            >
              <ListingCardV2
                listing={entry.listing}
                index={index}
                priority={priority(index)}
              />
            </Grid>
          ) : (
            <Grid
              item
              {...(expanded === entry.key ? { xs: 12 } : gridBreakpoints)}
              key={entry.key}
              ref={register(entry.key)}
            >
              <GroupCard
                listings={entry.listings}
                summary={entry.summary}
                priority={priority(index)}
                open={expanded === entry.key}
                onToggle={() =>
                  setExpanded((cur) => (cur === entry.key ? null : entry.key))
                }
              />
            </Grid>
          ),
        )}
      </Grid>
    </>
  )
})

// memo: skip re-rendering every card when the market page re-renders for an
// unrelated reason (e.g. the nav drawer opening, via DrawerOpenContext).
export const GroupedListingGrid = React.memo(GroupedListingGridInner)

GroupedListingGrid.displayName = "GroupedListingGrid"
