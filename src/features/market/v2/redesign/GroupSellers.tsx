import { useMemo } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Grow,
  Stack,
  Typography,
} from "@mui/material"
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { linkColor } from "../../../../hooks/styles/Theme"
import { formatMarketUrl, formatShortSlug } from "../../domain/urls"
import type { GameItemListingResult } from "../../../../store/api/v2/market"
import { useGetListingsQuery } from "../../../../store/api/v2/market"
import { MarketListingRating } from "../../../../components/rating/ListingRating"
import {
  type QualityColor,
  qualityChipSx,
  qualityTierColor,
  qualityValueColor,
} from "../../../../util/qualityColor"
import { useFormatters } from "../../../../util/format"
import { useAddToCart } from "../../hooks/useCartActions"

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
export function GroupSellers({
  gameItemId,
  gameItemName,
}: {
  gameItemId: string
  gameItemName: string
}) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Thread the page's active quality-tier filter into the per-variant fetch so
  // the expanded group reflects the same filtered set as the grid. The
  // /game-items/{id}/listings endpoint accepts a single `qualityTier` only, so
  // we forward it when the page filters to one specific tier (min === max, or a
  // lone bound). Broader tier ranges and price bounds are NOT supported by that
  // endpoint (see GetListingsApiArg) — those remain a known limitation of the
  // expanded view.
  const qualityTier = useMemo(() => {
    const min = searchParams.get("quality_tier_min")
    const max = searchParams.get("quality_tier_max")
    if (min && max) return min === max ? Number(min) : undefined
    if (min) return Number(min)
    if (max) return Number(max)
    return undefined
  }, [searchParams])

  const { data, isLoading, error } = useGetListingsQuery({
    id: gameItemId,
    qualityTier,
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
    const keyOf = (v: GameItemListingResult) =>
      `${v.listing_id}:${v.variant_id}`

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
    const add = (
      v: GameItemListingResult,
      labelKey: string,
      labelFallback: string,
    ) => {
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
      <Grid container spacing={1.5}>
        {highlights.map((h, i) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={`${h.variant.listing_id}:${h.variant.variant_id}`}
          >
            <Grow
              in
              timeout={300}
              style={{
                transformOrigin: "top",
                transitionDelay: `${Math.min(i, 6) * 40}ms`,
              }}
            >
              <Box sx={{ height: "100%" }}>
                <VariantHighlightCard variant={h.variant} tags={h.tags} />
              </Box>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Button
        component={RouterLink}
        to={`/market/aggregate/${formatShortSlug(gameItemId, gameItemName)}`}
        size="small"
        variant="text"
        sx={{ mt: 1.5 }}
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
): { label: string; color: QualityColor } | null {
  if (v.quality_value != null) {
    return {
      label: `${v.quality_value}`,
      color: qualityValueColor(v.quality_value),
    }
  }
  if (v.quality_tier != null) {
    return {
      label: `Q${v.quality_tier}`,
      color: qualityTierColor(v.quality_tier),
    }
  }
  return null
}

function variantLabel(v: GameItemListingResult): string | null {
  return v.variant_display_name || v.variant_short_name || null
}

/** Add-to-cart button for a variant row — the unit buyers actually purchase. */
function AddVariantButton({ variant }: { variant: GameItemListingResult }) {
  const { t } = useTranslation()
  const { add: addToCart, isAdding: isLoading } = useAddToCart()
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
        void addToCart({
          listing_id: variant.listing_id,
          variant_id: variant.variant_id,
          quantity: 1,
        })
      }}
      sx={{ minWidth: 0, px: 1 }}
    >
      {t("MarketRedesign.addToCart", "Add")}
    </Button>
  )
}

/**
 * One highlight as a rich card (lowest price / highest quality / top rated).
 * Carries all superlative tags it wins, its quality chip, shop rating, price,
 * availability, and an add-to-cart button for that exact variant.
 */
function VariantHighlightCard({
  variant,
  tags,
}: {
  variant: GameItemListingResult
  tags: HighlightTag[]
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const qc = variantQualityChip(variant)
  const label = variantLabel(variant)
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", "&:hover": { borderColor: "outline.strong" } }}
    >
      <CardContent>
        {/* Superlative tags (Lowest price / Highest quality / Top rated) */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 1 }}
          flexWrap="wrap"
          useFlexGap
        >
          {tags.map((tag) => (
            <Chip
              key={tag.labelKey}
              label={t(tag.labelKey, tag.labelFallback)}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: 0.5 }}
          flexWrap="wrap"
          useFlexGap
        >
          <RouterLink
            to={formatMarketUrl(variant)}
            style={{
              textDecoration: "none",
              color: "inherit",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                "&:hover": { color: linkColor },
              }}
              noWrap
            >
              {variant.shop_name}
            </Typography>
          </RouterLink>
          {qc && (
            <Chip
              label={qc.label}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                ...qualityChipSx(qc.color),
              }}
            />
          )}
        </Stack>

        {label && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            noWrap
          >
            {label}
          </Typography>
        )}

        <MarketListingRating
          avg_rating={variant.shop_rating}
          rating_count={variant.shop_rating_count ?? null}
          total_rating={0}
          rating_streak={null}
          total_orders={null}
          total_assignments={null}
          response_rate={null}
          badge_ids={variant.shop_badge_ids}
          display_limit={3}
          showBadges={true}
        />

        <Typography variant="h6" sx={{ color: "primary.main", mt: 1 }}>
          {fmt.price(variant.price)}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 0.5 }}
        >
          <Typography variant="caption" sx={{ color: "text.primary" }}>
            {variant.quantity_available != null
              ? t("MarketRedesign.available", "{{count}} available", {
                  count: variant.quantity_available,
                })
              : ""}
          </Typography>
          <AddVariantButton variant={variant} />
        </Stack>
      </CardContent>
    </Card>
  )
}
