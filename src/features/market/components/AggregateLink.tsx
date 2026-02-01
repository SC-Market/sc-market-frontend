import React from "react"
import { Skeleton, Button, useMediaQuery, useTheme, Typography, Box } from "@mui/material"
import { CompareArrowsRounded } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { UniqueListing, MarketAggregate, MarketAggregateListing } from "../domain/types"
import { useGetAggregateByIdQuery } from "../api/marketApi"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

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
export function AggregateLink(props: AggregateLinkProps) {
  const { listing } = props
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  console.log("[AggregateLink] Rendering with listing:", {
    game_item_id: listing.details.game_item_id,
    listing_id: listing.listing.listing_id,
    title: listing.details.title
  })

  if (!listing.details.game_item_id) {
    console.log("[AggregateLink] No game_item_id, returning null")
    return null
  }

  const { data: aggregate, isLoading, error } = useGetAggregateByIdQuery(
    listing.details.game_item_id
  )

  console.log("[AggregateLink] Query result:", { 
    isLoading, 
    hasError: !!error, 
    hasAggregate: !!aggregate,
    listingsCount: aggregate?.listings?.length 
  })

  if (error) {
    console.error("[AggregateLink] Failed to fetch aggregate data:", error)
    return null
  }

  if (isLoading) {
    console.log("[AggregateLink] Loading...")
    return <Skeleton variant="rectangular" width="100%" height={60} />
  }

  if (!aggregate?.listings) {
    console.log("[AggregateLink] No aggregate or listings")
    return null
  }

  const otherListings = aggregate.listings.filter(
    (l) => l.status === "active" && 
           l.quantity_available > 0 && 
           l.listing_id !== listing.listing.listing_id
  )

  console.log("[AggregateLink] Other listings:", {
    total: aggregate.listings.length,
    filtered: otherListings.length,
    listings: aggregate.listings.map(l => ({
      id: l.listing_id,
      status: l.status,
      qty: l.quantity_available,
      isCurrent: l.listing_id === listing.listing.listing_id
    }))
  })

  if (otherListings.length === 0) {
    console.log("[AggregateLink] No other listings, returning null")
    return null
  }

  const avgPrice = otherListings.reduce((sum, l) => sum + l.price, 0) / otherListings.length

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<CompareArrowsRounded />}
        onClick={() => navigate(`/market/aggregate/${listing.details.game_item_id}`)}
        fullWidth
      >
        {t("MarketListingView.seeOtherListings", {
          count: otherListings.length,
          defaultValue: `See ${otherListings.length} other listings`,
        })}
      </Button>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {t("MarketListingView.averagePrice", { defaultValue: "Average price" })}:{" "}
        {avgPrice.toLocaleString(i18n.language)} aUEC
      </Typography>
    </Box>
  )
}
