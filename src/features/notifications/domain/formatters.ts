/**
 * Format notification action names for display
 */
export function formatNotificationAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
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
    org_member_joined: "group_add",
    market_item_bid: "gavel",
    market_item_bid_v2: "gavel",
    market_item_offer: "local_offer",
    buy_order_match_v2: "shopping_cart",
    offer_create: "add_circle",
    counter_offer_create: "swap_horiz",
    offer_message: "chat",
    admin_alert: "notifications",
    order_review_revision_requested: "edit",
  }

  return iconMap[action] || "notifications"
}

/** The inbox's day groups, newest first. */
export type NotificationDayGroup = "today" | "yesterday" | "week" | "older"

const DAY_GROUP_ORDER: NotificationDayGroup[] = [
  "today",
  "yesterday",
  "week",
  "older",
]

function startOfLocalDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Which day group a notification's timestamp falls in, in local time. */
export function notificationDayGroup(
  timestamp: string | Date,
  now: Date = new Date(),
): NotificationDayGroup {
  const day = startOfLocalDay(new Date(timestamp))
  const today = startOfLocalDay(now)
  const DAY = 24 * 60 * 60 * 1000
  if (day >= today) return "today"
  if (day >= today - DAY) return "yesterday"
  if (day >= today - 6 * DAY) return "week"
  return "older"
}

/**
 * Splits a page of notifications (already newest first) into day groups,
 * keeping their order and dropping empty groups.
 */
export function groupNotificationsByDay<T extends { timestamp: string }>(
  items: T[],
  now: Date = new Date(),
): { group: NotificationDayGroup; items: T[] }[] {
  const buckets = new Map<NotificationDayGroup, T[]>()
  for (const item of items) {
    const g = notificationDayGroup(item.timestamp, now)
    const list = buckets.get(g)
    if (list) list.push(item)
    else buckets.set(g, [item])
  }
  return DAY_GROUP_ORDER.filter((g) => buckets.has(g)).map((g) => ({
    group: g,
    items: buckets.get(g)!,
  }))
}
