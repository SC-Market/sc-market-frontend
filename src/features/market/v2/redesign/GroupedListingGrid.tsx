import React, { useMemo, useState } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
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
import { ExtendedTheme, cardFadeGradient } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatPrice, formatPriceRange } from "../../../../util/formatPrice"
import { formatMarketUrl } from "../../domain/urls"
import type { ListingSearchResult } from "../../../../store/api/v2/market"
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
  const up = {
    xs: useMediaQuery(theme.breakpoints.up("xs")),
    sm: useMediaQuery(theme.breakpoints.up("sm")),
    md: useMediaQuery(theme.breakpoints.up("md")),
    lg: useMediaQuery(theme.breakpoints.up("lg")),
    xl: useMediaQuery(theme.breakpoints.up("xl")),
    xxl: useMediaQuery(theme.breakpoints.up("xxl")),
    xxxl: useMediaQuery(theme.breakpoints.up("xxxl")),
  } as Record<string, boolean>

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
  const qc = qualityChipProps(cheapest)

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
            <GroupSellers listings={listings} />
          </Box>
        </Collapse>
      </Card>
    </Fade>
  )
}

/**
 * GroupSellers — per-seller options for an expanded group. Rich sub-cards for a
 * handful of sellers, a compact scrollable market-depth row list beyond ~6.
 * Sellers arrive already sorted cheapest-first; index 0 is the "Best" price.
 */
function GroupSellers({ listings }: { listings: ListingSearchResult[] }) {
  const dense = listings.length > 6

  return dense ? (
    <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
      <Stack divider={<Divider />}>
        {listings.map((s, i) => (
          <Fade
            key={s.listing_id}
            in
            timeout={300}
            style={{ transitionDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <Box>
              <SellerRow listing={s} best={i === 0} />
            </Box>
          </Fade>
        ))}
      </Stack>
    </Box>
  ) : (
    <Grid container spacing={1.5}>
      {listings.map((s, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={s.listing_id}>
          <Grow
            in
            timeout={300}
            style={{ transformOrigin: "top", transitionDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <Box sx={{ height: "100%" }}>
              <SellerSubCard listing={s} best={i === 0} />
            </Box>
          </Grow>
        </Grid>
      ))}
    </Grid>
  )
}

function SellerRow({
  listing,
  best,
}: {
  listing: ListingSearchResult
  best: boolean
}) {
  const qc = qualityChipProps(listing)
  return (
    <Stack
      component={RouterLink}
      to={formatMarketUrl(listing)}
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        py: 1,
        textDecoration: "none",
        color: "inherit",
        "&:hover": { color: "secondary.main" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
          {listing.shop_name}
        </Typography>
        <MarketListingRating
          avg_rating={listing.shop_rating}
          rating_count={listing.shop_rating_count ?? null}
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
      {best && <Chip label="Best" size="small" color="primary" sx={{ height: 20 }} />}
      <Typography
        variant="body2"
        sx={{ color: "text.primary", width: 90, textAlign: "right" }}
      >
        {listing.quantity_available != null
          ? listing.quantity_available.toLocaleString()
          : "—"}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "primary.main", fontWeight: 700, width: 120, textAlign: "right" }}
      >
        {formatPrice(listing.price_min)}
      </Typography>
    </Stack>
  )
}

function SellerSubCard({
  listing,
  best,
}: {
  listing: ListingSearchResult
  best: boolean
}) {
  const { t } = useTranslation()
  const qc = qualityChipProps(listing)
  return (
    <Card variant="outlined" sx={{ height: "100%", "&:hover": { borderColor: "secondary.main" } }}>
      <CardActionArea component={RouterLink} to={formatMarketUrl(listing)} sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }} noWrap>
              {listing.shop_name}
            </Typography>
            {qc && (
              <Chip
                label={qc.label}
                size="small"
                sx={{ height: 20, fontSize: "0.65rem", bgcolor: qc.color, color: "#fff" }}
              />
            )}
            {best && <Chip label="Best" size="small" color="primary" sx={{ height: 20 }} />}
          </Stack>
          <MarketListingRating
            avg_rating={listing.shop_rating}
            rating_count={listing.shop_rating_count ?? null}
            total_rating={0}
            rating_streak={null}
            total_orders={null}
            total_assignments={null}
            response_rate={null}
            badge_ids={[]}
            display_limit={0}
            showBadges={false}
          />
          <Typography variant="h6" sx={{ color: "primary.main", mt: 1 }}>
            {formatPrice(listing.price_min)}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.primary" }}>
            {listing.quantity_available != null
              ? t("MarketRedesign.available", "{{count}} available", {
                  count: listing.quantity_available,
                })
              : ""}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
