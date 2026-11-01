import { Box, Chip, Tooltip, Typography } from "@mui/material"
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded"
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded"
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded"
import { useTranslation } from "react-i18next"
import type {
  LastSeenBucket,
  ReplyTimeBucket,
  SellerActivity,
} from "../../store/api/v2/market"

/**
 * What a buyer knows about a seller before asking: when they were last
 * around (a coarse bucket, never a timestamp; hidden if the seller turned
 * on "hide my online status"), how fast they usually reply in order and
 * offer chats (shown only with enough chats to say), and completed orders.
 */
interface SellerStatusBadgeProps {
  activity?: SellerActivity | null
  /** One short line of text for listing cards. */
  compact?: boolean
  /** Show the completed orders chip (off where the page already shows sales). */
  showCompletedOrders?: boolean
}

export function useSellerActivityLabels() {
  const { t } = useTranslation()
  const lastSeen = (b: LastSeenBucket): string =>
    ({
      today: t("sellerActivity.lastSeen.today", "Active today"),
      this_week: t("sellerActivity.lastSeen.this_week", "Active this week"),
      this_month: t("sellerActivity.lastSeen.this_month", "Active this month"),
      over_a_month: t(
        "sellerActivity.lastSeen.over_a_month",
        "Last active over a month ago",
      ),
    })[b]
  const reply = (b: ReplyTimeBucket): string =>
    ({
      within_hour: t(
        "sellerActivity.reply.within_hour",
        "Usually replies within an hour",
      ),
      within_hours: t(
        "sellerActivity.reply.within_hours",
        "Usually replies within a few hours",
      ),
      within_day: t(
        "sellerActivity.reply.within_day",
        "Usually replies within a day",
      ),
      within_days: t(
        "sellerActivity.reply.within_days",
        "Usually replies within 3 days",
      ),
      slow: t("sellerActivity.reply.slow", "Slow to reply"),
    })[b]
  const replyShort = (b: ReplyTimeBucket): string =>
    ({
      within_hour: t("sellerActivity.replyShort.within_hour", "Replies < 1h"),
      within_hours: t("sellerActivity.replyShort.within_hours", "Replies < 6h"),
      within_day: t("sellerActivity.replyShort.within_day", "Replies < 1 day"),
      within_days: t(
        "sellerActivity.replyShort.within_days",
        "Replies < 3 days",
      ),
      slow: t("sellerActivity.replyShort.slow", "Slow to reply"),
    })[b]
  return { lastSeen, reply, replyShort, t }
}

export function SellerStatusBadge({
  activity,
  compact,
  showCompletedOrders = true,
}: SellerStatusBadgeProps) {
  const { lastSeen, reply, replyShort, t } = useSellerActivityLabels()
  if (!activity) return null
  const { last_seen, reply_time, reply_sample_size, completed_orders } =
    activity

  if (compact) {
    const parts = [
      last_seen ? lastSeen(last_seen) : null,
      reply_time ? replyShort(reply_time) : null,
    ].filter(Boolean)
    if (!parts.length) return null
    return (
      <Typography
        variant="caption"
        color={last_seen === "over_a_month" ? "warning.main" : "text.secondary"}
        sx={{ fontSize: "0.68rem", lineHeight: 1.2, display: "block" }}
        noWrap
        data-testid="seller-activity-compact"
      >
        {parts.join(" · ")}
      </Typography>
    )
  }

  const showCompleted = showCompletedOrders && completed_orders > 0
  if (!last_seen && !reply_time && !showCompleted) return null

  return (
    <Box
      display="flex"
      gap={0.5}
      alignItems="center"
      flexWrap="wrap"
      data-testid="seller-activity"
    >
      {last_seen && (
        <Chip
          icon={<AccessTimeRoundedIcon />}
          label={lastSeen(last_seen)}
          size="small"
          variant="outlined"
          color={
            last_seen === "today"
              ? "success"
              : last_seen === "over_a_month"
                ? "warning"
                : "default"
          }
        />
      )}
      {reply_time && (
        <Tooltip
          title={t(
            "sellerActivity.replyTooltip",
            "Typical time to a first reply in order and offer chats over the last 90 days, from {{count}} chats",
            { count: reply_sample_size ?? 0 },
          )}
        >
          <Chip
            icon={<ChatBubbleOutlineRoundedIcon />}
            label={reply(reply_time)}
            size="small"
            variant="outlined"
            color={reply_time === "slow" ? "warning" : "default"}
          />
        </Tooltip>
      )}
      {showCompleted && (
        <Chip
          icon={<TaskAltRoundedIcon />}
          label={t(
            "sellerActivity.completedOrders",
            "{{count}} completed orders",
            { count: completed_orders },
          )}
          size="small"
          variant="outlined"
        />
      )}
    </Box>
  )
}
