import { Chip, Divider, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { isListingNew } from "../../domain/listingBadges"
import { linkColor } from "../../../../hooks/styles/Theme"
import { formatMarketUrl } from "../../domain/urls"
import type { ListingSearchResult } from "../../../../store/api/v2/market"
import { qualityChipSx, qualityRangeChip } from "../../../../util/qualityColor"
import { useFormatters, useNow } from "../../../../util/format"
import { TagChip } from "../../../../components/tags/TagChip"

/**
 * Per-listing flag chips (NEW / OUT OF STOCK / BULK DISCOUNT / internal), shared
 * by both expanded seller views so each seller reflects the same chips a
 * standalone ListingCardV2 would show for it. Small/dense variant for rows.
 */
function ListingFlagChips({ listing }: { listing: ListingSearchResult }) {
  const { t } = useTranslation()
  const now = useNow()
  const isNew = isListingNew(listing.created_at, new Date(now))
  const outOfStock = (listing.quantity_available ?? 0) === 0
  const chipSx = {
    height: 18,
    fontSize: "0.6rem",
    textTransform: "uppercase" as const,
    fontWeight: "bold" as const,
  }
  return (
    <>
      {isNew && (
        <Chip
          label={t("market.new", "NEW")}
          variant="outlined"
          size="small"
          sx={chipSx}
        />
      )}
      {outOfStock && (
        <Chip
          label={t("market.outOfStock", "OUT OF STOCK")}
          color="error"
          size="small"
          sx={chipSx}
        />
      )}
      {listing.has_bulk_discount && (
        <TagChip
          tag="discount"
          label={t("market.bulkDiscount", "BULK")}
          sx={chipSx}
        />
      )}
      {listing.visibility === "private" && (
        <Chip
          label={t("market.internalListing", "INTERNAL")}
          color="warning"
          size="small"
          sx={chipSx}
        />
      )}
    </>
  )
}

/**
 * GroupSellersFallback — used only when a group has no game_item_id (shouldn't
 * happen with current search results, but kept as a safe fallback). Renders the
 * client-grouped per-LISTING rows without the per-variant fetch or add-to-cart.
 */
export function GroupSellersFallback({
  listings,
}: {
  listings: ListingSearchResult[]
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  return (
    <Stack divider={<Divider />}>
      {listings.map((s, i) => {
        const qc = qualityRangeChip(s)
        return (
          <Stack
            key={s.listing_id}
            component={RouterLink}
            to={formatMarketUrl(s)}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              py: 1,
              textDecoration: "none",
              color: "inherit",
              "&:hover": { color: linkColor },
            }}
          >
            <Typography
              variant="body2"
              sx={{ flex: 1, color: "text.secondary" }}
              noWrap
            >
              {s.shop_name}
            </Typography>
            <ListingFlagChips listing={s} />
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
            {i === 0 && (
              <Chip
                label={t("marketV2.bestPrice")}
                size="small"
                color="primary"
                sx={{ height: 20 }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                width: 110,
                textAlign: "right",
              }}
            >
              {fmt.price(s.price_min)}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}
