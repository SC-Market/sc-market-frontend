import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fade,
  Grid,
  Grow,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import GroupsRounded from "@mui/icons-material/GroupsRounded"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { isAfter, subDays } from "date-fns"
import { ExtendedTheme, cardFadeGradient } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatPrice, formatPriceRange } from "../../../../util/formatPrice"
import { formatMarketUrl, formatShortSlug } from "../../domain/urls"
import type {
  ListingSearchResult,
  GameItemListingResult,
} from "../../../../store/api/v2/market"
import {
  useSearchBuyOrdersQuery,
  useGetListingsQuery,
  useAddToCartMutation,
} from "../../../../store/api/v2/market"
import { ListingSkeleton } from "../../../../components/skeletons"
import { EmptyListings } from "../../../../components/empty-states"
import { MarketListingRating } from "../../../../components/rating/ListingRating"
import { isFungibleType } from "./fungibility"
import { useFlip } from "./useFlip"
import { ListingCardV2, type ListingGridProps } from "../ListingSearchV2"

/**
 * GroupedListingGrid — market_v2_redesign variant of the search grid.
 *
 * Grafted into ListingSearchV2 in place of the internal `ListingGrid` when the
 * `market_v2_redesign` flag is on. Takes the SAME props as `ListingGrid` and
 * mirrors its loading-skeleton and empty-state behavior exactly.
 *
 * Grouping is CLIENT-SIDE over the currently-loaded page of results only (not
 * the whole catalog): fungible items (per ./fungibility.ts) that share
 * game_item_name + game_item_type collapse into ONE expandable group card when
 * more than one seller is present. Everything else (non-fungible, or fungible
 * with a single seller) renders as the REAL `ListingCardV2` at the normal grid
 * size so it stays pixel-identical to the flag-off view.
 *
 * Only one group can be expanded at a time. Sellers within a group are sorted
 * cheapest-first; the page's own sort (via URL params) drives everything else.
 */

/** Quality tier color: 1=grey, 2=green, 3=blue, 4=purple, 5=gold */
function qualityColor(tier: number): string {
  switch (tier) {
    case 1: return "#757575"
    case 2: return "#4caf50"
    case 3: return "#2196f3"
    case 4: return "#9c27b0"
    case 5: return "#ff9800"
    default: return "#757575"
  }
}

/** Quality value (0-1000) to color */
function qualityValueColor(value: number): string {
  if (value >= 800) return "#ff9800"
  if (value >= 600) return "#9c27b0"
  if (value >= 400) return "#2196f3"
  if (value >= 200) return "#4caf50"
  return "#757575"
}

/** Format quality display — prefers value (0-1000) over tier (1-5) */
function qualityChipProps(
  listing: ListingSearchResult,
): { label: string; color: string } | null {
  if (listing.quality_value_min != null) {
    const min = listing.quality_value_min
    const max = listing.quality_value_max ?? min
    const label = min === max ? `${min}` : `${min}–${max}`
    return { label, color: qualityValueColor(max) }
  }
  if (listing.quality_tier_min != null) {
    const min = listing.quality_tier_min
    const max = listing.quality_tier_max ?? min
    const label = min === max ? `Q${min}` : `Q${min}–${max}`
    return { label, color: qualityColor(max) }
  }
  return null
}

/**
 * Quality RANGE across every seller in a group — this is the aggregate signal a
 * buyer wants while scanning (not the cheapest listing's quality alone): "does
 * this item have the quality I need, roughly?". Colored by the best tier/value
 * available. Prefers value (0-1000) over tier (1-5), consistent with the chip.
 */
function groupQualityChipProps(
  listings: ListingSearchResult[],
): { label: string; color: string } | null {
  const values = listings.flatMap((l) =>
    [l.quality_value_min, l.quality_value_max].filter(
      (v): v is number => v != null,
    ),
  )
  if (values.length) {
    const min = Math.min(...values)
    const max = Math.max(...values)
    return {
      label: min === max ? `${min}` : `${min}–${max}`,
      color: qualityValueColor(max),
    }
  }
  const tiers = listings.flatMap((l) =>
    [l.quality_tier_min, l.quality_tier_max].filter(
      (v): v is number => v != null,
    ),
  )
  if (tiers.length) {
    const min = Math.min(...tiers)
    const max = Math.max(...tiers)
    return {
      label: min === max ? `Q${min}` : `Q${min}–${max}`,
      color: qualityColor(max),
    }
  }
  return null
}

/**
 * Per-listing flag chips (NEW / OUT OF STOCK / BULK DISCOUNT / internal), shared
 * by both expanded seller views so each seller reflects the same chips a
 * standalone ListingCardV2 would show for it. Small/dense variant for rows.
 */
function ListingFlagChips({ listing }: { listing: ListingSearchResult }) {
  const { t } = useTranslation()
  const isNew = isAfter(new Date(listing.created_at), subDays(new Date(), 3))
  const outOfStock = (listing.quantity_available ?? 0) === 0
  const chipSx = {
    height: 18,
    fontSize: "0.6rem",
    textTransform: "uppercase" as const,
    fontWeight: "bold" as const,
  }
  return (
    <>
      {isNew && <Chip label={t("market.new", "NEW")} color="secondary" size="small" sx={chipSx} />}
      {outOfStock && (
        <Chip label={t("market.outOfStock", "OUT OF STOCK")} color="error" size="small" sx={chipSx} />
      )}
      {listing.has_bulk_discount && (
        <Chip label={t("market.bulkDiscount", "BULK")} color="info" size="small" sx={chipSx} />
      )}
      {listing.visibility === "private" && (
        <Chip label={t("market.internalListing", "INTERNAL")} color="warning" size="small" sx={chipSx} />
      )}
    </>
  )
}

type GridEntry =
  | { kind: "single"; key: string; listing: ListingSearchResult }
  | { kind: "group"; key: string; listings: ListingSearchResult[] }

/** Group fungible listings sharing name+type, preserving incoming order. */
function buildEntries(listings: ListingSearchResult[]): GridEntry[] {
  const groupKeyOf = (l: ListingSearchResult) =>
    `${l.game_item_type}||${l.game_item_name}`

  // First pass: bucket fungible listings by key to know group sizes.
  const buckets = new Map<string, ListingSearchResult[]>()
  for (const l of listings) {
    if (!isFungibleType(l.game_item_type) || !l.game_item_name) continue
    const k = groupKeyOf(l)
    const arr = buckets.get(k)
    if (arr) arr.push(l)
    else buckets.set(k, [l])
  }

  // Second pass: emit entries in original order; group appears at first member.
  const emitted = new Set<string>()
  const entries: GridEntry[] = []
  for (const l of listings) {
    const isFungible = isFungibleType(l.game_item_type) && !!l.game_item_name
    const k = isFungible ? groupKeyOf(l) : ""
    const bucket = isFungible ? buckets.get(k) : undefined

    if (isFungible && bucket && bucket.length > 1) {
      if (emitted.has(k)) continue
      emitted.add(k)
      const sorted = [...bucket].sort(
        (a, b) => (a.price_min ?? 0) - (b.price_min ?? 0),
      )
      entries.push({ kind: "group", key: `g:${k}`, listings: sorted })
    } else {
      entries.push({ kind: "single", key: `s:${l.listing_id}`, listing: l })
    }
  }
  return entries
}

/** Breakpoint keys from largest to smallest, matching the custom theme. */
const BP_ORDER = ["xxxl", "xxl", "xl", "lg", "md", "sm", "xs"] as const

export const GroupedListingGrid = React.forwardRef<
  HTMLDivElement,
  ListingGridProps
>(function GroupedListingGrid(
  { listings, loading, error, onRetry, gridBreakpoints, marketSidebarOpen },
  ref,
) {
  const theme = useTheme<ExtendedTheme>()
  const [expanded, setExpanded] = useState<string | null>(null)

  // Animate the reorder: when a card expands and earlier row-mates get bumped
  // below the full-width panel, FLIP makes them slide instead of jumping.
  const { register } = useFlip(expanded)

  const entries = useMemo(() => buildEntries(listings), [listings])

  // Reactively track which breakpoints are active (largest → smallest). Hooks
  // must run unconditionally, so query every key regardless of gridBreakpoints.
  const up: Record<string, boolean> = {
    xs: useMediaQuery(theme.breakpoints.up("xs")),
    sm: useMediaQuery(theme.breakpoints.up("sm")),
    md: useMediaQuery(theme.breakpoints.up("md")),
    lg: useMediaQuery(theme.breakpoints.up("lg")),
    xl: useMediaQuery(theme.breakpoints.up("xl")),
    xxl: useMediaQuery(theme.breakpoints.up("xxl")),
    xxxl: useMediaQuery(theme.breakpoints.up("xxxl")),
  }

  // Columns per row = 12 / (active span). Walk largest → smallest to find the
  // biggest breakpoint that is both active AND defined in gridBreakpoints.
  const columns = useMemo(() => {
    for (const bp of BP_ORDER) {
      if (up[bp] && gridBreakpoints[bp] != null) {
        const span = gridBreakpoints[bp]
        return span > 0 ? Math.max(1, Math.round(12 / span)) : 1
      }
    }
    // Fall back to md-equivalent if nothing matched.
    const span = gridBreakpoints.md ?? 4
    return span > 0 ? Math.max(1, Math.round(12 / span)) : 1
  }, [up, gridBreakpoints])

  // When a card is expanded, hoist it to the start of its own row so the earlier
  // cards in that row flow AFTER the full-width panel (bumped down, no gap).
  const orderedEntries = useMemo(() => {
    if (!expanded) return entries.map((entry, index) => ({ entry, index }))
    const expandedIndex = entries.findIndex((e) => e.key === expanded)
    if (expandedIndex < 0) return entries.map((entry, index) => ({ entry, index }))
    const rowStart = Math.floor(expandedIndex / columns) * columns
    const withIndex = entries.map((entry, index) => ({ entry, index }))
    if (rowStart === expandedIndex) return withIndex
    const before = withIndex.slice(0, rowStart)
    const rest = withIndex.slice(rowStart)
    const expandedItem = rest.find((x) => x.index === expandedIndex)!
    const restWithout = rest.filter((x) => x.index !== expandedIndex)
    return [...before, expandedItem, ...restWithout]
  }, [entries, expanded, columns])

  if (loading) {
    return (
      <Grid container spacing={1}>
        {new Array(16).fill(undefined).map((_, i) => (
          <Grid item {...gridBreakpoints} key={i}>
            <ListingSkeleton index={i} sidebarOpen={marketSidebarOpen} />
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
      <Grid container spacing={1}>
        {orderedEntries.map(({ entry, index }) =>
          entry.kind === "single" ? (
            <Grid item {...gridBreakpoints} key={entry.key} ref={register(entry.key)}>
              <ListingCardV2 listing={entry.listing} index={index} />
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
                index={index}
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

GroupedListingGrid.displayName = "GroupedListingGrid"

/**
 * GroupCard — a fungible item sold by multiple sellers. Collapsed, it matches a
 * ListingCardV2 tile (same grid slot, height 300, CardMedia + dark-mode gradient
 * overlay + bottom CardContent). Expanded, the tile grows to a full row and
 * reveals per-seller options (rich sub-cards for ≤6 sellers, a compact
 * scrollable depth list beyond).
 */
function GroupCard({
  listings,
  index,
  open,
  onToggle,
}: {
  listings: ListingSearchResult[]
  index: number
  open: boolean
  onToggle: () => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const cheapest = listings[0]
  const priceMin = Math.min(...listings.map((l) => l.price_min ?? 0))
  const priceMax = Math.max(...listings.map((l) => l.price_max ?? l.price_min ?? 0))
  const totalQuantity = listings.reduce(
    (sum, l) => sum + (l.quantity_available ?? 0),
    0,
  )
  // Aggregate quality RANGE across all sellers — the scan-level signal a buyer
  // wants, not just the cheapest listing's quality.
  const qc = groupQualityChipProps(listings)
  // Aggregate-level tags (parity with ListingCardV2, adapted to a group): show
  // BULK DISCOUNT if ANY seller offers one; the group is only fully out of stock
  // if EVERY seller is (a group is "available" as long as one seller has stock).
  const anyBulkDiscount = listings.some((l) => l.has_bulk_discount)
  const allOutOfStock = listings.every((l) => (l.quantity_available ?? 0) === 0)

  return (
    <Fade in={true} timeout={500} style={{ transitionDelay: `${50 + 50 * index}ms` }}>
      <Card
        sx={{
          position: "relative",
          height: open ? "auto" : 300,
          borderColor: open ? "secondary.main" : undefined,
          boxShadow: open ? 6 : 0,
          transition: theme.transitions.create(["box-shadow", "border-color"], {
            duration: theme.transitions.duration.shorter,
          }),
          // Read as interactive/expandable when collapsed, matching how the
          // normal listing tiles respond to hover.
          "&:hover": open ? undefined : { borderColor: "secondary.main" },
        }}
      >
        {/* Collapsed header region mirrors a ListingCardV2 tile */}
        <CardActionArea
          onClick={onToggle}
          sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
        >
          {/* Dark mode overlays text on a full-bleed image, so the container is
              a fixed height. Light mode stacks a 180px image + content in normal
              flow, so it must size to content (auto) — forcing 300 here is what
              clipped the light-mode details. */}
          <Box
            sx={{
              position: "relative",
              ...(theme.palette.mode === "dark"
                ? { height: open ? 140 : 300 }
                : {}),
            }}
          >
            <Chip
              icon={<GroupsRounded sx={{ fontSize: "0.8rem !important" }} />}
              label={t("MarketRedesign.sellersCount", "{{count}} sellers", {
                count: listings.length,
              })}
              color="secondary"
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                left: 4,
                zIndex: 2,
                fontWeight: "bold",
                fontSize: "0.65rem",
                height: 18,
              }}
            />
            {qc && (
              <Chip
                label={qc.label}
                size="small"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  zIndex: 2,
                  fontWeight: "bold",
                  fontSize: "0.65rem",
                  height: 18,
                  bgcolor: qc.color,
                  color: "#fff",
                }}
              />
            )}
            {allOutOfStock && (
              <Chip
                label={t("market.outOfStock", "OUT OF STOCK")}
                color="error"
                size="small"
                sx={{
                  position: "absolute",
                  top: 26,
                  right: 4,
                  zIndex: 2,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: "0.65rem",
                  height: 18,
                }}
              />
            )}
            {anyBulkDiscount && (
              <Chip
                label={t("market.bulkDiscount", "BULK DISCOUNT")}
                color="info"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  zIndex: 2,
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  fontSize: "0.65rem",
                  height: 18,
                }}
              />
            )}
            {/* Match ListingCardV2 exactly: dark mode = full-bleed image with a
                gradient scrim and text overlaid at the bottom; light mode = a
                fixed-height image with the text in normal flow BELOW it (no
                overlay, no gradient). The earlier version forced the dark
                overlay in light mode, which clipped the details. */}
            <CardMedia
              component="img"
              loading="lazy"
              image={cheapest.photo || FALLBACK_IMAGE_URL}
              sx={{
                width: "100%",
                objectFit: "cover",
                ...(theme.palette.mode === "dark"
                  ? { height: "100%", aspectRatio: "16/9" }
                  : { height: 180, aspectRatio: "16/9" }),
                overflow: "hidden",
              }}
              alt={`Image of ${cheapest.game_item_name}`}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                background: cardFadeGradient(theme, 50, 60),
              }}
            />
            <CardContent
              sx={{
                ...(theme.palette.mode === "dark"
                  ? { position: "absolute", bottom: 0, left: 0, zIndex: 4 }
                  : {}),
                width: "100%",
                maxWidth: "100%",
                padding: "8px 12px !important",
              }}
            >
              {/* Mirror ListingCardV2: price (h6) → item name (title) → seller
                  line. Only the seller line and the expand pill differ, so the
                  tile reads as a normal listing with a clear "expandable" cue. */}
              <Typography
                variant="h6"
                color="primary"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: "0.95rem", mb: 0.5 }}
              >
                {t("MarketRedesign.fromPrice", "from")} {formatPrice(priceMin)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.3,
                  maxHeight: 36,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mb: 0.5,
                }}
              >
                {cheapest.game_item_name}
              </Typography>
              {/* Seller line + clear expand pill on one row */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ fontSize: "0.7rem", lineHeight: 1.2, minWidth: 0 }}
                >
                  {t("MarketRedesign.acrossSellers", "across {{count}} sellers", {
                    count: listings.length,
                  })}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.25}
                  sx={{
                    flexShrink: 0,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 999,
                    bgcolor: open ? "secondary.main" : "action.hover",
                    color: open ? "secondary.contrastText" : "text.primary",
                    transition: "background-color .2s, color .2s",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                >
                  {open
                    ? t("MarketRedesign.hide", "Hide")
                    : t("MarketRedesign.compare", "Compare")}
                  <ExpandMoreRounded
                    sx={{
                      fontSize: "1rem",
                      transform: open ? "rotate(180deg)" : "none",
                      transition: "transform .2s",
                    }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Box>
        </CardActionArea>

        {/* Expanded seller comparison */}
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ p: 1.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
              {formatPriceRange(priceMin, priceMax)} {"·"}{" "}
              {t("MarketRedesign.sellersCount", "{{count}} sellers", {
                count: listings.length,
              })}{" "}
              {"·"}{" "}
              {t("MarketRedesign.unitsAvailable", "{{count}} units available", {
                count: totalQuantity,
              })}
            </Typography>

            {/* Sell side — who's offering this item */}
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}
            >
              {t("MarketRedesign.forSale", "For sale")}
            </Typography>
            {/* Sell side — one row per VARIANT (quality tier), the unit buyers
                actually add to cart. Fetched server-side by game_item_id so it's
                complete (all sellers, all variants), not limited to the search
                page. Falls back to the client-grouped listings if no id. */}
            {cheapest.game_item_id ? (
              <GroupSellers
                gameItemId={cheapest.game_item_id}
                gameItemName={cheapest.game_item_name}
              />
            ) : (
              <GroupSellersFallback listings={listings} />
            )}

            {/* Buy side — who WANTS this item (EVE-style market depth: asks + bids
                side by side). Only render when the group carries a game_item_id
                (now provided by the search result) — that's the query key. */}
            {cheapest.game_item_id && (
              <GroupBuyOrders gameItemId={cheapest.game_item_id} />
            )}
          </Box>
        </Collapse>
      </Card>
    </Fade>
  )
}

/**
 * GroupBuyOrders — the DEMAND side of an item's market depth (EVE-style: bids
 * shown alongside asks). Lists active standing buy orders for this game_item so
 * buyers see going rates and sellers see existing demand. Fetched lazily when a
 * group expands (the panel only mounts on open). Fails soft: renders nothing if
 * there are no buy orders or the query errors — it's supplementary, never blocks
 * the sell-side view.
 */
function GroupBuyOrders({ gameItemId }: { gameItemId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useSearchBuyOrdersQuery({
    gameItemId,
    sortBy: "price_per_unit",
    sortOrder: "desc", // highest bid first — most attractive to a seller
    pageSize: 20,
  })

  const orders = data?.buy_orders ?? []
  if (isLoading || orders.length === 0) return null // supplementary; stay quiet when empty

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}
      >
        {t("MarketRedesign.wantedBy", "Wanted by {{count}} buyers", {
          count: orders.length,
        })}
      </Typography>
      <Box sx={{ maxHeight: 240, overflowY: orders.length > 5 ? "auto" : "visible" }}>
        <Stack divider={<Divider />}>
          {orders.map((o, i) => (
            <Stack
              key={o.buy_order_id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ py: 1 }}
            >
              <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }} noWrap>
                {o.buyer_name}
              </Typography>
              {i === 0 && (
                <Chip label={t("MarketRedesign.topBid", "Top bid")} size="small" color="secondary" sx={{ height: 20 }} />
              )}
              {o.negotiable && (
                <Chip label={t("MarketRedesign.negotiable", "Negotiable")} size="small" variant="outlined" sx={{ height: 20 }} />
              )}
              <Typography variant="body2" sx={{ color: "text.primary", width: 90, textAlign: "right" }}>
                {(o.quantity - o.quantity_fulfilled).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 700, width: 120, textAlign: "right" }}>
                {formatPrice(o.price_per_unit)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

/** Quality score for a variant (higher = better). Value preferred over tier. */
function variantQualityScore(v: GameItemListingResult): number {
  if (v.quality_value != null) return v.quality_value
  if (v.quality_tier != null) return v.quality_tier
  return -1 // unspecified quality sorts last
}

interface HighlightTag {
  labelKey: string
  labelFallback: string
}

interface Highlight {
  variant: GameItemListingResult
  /** All superlatives this variant wins (e.g. lowest price AND top rated). */
  tags: HighlightTag[]
}

/**
 * GroupSellers — the SELL side of an item's market depth, as a SUMMARY of the
 * few listings that matter, not a full dump. Fetched server-side by game_item_id
 * (per-variant), so highlights are drawn from ALL sellers/variants. We surface
 * the lowest price, the highest quality, and the highest-rated seller (deduped —
 * one variant may win more than one, then it carries multiple tags). Each row is
 * the exact unit a buyer adds to cart (listing_id + variant_id). "See all"
 * opens the full aggregate page for the complete, filterable depth.
 */
function GroupSellers({
  gameItemId,
  gameItemName,
}: {
  gameItemId: string
  gameItemName: string
}) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useGetListingsQuery({
    id: gameItemId,
    sortBy: "price",
    sortOrder: "asc",
    pageSize: 100,
  })

  const variants = useMemo(() => data?.listings ?? [], [data])
  const totalCount = data?.total ?? variants.length

  // Pick the standout variants. A variant that wins several superlatives is
  // shown once with all its tags (deduped by listing_id:variant_id).
  const highlights = useMemo<Highlight[]>(() => {
    if (variants.length === 0) return []
    const keyOf = (v: GameItemListingResult) => `${v.listing_id}:${v.variant_id}`

    const lowestPrice = variants.reduce((a, b) => (b.price < a.price ? b : a))
    const highestQuality = variants.reduce((a, b) =>
      variantQualityScore(b) > variantQualityScore(a) ? b : a,
    )
    // Weight rating by review count (Bayesian shrink toward a prior) so a
    // 5★/1-review shop doesn't outrank a 4.9★/300-review one. A shop with zero
    // ratings scores the prior, not 0, but the >0 guard below still excludes it.
    const PRIOR_MEAN = 3.5 // neutral prior for an unrated shop
    const PRIOR_WEIGHT = 5 // ~5 reviews of "pull" toward the prior
    const ratingScore = (v: GameItemListingResult) => {
      const n = v.shop_rating_count ?? 0
      const r = v.shop_rating ?? 0
      return (PRIOR_WEIGHT * PRIOR_MEAN + n * r) / (PRIOR_WEIGHT + n)
    }
    const topRated = variants.reduce((a, b) =>
      ratingScore(b) > ratingScore(a) ? b : a,
    )

    // Collect tags per winning variant. A variant that wins several
    // superlatives is ONE row carrying multiple tags; distinct winners are
    // separate rows (so multiple variants show as separate entries). Insertion
    // order gives a sensible display order.
    const tagsByKey = new Map<string, Highlight>()
    const add = (v: GameItemListingResult, labelKey: string, labelFallback: string) => {
      const k = keyOf(v)
      const entry = tagsByKey.get(k) ?? { variant: v, tags: [] }
      entry.tags.push({ labelKey, labelFallback })
      tagsByKey.set(k, entry)
    }
    add(lowestPrice, "MarketRedesign.lowestPrice", "Lowest price")
    if (variantQualityScore(highestQuality) >= 0) {
      add(highestQuality, "MarketRedesign.highestQuality", "Highest quality")
    }
    if ((topRated.shop_rating ?? 0) > 0) {
      add(topRated, "MarketRedesign.topRated", "Top rated seller")
    }
    return [...tagsByKey.values()]
  }, [variants])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }
  if (error || variants.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
        {t("MarketRedesign.noSellers", "No sellers available right now.")}
      </Typography>
    )
  }

  return (
    <Box>
      <Stack divider={<Divider />}>
        {highlights.map((h, i) => (
          <Fade
            key={`${h.variant.listing_id}:${h.variant.variant_id}`}
            in
            timeout={300}
            style={{ transitionDelay: `${Math.min(i, 6) * 40}ms` }}
          >
            <Box>
              <VariantRow variant={h.variant} tags={h.tags} />
            </Box>
          </Fade>
        ))}
      </Stack>

      <Button
        component={RouterLink}
        to={`/market/aggregate/${formatShortSlug(gameItemId, gameItemName)}`}
        size="small"
        variant="text"
        sx={{ mt: 1 }}
      >
        {t("MarketRedesign.seeAllCount", "See all {{count}} listings", {
          count: totalCount,
        })}
      </Button>
    </Box>
  )
}

/** Quality chip for a single per-variant row (single tier/value, not a range). */
function variantQualityChip(
  v: GameItemListingResult,
): { label: string; color: string } | null {
  if (v.quality_value != null) {
    return { label: `${v.quality_value}`, color: qualityValueColor(v.quality_value) }
  }
  if (v.quality_tier != null) {
    return { label: `Q${v.quality_tier}`, color: qualityColor(v.quality_tier) }
  }
  return null
}

function variantLabel(v: GameItemListingResult): string | null {
  return v.variant_display_name || v.variant_short_name || null
}

/** Add-to-cart button for a variant row — the unit buyers actually purchase. */
function AddVariantButton({ variant }: { variant: GameItemListingResult }) {
  const { t } = useTranslation()
  const [addToCart, { isLoading }] = useAddToCartMutation()
  const outOfStock = (variant.quantity_available ?? 0) === 0
  return (
    <Button
      size="small"
      variant="outlined"
      color="primary"
      disabled={isLoading || outOfStock}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
          addToCartRequest: {
            listing_id: variant.listing_id,
            variant_id: variant.variant_id,
            quantity: 1,
          },
        })
      }}
      sx={{ minWidth: 0, px: 1 }}
    >
      {t("MarketRedesign.addToCart", "Add")}
    </Button>
  )
}

function VariantRow({ variant, tags }: { variant: GameItemListingResult; tags: HighlightTag[] }) {
  const { t } = useTranslation()
  const qc = variantQualityChip(variant)
  const label = variantLabel(variant)
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <RouterLink
          to={formatMarketUrl(variant)}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", "&:hover": { color: "secondary.main" } }} noWrap>
            {variant.shop_name}
            {label ? ` · ${label}` : ""}
          </Typography>
        </RouterLink>
        <MarketListingRating
          avg_rating={variant.shop_rating}
          rating_count={variant.shop_rating_count ?? null}
          total_rating={0}
          rating_streak={null}
          total_orders={null}
          total_assignments={null}
          response_rate={null}
          badge_ids={[]}
          display_limit={0}
          showBadges={false}
        />
      </Box>
      {qc && (
        <Chip
          label={qc.label}
          size="small"
          sx={{ height: 20, fontSize: "0.65rem", bgcolor: qc.color, color: "#fff" }}
        />
      )}
      {tags.map((tag) => (
        <Chip
          key={tag.labelKey}
          label={t(tag.labelKey, tag.labelFallback)}
          size="small"
          color="primary"
          sx={{ height: 20 }}
        />
      ))}
      <Typography variant="body2" sx={{ color: "text.primary", width: 70, textAlign: "right" }}>
        {variant.quantity_available != null ? variant.quantity_available.toLocaleString() : "—"}
      </Typography>
      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700, width: 100, textAlign: "right" }}>
        {formatPrice(variant.price)}
      </Typography>
      <AddVariantButton variant={variant} />
    </Stack>
  )
}

/**
 * GroupSellersFallback — used only when a group has no game_item_id (shouldn't
 * happen with current search results, but kept as a safe fallback). Renders the
 * client-grouped per-LISTING rows without the per-variant fetch or add-to-cart.
 */
function GroupSellersFallback({ listings }: { listings: ListingSearchResult[] }) {
  return (
    <Stack divider={<Divider />}>
      {listings.map((s, i) => {
        const qc = qualityChipProps(s)
        return (
          <Stack
            key={s.listing_id}
            component={RouterLink}
            to={formatMarketUrl(s)}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ py: 1, textDecoration: "none", color: "inherit", "&:hover": { color: "secondary.main" } }}
          >
            <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }} noWrap>
              {s.shop_name}
            </Typography>
            <ListingFlagChips listing={s} />
            {qc && (
              <Chip label={qc.label} size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: qc.color, color: "#fff" }} />
            )}
            {i === 0 && <Chip label="Best" size="small" color="primary" sx={{ height: 20 }} />}
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700, width: 110, textAlign: "right" }}>
              {formatPrice(s.price_min)}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}
