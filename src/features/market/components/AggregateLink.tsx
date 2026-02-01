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
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Early return when game_item_id is null (Requirement 1.3)
  if (!listing.details.game_item_id) {
    return null
  }

  // Sub-task 2.1: Fetch aggregate data using RTK Query hook (Requirements 4.1, 4.2)
  const { data: aggregate, isLoading, error } = useGetAggregateByIdQuery(
    listing.details.game_item_id,
    {
      skip: !listing.details.game_item_id, // Skip query when game_item_id is null
    }
  )

  // Sub-task 2.3: Implement error handling (Requirement 4.3)
  if (error) {
    console.error("Failed to fetch aggregate data:", error)
    return null // Graceful degradation - hide component on error
  }

  // Sub-task 2.2: Implement loading state with skeleton (Requirement 4.4)
  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={40}
        sx={{ borderRadius: 1 }}
      />
    )
  }

  // Calculate listing count excluding current listing
  if (!aggregate) {
    return null
  }

  const listingCount = calculateListingCount(
    aggregate.listings,
    listing.listing.listing_id
  )

  // Hide component if no other listings exist (Requirement 1.5)
  if (listingCount === 0) {
    return null
  }

  // Calculate average price excluding current listing
  const averagePrice = calculateAveragePrice(
    aggregate.listings,
    listing.listing.listing_id
  )

  // Sub-task 4.2: Implement navigation on button click (Requirement 1.2)
  const handleClick = () => {
    navigate(`/market/aggregate/${listing.details.game_item_id}`)
  }

  // Sub-task 4.1: Create button component with listing count (Requirements 1.1, 1.4, 3.2)
  // Sub-task 5.1: Create price comparison component (Requirements 2.1, 3.3)
  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<CompareArrowsRounded />}
        onClick={handleClick}
        fullWidth={isMobile}
        sx={{
          width: isMobile ? "100%" : "auto",
        }}
      >
        {t("MarketListingView.seeOtherListings", {
          count: listingCount,
          defaultValue: "See {{count}} other listings for this item",
        })}
      </Button>
      
      {averagePrice !== null && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {t("MarketListingView.averagePrice", { defaultValue: "Average price" })}:{" "}
          {formatPrice(averagePrice, i18n.language)}
        </Typography>
      )}
    </Box>
  )
}
