import { useEffect, useState } from "react"
import { useGetOfferSessionQuery } from "../../../store/api/v2/market"
import type { GetOfferSessionV2Response } from "../../../store/api/v2/market"
import { CounterOfferBody } from "../domain/types"

/**
 * Page hook for counter offer form page.
 * Uses V2 API to read session, populates CounterOfferBody with V2 variant items.
 */
export function usePageCounterOffer(offerId: string | undefined) {
  const offerQuery = useGetOfferSessionQuery(
    { sessionId: offerId! },
    { skip: !offerId },
  )

  const [counterOffer, setCounterOffer] = useState<CounterOfferBody>({
    cost: "0",
    description: "",
    kind: "",
    market_listings: [],
    payment_type: "",
    service_id: null,
    title: "",
    session_id: offerId || "",
    status: "counteroffered",
  })

  // Initialize counter offer from V2 session data
  useEffect(() => {
    if (!offerQuery.data) return
    const session = offerQuery.data
    const offer = session.offers[0]
    if (!offer) return

    // Build V2 variant items from market_listings_v2[].v2_variants
    const v2Items = (offer.market_listings_v2 || []).flatMap((ml) =>
      ml.v2_variants.map((v) => ({
        listing_id: ml.listing_id,
        variant_id: v.variant_id,
        quantity: v.quantity,
        price_per_unit: v.price_per_unit,
      })),
    )

    // Build flat market_listings for V1 compat (listing_id + quantity)
    const marketListings = offer.market_listings.map((ml) => ({
      listing_id: ml.listing_id,
      quantity: ml.quantity,
    }))

    setCounterOffer({
      cost: String(offer.cost),
      description: offer.description,
      kind: offer.kind,
      payment_type: offer.payment_type,
      session_id: session.session_id,
      service_id: offer.service?.service_id ?? null,
      title: offer.title,
      market_listings: marketListings,
      status: "counteroffered",
      v2_variant_items: v2Items.length > 0 ? v2Items : undefined,
    })
  }, [offerQuery.data])

  return {
    data: offerQuery.data
      ? {
          session: offerQuery.data,
          counterOffer,
          setCounterOffer,
        }
      : undefined,
    isLoading: offerQuery.isLoading,
    isFetching: offerQuery.isFetching,
    error: offerQuery.error,
    refetch: () => {
      offerQuery.refetch()
    },
  }
}
