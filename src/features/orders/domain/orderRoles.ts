/**
 * Who the viewer is on an order or an offer session: its customer, its
 * assignee, a member (or manager) of the org it was placed with. Pure: no
 * React, no store. Offers have the same parties, so they use these too.
 *
 * Claiming mirrors the backend (v1 orders handleAssignedUpdate, v1 offers
 * offer_put_session_id, the Discord Claim button): an org's order or offer,
 * not yet assigned, still open, by a member with Manage Orders (who may
 * assign anyone) or Claim Orders (who may take it themselves).
 */
import type { Contractor } from "../../contractor/domain/types"
import { has_permission } from "../../contractor/domain/permissions"
import { isSiteAdmin } from "../../../util/siteRole"
import { isOrderOpen } from "./status"

/** The parties of an order or offer session, by username / spectrum ID. */
export interface DealParties {
  /** Customer's username */
  customer: string | null | undefined
  /** Assignee's username, if assigned */
  assignedTo: string | null | undefined
  /** Spectrum ID of the org it was placed with, if any */
  contractor: string | null | undefined
}

/** The signed-in viewer, as the profile query returns it. */
export interface Viewer {
  username: string
  role?: string | null
  contractors?: Array<{
    spectrum_id: string
    role: string
    role_id?: string
    roles?: string[]
  }>
}

export interface OrderViewerRoles {
  customer: boolean
  assigned: boolean
  /** Member of the org the order was placed with */
  orgMember: boolean
  /** Org member with Manage Orders */
  orgManager: boolean
  /** Org member with Claim Orders */
  orgClaimer: boolean
  siteAdmin: boolean
  /** Customer, assignee or org member (not site admins) */
  related: boolean
}

/** Whether the viewer belongs to the org of the order (no fetch needed). */
export function isDealOrgMember(
  parties: Pick<DealParties, "contractor">,
  viewer: Viewer | null | undefined,
): boolean {
  return (
    !!viewer &&
    !!parties.contractor &&
    !!viewer.contractors?.some((c) => c.spectrum_id === parties.contractor)
  )
}

/**
 * The viewer's roles on an order or offer. `orgContractor` is the order's
 * org with its roles (only needed, and only fetched, for members).
 */
export function orderViewerRoles(
  parties: DealParties,
  viewer: Viewer | null | undefined,
  orgContractor: Contractor | null | undefined,
): OrderViewerRoles {
  const customer =
    !!viewer && !!parties.customer && parties.customer === viewer.username
  const assigned =
    !!viewer && !!parties.assignedTo && parties.assignedTo === viewer.username
  const orgMember = isDealOrgMember(parties, viewer)
  const orgManager =
    orgMember &&
    has_permission(orgContractor, viewer, "manage_orders", viewer?.contractors)
  const orgClaimer =
    orgMember &&
    has_permission(orgContractor, viewer, "claim_orders", viewer?.contractors)
  return {
    customer,
    assigned,
    orgMember,
    orgManager,
    orgClaimer,
    siteAdmin: isSiteAdmin(viewer),
    related: customer || assigned || orgMember,
  }
}

/** Whether the viewer may assign this open, unassigned org order to themselves. */
export function canClaimOrder(
  order: Pick<DealParties, "assignedTo" | "contractor"> & { status: string },
  roles: Pick<OrderViewerRoles, "orgManager" | "orgClaimer">,
): boolean {
  if (!order.contractor || order.assignedTo) return false
  if (!isOrderOpen(order.status)) return false
  return roles.orgManager || roles.orgClaimer
}
