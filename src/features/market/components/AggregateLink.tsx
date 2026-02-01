import React from "react"
import { Skeleton } from "@mui/material"
import { UniqueListing, MarketAggregate, MarketAggregateListing } from "../domain/types"
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
 * AggregateLink component displays a link to view all listings for the same game item.
 * Only renders when the listing has an associated game_item_id.
 */
export function AggregateLink(props: AggregateLinkProps) {
  const { listing } = props

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

  // TODO: Implement button rendering and average price display
  return null
}
