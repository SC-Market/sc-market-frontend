import React from "react"
import { Skeleton, Button, Typography, Box } from "@mui/material"
import { CompareArrowsRounded } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { UniqueListing, MarketAggregateListing } from "../domain/types"
import { useGetAggregateByIdQuery } from "../api/marketApi"

export interface AggregateLinkProps {
  listing: UniqueListing
}

/**
 * Helper function to calculate the count of active listings with available quantity.
 * Filters out the current listing and inactive/unavailable listings.
 * 
 * Sub-task 3.1: Calculate listing count
 * Requirements: 1.5, 2.2, 2.3
 * 
 * @param listings - Array of aggregate listings
 * @param currentListingId - ID of the current listing to exclude
 * @returns Count of active listings with quantity > 0, excluding current listing
 */
export function calculateListingCount(
  listings: MarketAggregateListing[],
  currentListingId: string
): number {
  return listings.filter(
    (listing) =>
      listing.status === "active" &&
      listing.quantity_available > 0 &&
      listing.listing_id !== currentListingId
  ).length
}

/**
 * Helper function to calculate the average price of active listings.
 * Uses the same filtering as listing count calculation.
 * 
 * Sub-task 3.2: Calculate average price
 * Requirements: 2.1, 2.2, 2.3, 2.4
 * 
 * @param listings - Array of aggregate listings
 * @param currentListingId - ID of the current listing to exclude
 * @returns Average price of filtered listings, or null if no listings remain
 */
export function calculateAveragePrice(
  listings: MarketAggregateListing[],
  currentListingId: string
): number | null {
  const filteredListings = listings.filter(
    (listing) =>
      listing.status === "active" &&
      listing.quantity_available > 0 &&
      listing.listing_id !== currentListingId
  )

  if (filteredListings.length === 0) {
    return null
  }

  const totalPrice = filteredListings.reduce(
    (sum, listing) => sum + listing.price,
    0
  )

  return totalPrice / filteredListings.length
}

/**
 * Helper function to format price with locale-specific formatting and aUEC suffix.
 * Handles null/undefined values gracefully.
 * 
 * Sub-task 5.2: Implement price formatting
 * Requirements: 2.5
 * 
 * @param price - Price value to format, or null/undefined
 * @param locale - User's locale from i18n
 * @returns Formatted price string with " aUEC" suffix, or null if price is null/undefined
 */
export function formatPrice(price: number | null | undefined, locale: string): string | null {
  if (price === null || price === undefined) {
    return null
  }

  return `${price.toLocaleString(locale)} aUEC`
}

/**
 * AggregateLink component displays a link to view all listings for the same game item.
 * Only renders when the listing has an associated game_item_id.
 */
/**
 * Compute percentage difference of listing price vs average: (listing - avg) / avg * 100.
 * Positive = listing is more expensive, negative = listing is cheaper.
 */
function percentDiff(listingPrice: number, avgPrice: number): number {
  if (avgPrice === 0) return 0
  return ((listingPrice - avgPrice) / avgPrice) * 100
}

export function AggregateLink(props: AggregateLinkProps) {
  const { listing } = props
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  if (!listing.details.game_item_id) {
    return null
  }

  const { data: aggregate, isLoading, error } = useGetAggregateByIdQuery(
    listing.details.game_item_id
  )

  if (error) {
    return null
  }

  if (isLoading) {
    return <Skeleton variant="rounded" width={200} height={32} />
  }

  if (!aggregate?.listings) {
    return null
  }

  const otherListings = aggregate.listings.filter(
    (l) =>
      l.status === "active" &&
      l.quantity_available > 0 &&
      l.listing_id !== listing.listing.listing_id
  )

  if (otherListings.length === 0) {
    return null
  }

  const avgPrice =
    otherListings.reduce((sum, l) => sum + l.price, 0) / otherListings.length
  const listingPrice = listing.listing.price
  const pct = percentDiff(listingPrice, avgPrice)
  const pctFormatted =
    pct >= 0
      ? `+${pct.toFixed(0)}%`
      : `${pct.toFixed(0)}%`

  return (
    <Box>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CompareArrowsRounded />}
        onClick={() =>
          navigate(`/market/aggregate/${listing.details.game_item_id}`)
        }
      >
        {t("MarketListingView.seeOtherListings", {
          count: otherListings.length,
          defaultValue: `See ${otherListings.length} other listings`,
        })}{" "}
        <Typography
          component="span"
          variant="caption"
          color={pct > 0 ? "error.main" : pct < 0 ? "success.main" : "text.secondary"}
          sx={{ ml: 0.5 }}
        >
          ({pctFormatted})
        </Typography>
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {t("MarketListingView.averagePrice", { defaultValue: "Average price" })}:{" "}
        {avgPrice.toLocaleString(i18n.language)} aUEC
      </Typography>
    </Box>
  )
}
