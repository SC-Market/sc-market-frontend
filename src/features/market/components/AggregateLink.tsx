import React from "react"
import { Skeleton } from "@mui/material"
import { UniqueListing } from "../domain/types"
import { useGetAggregateByIdQuery } from "../api/marketApi"

export interface AggregateLinkProps {
  listing: UniqueListing
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
