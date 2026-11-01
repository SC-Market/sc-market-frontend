import React from "react"
import { List, ListSubheader, type SxProps, type Theme } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import type { ExtendedTheme } from "../../../hooks/styles/Theme"
import type { Notification } from "../../../hooks/login/UserProfile"
import { NotificationEntry } from "./NotificationEntry"
import {
  groupNotificationsByDay,
  type NotificationDayGroup,
} from "../domain/formatters"

const GROUP_LABEL_KEYS: Record<NotificationDayGroup, [string, string]> = {
  today: ["notifications.groups.today", "Today"],
  yesterday: ["notifications.groups.yesterday", "Yesterday"],
  week: ["notifications.groups.week", "Earlier this week"],
  older: ["notifications.groups.older", "Older"],
}

/**
 * The notification rows with the site's list divider (outline colour
 * between rows), shared by the /notifications page, the bell popover and the
 * dashboard feed. `grouped` adds day headers (Today, Yesterday, ...) in the
 * settings sidebar's overline style.
 */
export function NotificationList({
  notifications,
  grouped = false,
  sx,
}: {
  notifications: Notification[]
  grouped?: boolean
  sx?: SxProps<Theme>
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const divider = `1px solid ${theme.palette.outline.main}`

  const rows = (items: Notification[]) =>
    items.map((notification) => (
      <NotificationEntry
        notif={notification}
        key={notification.notification_id}
      />
    ))

  return (
    <List
      disablePadding
      sx={[
        {
          width: "100%",
          minWidth: 0,
          "& > *:not(:last-child)": { borderBottom: divider },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {grouped
        ? groupNotificationsByDay(notifications).map(({ group, items }) => {
            const [key, fallback] = GROUP_LABEL_KEYS[group]
            return (
              <React.Fragment key={group}>
                <ListSubheader
                  disableSticky
                  component="h2"
                  sx={{
                    typography: "overline",
                    lineHeight: 2.5,
                    color: "text.primary",
                    bgcolor: "transparent",
                    px: { xs: 1.5, sm: 2 },
                    pt: 1,
                  }}
                >
                  {t(key, fallback)}
                </ListSubheader>
                {rows(items)}
              </React.Fragment>
            )
          })
        : rows(notifications)}
    </List>
  )
}
