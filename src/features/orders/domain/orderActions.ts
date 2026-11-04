/**
 * Which order buttons a viewer gets. Pure: no React, no store.
 *
 * Mirrors the backend's status-change rule (canChangeOrderStatus in
 * services/orders, used by applyOrderStatusChange):
 * - a closed order (cancelled or fulfilled) can only be changed by a site
 *   admin;
 * - the assignee, an org member with Manage Orders, or a site admin may set
 *   any status; the customer may only cancel.
 * On top of that the page offers the usual next step only (Begin work from
 * not-started, Complete from an open order); a site admin gets every button.
 */
import { isOrderOpen } from "./status"
import { canClaimOrder, type OrderViewerRoles } from "./orderRoles"

export interface OrderActionsInput {
  status: string
  /** Username of the assignee, if any */
  assignedTo: string | null | undefined
  /** Spectrum ID of the order's org, if any */
  contractor: string | null | undefined
}

export interface OrderActions {
  /**
   * May set the status at all (assignee, Manage Orders or site admin): the
   * status buttons group. The customer, otherwise, only gets Cancel.
   */
  canSetStatus: boolean
  /** Mark fulfilled */
  canComplete: boolean
  /** Mark in-progress ("Begin work") */
  canStart: boolean
  /** Put back to not-started (site admins only) */
  canResetToNotStarted: boolean
  /** Cancel the order */
  canCancel: boolean
  /** Change the assignee (org managers, open orders) */
  canAssign: boolean
  /** Assign it to yourself */
  canClaim: boolean
}

/**
 * The order actions the viewer gets, from the order's status and their roles
 * on it (orderViewerRoles).
 */
export function availableOrderActions(
  order: OrderActionsInput,
  roles: OrderViewerRoles,
): OrderActions {
  const open = isOrderOpen(order.status)
  const admin = roles.siteAdmin
  // May set any status (the backend's "assigned, Manage Orders or admin")
  const worker = admin || roles.orgManager || roles.assigned
  return {
    canSetStatus: worker,
    canComplete:
      worker &&
      (admin ||
        order.status === "not-started" ||
        order.status === "in-progress"),
    canStart: worker && (admin || order.status === "not-started"),
    canResetToNotStarted: admin,
    canCancel: (worker && (admin || open)) || (roles.customer && open),
    canAssign: roles.orgManager && open,
    canClaim: canClaimOrder(order, roles),
  }
}
