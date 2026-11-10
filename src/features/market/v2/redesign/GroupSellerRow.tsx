import React from "react"
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { linkColor } from "../../../../hooks/styles/Theme"
import { NUMERIC_SX } from "../../../../hooks/styles/theme/fonts"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { useFormatters, useNow } from "../../../../util/format"
import {
  type QualityColor,
  qualityChipSx,
  qualityRangeChip,
  qualityTierColor,
  qualityValueColor,
} from "../../../../util/qualityColor"
import type {
  GameItemListingResult,
  ListingSearchResult,
  SellerActivity,
} from "../../../../store/api/v2/market"
import { MarketListingRating } from "../../../../components/rating/ListingRating"
import { SellerStatusBadge } from "../../../../components/presence/SellerStatusBadge"
import { TagChip } from "../../../../components/tags/TagChip"
import { SHOP_PATHS } from "../../../../routes/paths"
import { isListingNew } from "../../domain/listingBadges"
import { formatMarketUrl } from "../../domain/urls"

/**
 * One seller in a grouped listing's expansion, carrying what a top-level
 * listing card (ListingCardV2) shows for it: the listing photo, title, shop
 * (linked to its profile), rating and badges, seller activity, price,
 * quality, stock, the NEW / bulk discount / out of stock / internal /
 * unlisted chips, and when it was last updated. Compact: a thumbnail beside
 * the details, so it reads as a row on a phone.
 */
export interface SellerRowData {
  listingUrl: string
  /** The listing's first photo (the card's image); FALLBACK_IMAGE_URL when absent. */
  photo?: string
  title: string
  /** The variant (quality) this row sells, when the row is one variant. */
  variantLabel: string | null
  shopName: string
  shopSlug: string
  shopRating: number
  shopRatingCount: number
  shopBadgeIds: string[]
  activity?: SellerActivity
  priceMin: number
  priceMax: number
  quantity: number
  quantityUnit: "unit" | "scu"
  quality: { label: string; color: QualityColor } | null
  createdAt: string
  updatedAt?: string
  hasBulkDiscount: boolean
  visibility: "public" | "private" | "unlisted"
}

/** Quality chip for one variant (a single tier or value, not a range). */
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

/** A per-variant row of /game-items/{id}/listings. */
export function sellerRowFromVariant(v: GameItemListingResult): SellerRowData {
  return {
    listingUrl: formatMarketUrl(v),
    photo: v.photo,
    title: v.title,
    variantLabel: v.variant_display_name || v.variant_short_name || null,
    shopName: v.shop_name,
    shopSlug: v.shop_slug,
    shopRating: v.shop_rating,
    shopRatingCount: v.shop_rating_count,
    shopBadgeIds: v.shop_badge_ids,
    activity: v.shop_activity,
    priceMin: v.price,
    priceMax: v.price,
    quantity: v.quantity_available,
    quantityUnit: v.quantity_unit,
    quality: variantQualityChip(v),
    createdAt: v.created_at,
    updatedAt: v.updated_at,
    hasBulkDiscount: v.has_bulk_discount,
    visibility: v.visibility,
  }
}

/** A search result row (the group's own listings, when it has no item id). */
export function sellerRowFromListing(l: ListingSearchResult): SellerRowData {
  return {
    listingUrl: formatMarketUrl(l),
    photo: l.photo,
    title: l.title,
    variantLabel: null,
    shopName: l.shop_name,
    shopSlug: l.shop_slug,
    shopRating: l.shop_rating,
    shopRatingCount: l.shop_rating_count,
    shopBadgeIds: l.shop_badge_ids,
    activity: l.shop_activity,
    priceMin: l.price_min,
    priceMax: l.price_max,
    quantity: l.quantity_available,
    quantityUnit: l.quantity_unit,
    quality: qualityRangeChip(l),
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    hasBulkDiscount: l.has_bulk_discount === true,
    visibility: l.visibility ?? "public",
  }
}

const ROW_CHIP_SX = {
  height: 18,
  fontSize: "0.6rem",
  textTransform: "uppercase" as const,
  fontWeight: "bold" as const,
}

/** The card's status chips, small: NEW, bulk discount, out of stock, internal, unlisted. */
function SellerRowFlags({ row }: { row: SellerRowData }) {
  const { t } = useTranslation()
  const now = useNow()
  const isNew = isListingNew(row.createdAt, new Date(now))
  return (
    <>
      {isNew && (
        <Chip
          label={t("market.new", "NEW")}
          variant="outlined"
          size="small"
          sx={ROW_CHIP_SX}
        />
      )}
      {row.hasBulkDiscount && (
        <TagChip
          tag="discount"
          label={t("market.bulkDiscount", "BULK DISCOUNT")}
          sx={ROW_CHIP_SX}
        />
      )}
      {row.quantity === 0 && (
        <Chip
          label={t("market.outOfStock", "OUT OF STOCK")}
          color="error"
          size="small"
          sx={ROW_CHIP_SX}
        />
      )}
      {row.visibility === "private" && (
        <Chip
          label={t("market.internalListing")}
          color="warning"
          size="small"
          sx={ROW_CHIP_SX}
        />
      )}
      {row.visibility === "unlisted" && (
        <Chip
          label={t("market.unlistedListing", "Unlisted")}
          size="small"
          sx={ROW_CHIP_SX}
        />
      )}
    </>
  )
}

export function GroupSellerRow({
  row,
  tags,
  action,
}: {
  row: SellerRowData
  /** Superlative chips (Lowest price, Highest quality, Top rated, ...). */
  tags?: React.ReactNode
  /** Right of the price: e.g. the add-to-cart button. */
  action?: React.ReactNode
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const now = useNow()
  const updated = row.updatedAt ? fmt.relative(row.updatedAt, now) : ""
  const stock = [
    t("marketV2.availShort", {
      quantity: fmt.quantity(row.quantity, row.quantityUnit),
    }),
    updated &&
      t("MarketRedesign.sellerUpdated", "Updated {{time}}", { time: updated }),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card
      variant="outlined"
      data-testid="group-seller-row"
      sx={{ height: "100%", "&:hover": { borderColor: "outline.strong" } }}
    >
      <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            component={RouterLink}
            to={row.listingUrl}
            sx={{ flexShrink: 0, lineHeight: 0 }}
          >
            <Box
              component="img"
              src={row.photo || FALLBACK_IMAGE_URL}
              alt={t("marketV2.imageOf", { name: row.title })}
              loading="lazy"
              width={64}
              height={64}
              data-testid="group-seller-thumbnail"
              sx={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 0.5, "&:empty": { display: "none" } }}
            >
              {tags}
              {row.quality && (
                <Chip
                  label={row.quality.label}
                  size="small"
                  sx={{
                    ...ROW_CHIP_SX,
                    textTransform: "none",
                    ...qualityChipSx(row.quality.color),
                  }}
                />
              )}
              <SellerRowFlags row={row} />
            </Stack>
            <Typography
              component={RouterLink}
              to={row.listingUrl}
              variant="body2"
              noWrap
              sx={{
                display: "block",
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: linkColor },
              }}
            >
              {row.title}
            </Typography>
            {row.variantLabel && (
              <Typography
                variant="caption"
                sx={{ color: "text.primary", display: "block" }}
                noWrap
              >
                {row.variantLabel}
              </Typography>
            )}
            <Typography
              component={RouterLink}
              to={SHOP_PATHS.profile(row.shopSlug)}
              variant="caption"
              noWrap
              sx={{
                display: "block",
                color: "text.secondary",
                textDecoration: "underline",
                "&:hover": { color: linkColor },
              }}
            >
              {row.shopName}
            </Typography>
            <MarketListingRating
              avg_rating={row.shopRating}
              rating_count={row.shopRatingCount}
              total_rating={0}
              rating_streak={null}
              total_orders={null}
              total_assignments={null}
              response_rate={null}
              badge_ids={row.shopBadgeIds}
              display_limit={3}
              showBadges={true}
            />
            <SellerStatusBadge activity={row.activity} compact />
          </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="p"
              sx={{
                ...NUMERIC_SX,
                color: "primary.main",
                fontSize: "1rem",
                fontWeight: 600,
              }}
              noWrap
            >
              {fmt.priceRange(row.priceMin, row.priceMax)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.primary", display: "block" }}
              noWrap
              data-testid="group-seller-stock"
            >
              {stock}
            </Typography>
          </Box>
          {action}
        </Stack>
      </CardContent>
    </Card>
  )
}
