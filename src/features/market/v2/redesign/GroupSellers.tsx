import { useMemo } from "react"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Grow,
  Typography,
} from "@mui/material"
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { formatShortSlug } from "../../domain/urls"
import type { GameItemListingResult } from "../../../../store/api/v2/market"
import { useGetListingsQuery } from "../../../../store/api/v2/market"
import { useFormatters } from "../../../../util/format"
import { useAddToCart } from "../../hooks/useCartActions"
import { type SellerTag, sellerCards } from "./groupSellerRule"
import { GroupSellerRow, sellerRowFromVariant } from "./GroupSellerRow"

const TAG_LABELS: Record<SellerTag, { key: string; fallback: string }> = {
  lowestPrice: { key: "MarketRedesign.lowestPrice", fallback: "Lowest price" },
  highestQuality: {
    key: "MarketRedesign.highestQuality",
    fallback: "Highest quality",
  },
  topRated: { key: "MarketRedesign.topRated", fallback: "Top rated seller" },
}

/**
 * GroupSellers — the SELL side of an item's market depth. Fetched server-side
 * by game_item_id (per-variant), so it covers ALL sellers, not just the search
 * page. One card per seller (groupSellerRule.ts, the same rule as the collapsed
 * card's "N sellers"): the lowest price, highest quality and top rated sellers
 * first, carrying their tags, then every other seller. Each card is the exact
 * unit a buyer adds to cart (listing_id + variant_id). The summary line above
 * the cards counts the same sellers. "See all" opens the aggregate page for
 * the complete, filterable depth.
 */
export function GroupSellers({
  gameItemId,
  gameItemName,
}: {
  gameItemId: string
  gameItemName: string
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
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

  const cards = useMemo(() => sellerCards(variants), [variants])
  const priceMin = Math.min(...variants.map((v) => v.price))
  const priceMax = Math.max(...variants.map((v) => v.price))
  const totalQuantity = variants.reduce(
    (sum, v) => sum + (v.quantity_available ?? 0),
    0,
  )

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
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 1.5 }}
        data-testid="group-sellers-summary"
      >
        {fmt.priceRange(priceMin, priceMax)} {"·"}{" "}
        {t("MarketRedesign.sellersCount", "{{count}} sellers", {
          count: cards.length,
        })}{" "}
        {"·"}{" "}
        {t("MarketRedesign.unitsAvailable", "{{count}} units available", {
          count: totalQuantity,
        })}
      </Typography>
      <Grid container spacing={1.5}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={4} key={c.shop_id}>
            <Grow
              in
              timeout={300}
              style={{
                transformOrigin: "top",
                transitionDelay: `${Math.min(i, 6) * 40}ms`,
              }}
            >
              <Box sx={{ height: "100%" }}>
                <VariantHighlightCard variant={c.variant} tags={c.tags} />
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
 * One seller: the shared seller row (the listing card's details, compact)
 * with the superlative tags it wins (lowest price / highest quality / top
 * rated; none for the other sellers) and an add-to-cart button for that
 * exact variant.
 */
function VariantHighlightCard({
  variant,
  tags,
}: {
  variant: GameItemListingResult
  tags: SellerTag[]
}) {
  const { t } = useTranslation()
  return (
    <GroupSellerRow
      row={sellerRowFromVariant(variant)}
      tags={tags.map((tag) => (
        <Chip
          key={tag}
          label={t(TAG_LABELS[tag].key, TAG_LABELS[tag].fallback)}
          size="small"
          color="primary"
          sx={{ height: 18, fontSize: "0.6rem" }}
        />
      ))}
      action={<AddVariantButton variant={variant} />}
    />
  )
}
