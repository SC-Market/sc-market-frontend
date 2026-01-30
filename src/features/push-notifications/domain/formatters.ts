/**
 * Get user-friendly label for notification action type
 */
export function formatActionName(action: string): string {
  const actionLabels: Record<string, string> = {
    // Order notifications
    order_create: "New Order Created",
    order_assigned: "Order Assigned to You",
    order_status_fulfilled: "Order Fulfilled",
    order_status_in_progress: "Order In Progress",
    order_status_not_started: "Order Not Started",
    order_status_cancelled: "Order Cancelled",
    order_comment: "Order Comments",
    order_message: "Order Messages",
    order_review: "Order Reviews",
    order_review_revision_requested: "Review Revision Requested",
    order_contractor_applied: "Contractor Applied to Order",
    public_order_create: "New Public Order",

    // Market notifications
    market_item_bid: "Market Item Bids",
    market_item_offer: "Market Item Offers",
    market_bid_accepted: "Market Bid Accepted",
    market_bid_declined: "Market Bid Declined",
    market_offer_accepted: "Market Offer Accepted",
    market_offer_declined: "Market Offer Declined",

    // Offer notifications
    offer_create: "New Offers",
    offer_message: "Offer Messages",
    counter_offer_create: "Counter Offers",

    // Contractor notifications
    contractor_invite: "Contractor Invitations",

    // Admin notifications
    admin_alert: "Admin Alerts",
  }

  return (
    actionLabels[action] ||
    action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(/([A-Z])/g, " $1")
      .trim()
  )
}
