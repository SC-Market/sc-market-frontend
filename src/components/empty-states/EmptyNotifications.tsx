import React from "react"
import { NotificationsNoneOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyNotificationsProps
  extends Omit<EmptyStateProps, "title" | "icon" | "action"> {
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
}

/**
 * Empty state component for notifications
 *
 * Displays when there are no notifications
 */
export function EmptyNotifications({
  title,
  description,
  ...props
}: EmptyNotificationsProps) {
  const { t } = useTranslation()

  const defaultTitle = t("emptyStates.notifications.noNotifications", {
    defaultValue: "No notifications",
  })

  const defaultDescription = t("emptyStates.notifications.noNotificationsDescription", {
    defaultValue: "You're all caught up! New notifications will appear here",
  })

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={<NotificationsNoneOutlined />}
      {...props}
    />
  )
}
