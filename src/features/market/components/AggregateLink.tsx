import React from "react"
import { UniqueListing } from "../domain/types"

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

  // TODO: Implement aggregate data fetching and rendering
  return null
}
