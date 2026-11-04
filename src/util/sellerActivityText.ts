import type { SellerActivity } from "../store/api/v2/market"
import { formatNumber } from "./format/format"

/**
 * Seller activity as one plain English sentence for crawlable HTML (the
 * edge bridge's listing and shop pages). Coarse by design: the API only
 * gives buckets, never timestamps. Null when there is nothing to say.
 */
export function sellerActivityText(
  activity: SellerActivity | null | undefined,
): string | null {
  if (!activity) return null
  const lastSeen = {
    today: "active today",
    this_week: "active this week",
    this_month: "active this month",
    over_a_month: "last active over a month ago",
  } as const
  const reply = {
    within_hour: "usually replies within an hour",
    within_hours: "usually replies within a few hours",
    within_day: "usually replies within a day",
    within_days: "usually replies within 3 days",
    slow: "slow to reply",
  } as const
  const parts = [
    activity.last_seen ? lastSeen[activity.last_seen] : null,
    activity.reply_time
      ? `${reply[activity.reply_time]}${
          activity.reply_sample_size
            ? ` (${activity.reply_sample_size} order and offer chats, last 90 days)`
            : ""
        }`
      : null,
    activity.completed_orders > 0
      ? // English crawler text: English digits too.
        `${formatNumber(activity.completed_orders, "en")} completed order${activity.completed_orders === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean)
  if (!parts.length) return null
  return `Seller activity: ${parts.join("; ")}.`
}
