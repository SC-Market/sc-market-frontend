import { useEffect, useState } from "react"
import {
  CounterOfferBody,
  useGetOfferSessionByIDQuery,
} from "../../../store/offer"

/**
 * Page hook for counter offer form page
 * Manages offer session data and counter offer form state
 */
export function usePageCounterOffer(offerId: string | undefined) {
  const offerQuery = useGetOfferSessionByIDQuery(offerId!, {
    skip: !offerId,
  })

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

  // Initialize counter offer from session data
  useEffect(() => {
    if (offerQuery.data) {
      const session = offerQuery.data
      setCounterOffer({
        cost: session.offers[0].cost,
        description: session.offers[0].description,
        kind: session.offers[0].kind,
        payment_type: session.offers[0].payment_type,
        session_id: session.id,
        service_id: session.offers[0].service?.service_id ?? null,
        title: session.offers[0].title,
        market_listings: session.offers[0].market_listings,
        status: "counteroffered",
      })
    }
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
