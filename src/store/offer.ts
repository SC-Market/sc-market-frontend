/**
 * @deprecated Import from "features/offers/api/offerApi" instead.
 */
import "../features/offers/api/offerApi"

export type {
  OfferSessionStub,
  OfferSession,
  OfferVariantItemV2,
  Offer,
  CounterOfferBody,
  OfferMarketListing,
  OfferSearchSortMethod,
  OfferSearchStatus,
  OfferSearchQuery,
} from "../features/offers/api/offerApi"

export {
  OFFER_SEARCH_SORT_METHODS,
  OFFER_SEARCH_STATUS,
  offersApi,
  useGetOfferSessionByIDQuery,
  useUpdateOfferStatusMutation,
  useCounterOfferMutation,
  useCreateOfferThreadMutation,
  useSearchOfferSessionsQuery,
  useMergeOfferSessionsMutation,
  useAssignOfferMutation,
  useUnassignOfferMutation,
} from "../features/offers/api/offerApi"
