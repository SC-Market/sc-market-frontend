import type { Offer } from "../features/offers/api/offerApi"
import type { OfferV2 } from "../store/api/v2/market"

export interface OfferChanges {
  costChanged: boolean
  descriptionChanged: boolean
  serviceChanged: boolean
  addedListings: Set<string> // listing_ids
  removedListings: Set<string> // listing_ids
  quantityChanges: Map<string, { old: number; new: number }> // listing_id -> quantities
}

/** Minimal shape needed for change detection — works with both V1 Offer and V2 OfferV2 */
interface OfferLike {
  cost: string | number
  description: string
  service?: { service_id: string } | null
  market_listings: Array<{ listing_id: string; quantity: number }>
}

export function detectOfferChanges(
  currentOffer: OfferLike,
  previousOffer: OfferLike | undefined,
): OfferChanges | null {
  if (!previousOffer) {
    return null // No previous offer to compare
  }

  const changes: OfferChanges = {
    costChanged: currentOffer.cost !== previousOffer.cost,
    descriptionChanged: currentOffer.description !== previousOffer.description,
    serviceChanged:
      currentOffer.service?.service_id !== previousOffer.service?.service_id,
    addedListings: new Set(),
    removedListings: new Set(),
    quantityChanges: new Map(),
  }

  // Create maps for easy lookup
  const currentListings = new Map(
    currentOffer.market_listings.map((l) => [l.listing_id, l.quantity]),
  )
  const previousListings = new Map(
    previousOffer.market_listings.map((l) => [l.listing_id, l.quantity]),
  )

  // Find added and quantity changes
  currentListings.forEach((quantity, listingId) => {
    if (!previousListings.has(listingId)) {
      changes.addedListings.add(listingId)
    } else if (previousListings.get(listingId) !== quantity) {
      changes.quantityChanges.set(listingId, {
        old: previousListings.get(listingId)!,
        new: quantity,
      })
    }
  })

  // Find removed listings
  previousListings.forEach((_, listingId) => {
    if (!currentListings.has(listingId)) {
      changes.removedListings.add(listingId)
    }
  })

  return changes
}
