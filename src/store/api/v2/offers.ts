/**
 * V2 Offers API
 *
 * Offer endpoints are generated from the TSOA spec into market.ts.
 * Re-exported here for convenience.
 *
 * Offer creation/acceptance/rejection still goes through V1 endpoints.
 * V2 provides read-only serialization enriched with variant data.
 */
export { useGetOfferSessionQuery, useSearchOffersQuery } from "./market"
