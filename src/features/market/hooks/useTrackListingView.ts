import { useEffect } from "react"
import { useTrackViewMutation } from "../../../store/api/v2/market"

/** Count a view of the listing once per listing shown. Failures are ignored. */
export function useTrackListingView(listingId: string | undefined) {
  const [trackView] = useTrackViewMutation()
  useEffect(() => {
    if (listingId) trackView({ id: listingId }).catch(() => {})
  }, [listingId, trackView])
}
