/**
 * ListingsPreviewWidget — a strip of a few marketplace listings, configurable to
 * either a free-text search or a specific game item. Reuses the market search
 * hook and the same card/wrapper as the landing page's recent-listings row.
 *
 * Settings:
 *  - `query`      (string) full-text search; used when no gameItemId is set
 *  - `gameItemId` (string) pin to a specific catalog item
 *  - `gameItemName` (string) display label for the pinned item
 *  - `limit`      (number) how many cards to show (default 6)
 */

import { Box, Skeleton, Stack, Typography } from "@mui/material"
import type { TFunction } from "i18next"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"
import { ListingWrapper } from "../../market/components/listings/ListingWrapper"
import type { DashboardWidget } from "../types"

export interface ListingsPreviewWidgetProps {
  settings?: DashboardWidget["settings"]
  t: TFunction
}

export function ListingsPreviewWidget({
  settings,
  t,
}: ListingsPreviewWidgetProps) {
  const gameItemId =
    typeof settings?.gameItemId === "string" ? settings.gameItemId : ""
  const query = typeof settings?.query === "string" ? settings.query : ""
  const limit =
    typeof settings?.limit === "number" && settings.limit > 0
      ? Math.min(settings.limit, 12)
      : 6

  const { data, isLoading } = useSearchListingsQuery({
    ...(gameItemId ? { gameItemId } : { text: query }),
    pageSize: limit,
    status: "active",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box display="flex" gap={1}>
          {Array.from({ length: limit }).map((_, i) => (
            <ListingWrapper key={i} useFixedWidth>
              <Skeleton variant="rounded" height={280} />
            </ListingWrapper>
          ))}
        </Box>
      </Box>
    )
  }

  if (!data || data.listings.length === 0) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%", p: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.listingsPreview.empty", "No matching listings found.")}
        </Typography>
      </Stack>
    )
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box display="flex" gap={1}>
        {data.listings.map((listing, index) => (
          <ListingWrapper key={listing.listing_id} useFixedWidth>
            <ListingCardV2 listing={listing} index={index} />
          </ListingWrapper>
        ))}
      </Box>
    </Box>
  )
}
