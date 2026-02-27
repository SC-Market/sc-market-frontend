import React from "react"
import { Box, Chip, Stack, Typography } from "@mui/material"
import {
  PersonRounded,
  CreateRounded,
  RefreshRounded,
  WarningRounded,
  VisibilityRounded,
  SportsEsportsRounded,
  AccessTimeRounded,
  LocationOnRounded,
} from "@mui/icons-material"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { subDays } from "date-fns"
import { getRelativeTime } from "../../../../util/time"
import { ListingDetailItem } from "./ListingDetailItem"
import { ListingNameAndRating } from "../../../../components/rating/ListingRating"
import { ReportButton } from "../../../../components/button/ReportButton"
import type { BaseListingType } from "../../domain/types"

interface ListingDetailsGridProps {
  listing: BaseListingType
  viewCount: number
}

export function ListingDetailsGrid({ listing, viewCount }: ListingDetailsGridProps) {
  const { t } = useTranslation()
  const items: React.ReactNode[] = []

  // Seller name/rating (always first)
  items.push(
    <ListingDetailItem
      key="seller"
      icon={<PersonRounded fontSize={"inherit"} />}
    >
      <ListingNameAndRating
        user={listing.listing.user_seller}
        contractor={listing.listing.contractor_seller}
      />
    </ListingDetailItem>
  )

  // Online status
  if (listing.listing.user_seller?.in_game) {
    items.push(
      <ListingDetailItem
        key="online"
        icon={<SportsEsportsRounded fontSize={"inherit"} sx={{ color: "success.main" }} />}
      >
        {t("MarketListingView.online", "Online")}
      </ListingDetailItem>
    )
  }

  // Members online
  if (listing.listing.contractor_seller?.members_online !== undefined && listing.listing.contractor_seller.members_online > 0) {
    items.push(
      <ListingDetailItem
        key="members-online"
        icon={<SportsEsportsRounded fontSize={"inherit"} sx={{ color: "success.main" }} />}
      >
        {t("MarketListingView.membersOnline", "{{count}} members online", { count: listing.listing.contractor_seller.members_online })}
      </ListingDetailItem>
    )
  }

  // Last seen
  if (listing.listing.user_seller?.last_seen || listing.listing.contractor_seller?.last_seen) {
    items.push(
      <ListingDetailItem
        key="last-seen"
        icon={<AccessTimeRounded fontSize={"inherit"} />}
      >
        {t("MarketListingView.lastSeen", "Last seen")}{" "}
        {getRelativeTime(new Date(listing.listing.user_seller?.last_seen || listing.listing.contractor_seller?.last_seen || ""))}
      </ListingDetailItem>
    )
  }

  // Stock locations
  if (listing.listing.stock_locations && listing.listing.stock_locations.length > 0) {
    items.push(
      <ListingDetailItem
        key="locations"
        icon={<LocationOnRounded fontSize={"inherit"} />}
      >
        {t("MarketListingView.stockLocations", "Available from")}: {listing.listing.stock_locations.join(", ")}
      </ListingDetailItem>
    )
  }

  // Listed date
  items.push(
    <ListingDetailItem
      key="listed"
      icon={<CreateRounded fontSize={"inherit"} />}
    >
      {t("MarketListingView.listed")}{" "}
      {getRelativeTime(new Date(listing.listing.timestamp))}
    </ListingDetailItem>
  )

  // Updated date
  items.push(
    <ListingDetailItem
      key="updated"
      icon={<RefreshRounded fontSize={"inherit"} />}
    >
      {t("MarketListingView.updated")}{" "}
      {getRelativeTime(subDays(new Date(listing.listing.expiration), 30))}
    </ListingDetailItem>
  )

  // Expires date
  items.push(
    <ListingDetailItem
      key="expires"
      icon={<ClockAlert fontSize={"inherit"} />}
    >
      {t("MarketListingView.expires")}{" "}
      {getRelativeTime(new Date(listing.listing.expiration))}
    </ListingDetailItem>
  )

  // View count
  items.push(
    <ListingDetailItem
      key="views"
      icon={<VisibilityRounded fontSize={"inherit"} />}
    >
      {t("MarketListingView.views")}{" "}
      {viewCount.toLocaleString()}
    </ListingDetailItem>
  )

  // Languages
  if (listing.listing.languages && listing.listing.languages.length > 0) {
    items.push(
      <ListingDetailItem
        key="languages"
        icon={<PersonRounded fontSize={"inherit"} />}
      >
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            {t("MarketListingView.languages", "Languages")}:
          </Typography>
          {listing.listing.languages.map((lang) => (
            <Chip
              key={lang.code}
              label={lang.name}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          ))}
        </Box>
      </ListingDetailItem>
    )
  }

  // Report button (always last)
  items.push(
    <ListingDetailItem
      key="report"
      icon={<WarningRounded fontSize={"inherit"} />}
    >
      <ReportButton
        reportedUrl={`/market/${listing.listing.listing_id}`}
      />
    </ListingDetailItem>
  )

  // Split items into two columns (more on left if odd)
  const midpoint = Math.ceil(items.length / 2)
  const leftItems = items.slice(0, midpoint)
  const rightItems = items.slice(midpoint)

  return (
    <Stack direction="row" spacing={2}>
      <Stack direction="column" spacing={0.5} flex={1}>
        {leftItems}
      </Stack>
      <Stack direction="column" spacing={0.5} flex={1}>
        {rightItems}
      </Stack>
    </Stack>
  )
}
