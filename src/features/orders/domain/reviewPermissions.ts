/**
 * Who may act on an order review. Pure: the viewer's roles on the order come
 * from orderViewerRoles (useOrderViewerRoles in components).
 */
import type { OrderReview } from "./types"
import type { OrderViewerRoles } from "./orderRoles"

/**
 * The side a review is about may ask its author to revise it: the customer
 * for the seller's review, the assignee or an org manager (Manage Orders)
 * for the customer's review.
 */
export function canRequestReviewRevision(
  review: Pick<OrderReview, "role">,
  roles: Pick<OrderViewerRoles, "customer" | "assigned" | "orgManager">,
): boolean {
  if (review.role !== "customer" && roles.customer) return true
  if (review.role !== "contractor" && (roles.assigned || roles.orgManager)) {
    return true
  }
  return false
}

/**
 * Once a revision is requested, the review's author may edit it: the user
 * who wrote it, or, for an org's review, an org manager (Manage Orders).
 */
export function canEditReview(
  review: Pick<
    OrderReview,
    "revision_requested" | "user_author" | "contractor_author"
  >,
  viewerUsername: string | null | undefined,
  roles: Pick<OrderViewerRoles, "orgManager">,
): boolean {
  if (!viewerUsername || !review.revision_requested) return false
  if (review.user_author?.username === viewerUsername) return true
  return !!review.contractor_author && roles.orgManager
}
