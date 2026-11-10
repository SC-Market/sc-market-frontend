import { Chip, Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import type { ListingSearchResult } from "../../../../store/api/v2/market"
import { GroupSellerRow, sellerRowFromListing } from "./GroupSellerRow"

/**
 * GroupSellersFallback — used only when a group has no game_item_id (shouldn't
 * happen with current search results, but kept as a safe fallback). Renders the
 * client-grouped per-LISTING rows, with the same seller row as GroupSellers,
 * without the per-variant fetch or add-to-cart.
 */
export function GroupSellersFallback({
  listings,
}: {
  listings: ListingSearchResult[]
}) {
  const { t } = useTranslation()
  return (
    <Grid container spacing={1.5}>
      {listings.map((s, i) => (
        <Grid item xs={12} sm={6} md={4} key={s.listing_id}>
          <GroupSellerRow
            row={sellerRowFromListing(s)}
            tags={
              i === 0 && (
                <Chip
                  label={t("marketV2.bestPrice")}
                  size="small"
                  color="primary"
                  sx={{ height: 18, fontSize: "0.6rem" }}
                />
              )
            }
          />
        </Grid>
      ))}
    </Grid>
  )
}
