import { useCallback } from "react"
import {
  useNotificationDeleteMutation,
  useNotificationUpdateMutation,
} from "../api/notificationApi"

/** Mark one notification read or unread, or delete it. */
export function useNotificationActions(notificationId: string) {
  const [updateNotification] = useNotificationUpdateMutation()
  const [deleteNotification] = useNotificationDeleteMutation()

  const setRead = useCallback(
    async (read: boolean) => {
      await updateNotification({ notification_id: notificationId, read })
    },
    [updateNotification, notificationId],
  )

  const remove = useCallback(() => {
    deleteNotification([notificationId])
  }, [deleteNotification, notificationId])

  return { setRead, remove }
}
