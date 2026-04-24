import { useEffect, useMemo } from "react"
import { useGetOfferSessionQuery } from "../../../store/api/v2/market"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../notifications/api/notificationApi"
import type { OfferSession, Offer, OfferVariantItemV2 } from "../domain/types"
import type { MinimalUser } from "../../../datatypes/User"
import type { MinimalContractor } from "../../contractor/domain/types"
import type { OrderAvailability } from "../../orders/domain/types"
import type {
  GetOfferSessionV2Response,
  OfferV2,
  MinimalUser as V2MinimalUser,
  MinimalContractor as V2MinimalContractor,
} from "../../../store/api/v2/market"

/** Map V2 user to domain MinimalUser (structurally compatible) */
function toUser(u: V2MinimalUser): MinimalUser {
  return u as unknown as MinimalUser
}

/** Map V2 contractor to domain MinimalContractor (structurally compatible) */
function toContractor(c: V2MinimalContractor): MinimalContractor {
  return c as unknown as MinimalContractor
}

/** Map V2 offer to V1 Offer shape used by the page */
function mapOffer(o: OfferV2, sessionId: string): Offer {
  const v2Listings = o.market_listings.filter((ml) => ml.v2_variants.length > 0)

  const market_listings_v2 = v2Listings.length
    ? v2Listings.map((ml) => ({
        listing_id: ml.listing_id,
        title: ml.title,
        price: ml.price,
        quantity: ml.quantity,
        variants: ml.v2_variants.map<OfferVariantItemV2>((v) => ({
          listing_id: ml.listing_id,
          variant_id: v.variant_id,
          quantity: v.quantity,
          price_per_unit: v.price_per_unit,
          attributes: v.attributes as Record<string, any>,
          display_name: v.display_name,
          short_name: v.short_name,
        })),
      }))
    : undefined

  const v2_variant_items = v2Listings.length
    ? v2Listings.flatMap((ml) =>
        ml.v2_variants.map<OfferVariantItemV2>((v) => ({
          listing_id: ml.listing_id,
          variant_id: v.variant_id,
          quantity: v.quantity,
          price_per_unit: v.price_per_unit,
          attributes: v.attributes as Record<string, any>,
          display_name: v.display_name,
          short_name: v.short_name,
        })),
      )
    : undefined

  return {
    id: o.offer_id,
    session_id: sessionId,
    actor: null,
    kind: o.kind,
    cost: String(o.cost),
    title: o.title,
    description: o.description,
    timestamp: o.created_at,
    status: o.status,
    collateral: o.collateral,
    service: o.service ? (o.service as any) : null,
    market_listings: o.market_listings.map((ml) => ({
      listing_id: ml.listing_id,
      quantity: ml.quantity,
      listing: { listing_id: ml.listing_id, title: ml.title, price: ml.price } as any,
    })),
    market_listings_v2,
    payment_type: o.payment_type as "one-time" | "hourly" | "daily",
    v2_variant_items,
  }
}

/** Map V2 response to V1 OfferSession shape */
function mapSession(v2: GetOfferSessionV2Response): OfferSession {
  const availability: OrderAvailability = {
    customer: v2.availability?.customer ?? [],
    assigned: v2.availability?.assigned ?? null,
  }

  return {
    id: v2.session_id,
    contractor: v2.contractor ? toContractor(v2.contractor) : null,
    assigned_to: v2.assigned_to ? toUser(v2.assigned_to) : null,
    customer: toUser(v2.customer),
    status: v2.status,
    timestamp: v2.created_at,
    offers: v2.offers.map((o) => mapOffer(o, v2.session_id)),
    order_id: v2.order_id,
    discord_thread_id: v2.discord_thread_id ?? null,
    discord_server_id: v2.discord_server_id ?? null,
    discord_invite: v2.discord_invite ?? null,
    availability,
  }
}

/**
 * Page hook for offer detail pages
 * Uses V2 API and maps to existing OfferSession shape
 */
export function usePageOffer(offerId: string | undefined) {
  const offerQuery = useGetOfferSessionQuery(
    { sessionId: offerId! },
    { skip: !offerId },
  )

  const session = useMemo(
    () => (offerQuery.data ? mapSession(offerQuery.data) : undefined),
    [offerQuery.data],
  )

  const notificationsQuery = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: offerId,
    },
    { skip: !offerId },
  )

  const [deleteNotification] = useNotificationDeleteMutation()

  useEffect(() => {
    const notifications = notificationsQuery.data?.notifications || []
    if (notifications.length > 0) {
      const notificationIds = notifications.map((n) => n.notification_id)
      deleteNotification(notificationIds)
    }
  }, [notificationsQuery.data?.notifications, deleteNotification])

  return {
    data:
      session && notificationsQuery.data
        ? { session, notifications: notificationsQuery.data }
        : undefined,
    isLoading: offerQuery.isLoading || notificationsQuery.isLoading,
    isFetching: offerQuery.isFetching || notificationsQuery.isFetching,
    error: offerQuery.error || notificationsQuery.error,
    refetch: () => {
      offerQuery.refetch()
      notificationsQuery.refetch()
    },
  }
}
