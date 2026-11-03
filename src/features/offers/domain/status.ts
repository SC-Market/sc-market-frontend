/**
 * Offer session status rules. Pure: no React, no store.
 *
 * The API sends a session's status as a display string derived from the
 * session and its latest offer (v1 serializeOfferSessionStub, v2
 * OffersV2Controller): "Waiting for Seller" / "Waiting for Customer" while
 * the session is active, and "Accepted", "Rejected" or "Counter Offered"
 * once it is closed ("Counter Offered" is a closed session whose last offer
 * was neither accepted nor rejected, e.g. withdrawn).
 */
import type { DealParties, OrderViewerRoles } from "../../orders/domain/orderRoles"

/** The statuses of a session that is still being negotiated. */
export const OPEN_OFFER_STATUSES = ["Waiting for Seller", "Waiting for Customer"] as const

/** Whether the offer session is still active (not accepted, rejected or withdrawn). */
export function isOfferOpen(status: string): boolean {
  return (OPEN_OFFER_STATUSES as readonly string[]).includes(status)
}

/**
 * Whether the viewer may assign this active, unassigned org offer to
 * themselves: Manage Orders or Claim Orders in the org (the backend's
 * offer_put_session_id and Discord Claim rule).
 */
export function canClaimOffer(
  session: Pick<DealParties, "assignedTo" | "contractor"> & { status: string },
  roles: Pick<OrderViewerRoles, "orgManager" | "orgClaimer">,
): boolean {
  if (!session.contractor || session.assignedTo) return false
  if (!isOfferOpen(session.status)) return false
  return roles.orgManager || roles.orgClaimer
}

export interface OfferActions {
  /** Change the assignee (org managers, active sessions) */
  canAssign: boolean
  /** Assign it to yourself */
  canClaim: boolean
}

/** The assignment actions the viewer gets on an offer session. */
export function availableOfferActions(
  session: Pick<DealParties, "assignedTo" | "contractor"> & { status: string },
  roles: Pick<OrderViewerRoles, "orgManager" | "orgClaimer">,
): OfferActions {
  return {
    canAssign: roles.orgManager && isOfferOpen(session.status),
    canClaim: canClaimOffer(session, roles),
  }
}
