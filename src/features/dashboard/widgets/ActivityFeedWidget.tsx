/**
 * ActivityFeedWidget — a scrollable activity timeline built from notifications,
 * optionally filtered to a single action type (e.g. only new orders, only
 * offers). Reuses NotificationEntry for per-action rich rendering.
 *
 * Settings:
 *  - `action` (string) a NotificationAction to filter by; empty = all activity
 *  - `shopId` (string) resolved from scope by the render fn, not stored here
 */

import { Box, List } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { TFunction } from "i18next"
import { useGetNotificationsQuery } from "../../notifications/api/notificationApi"
import { NotificationEntry } from "../../notifications/components/NotificationEntry"
import { EmptyNotifications } from "../../../components/empty-states"
import type { ExtendedTheme } from "../../../hooks/styles/Theme"
import type { ResolvedScope } from "../useResolveScope"
import type { DashboardWidget } from "../types"

export interface ActivityFeedWidgetProps {
  scope: ResolvedScope
  settings?: DashboardWidget["settings"]
  t: TFunction
}

export function ActivityFeedWidget({ scope, settings }: ActivityFeedWidgetProps) {
  const theme = useTheme<ExtendedTheme>()
  const action =
    typeof settings?.action === "string" && settings.action
      ? settings.action
      : undefined

  const { data } = useGetNotificationsQuery({
    page: 0,
    pageSize: 20,
    action,
    shopId: scope.shopId || undefined,
  })

  const notifications = data?.notifications ?? []

  if (notifications.length === 0) {
    return <EmptyNotifications sx={{ py: 4 }} />
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <List
        sx={{
          "&>:first-child": {
            borderTop: `1px solid ${theme.palette.outline.main}`,
          },
          "&>:last-child": { borderBottom: "none" },
          "& > *": { borderBottom: `1px solid ${theme.palette.outline.main}` },
          padding: 0,
          maxHeight: 400,
          overflowY: "auto",
          width: "100%",
          "& *": {
            wordBreak: "break-word",
            overflowWrap: "break-word",
            minWidth: 0,
          },
        }}
      >
        {notifications.map((notification, idx) => (
          <NotificationEntry notif={notification} key={idx} />
        ))}
      </List>
    </Box>
  )
}
