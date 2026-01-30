/**
 * Format notification action names for display
 */
export function formatNotificationAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Get notification icon based on action type
 */
export function getNotificationIcon(action: string): string {
  const iconMap: Record<string, string> = {
    order_create: "create",
    order_assigned: "assignment",
    order_review: "rate_review",
    order_status_fulfilled: "check_circle",
    order_status_in_progress: "hourglass_empty",
    order_status_not_started: "schedule",
    order_status_cancelled: "cancel",
    order_comment: "comment",
    order_message: "message",
    contractor_invite: "group_add",
    market_item_bid: "gavel",
    market_item_offer: "local_offer",
    offer_create: "add_circle",
    counter_offer_create: "swap_horiz",
    offer_message: "chat",
    admin_alert: "notifications",
    order_review_revision_requested: "edit",
  }

  return iconMap[action] || "notifications"
}
