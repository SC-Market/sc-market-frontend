import { useMemo } from "react"
import { useGetMyChatsQuery } from "../api/chatsApi"
import { useGetUserProfileQuery } from "../../../store/profile"

/**
 * Hook to get the count of chats with unread messages
 * @returns number of chats with unread notifications
 */
export function useUnreadChatCount(): number {
  const { data: currentUser } = useGetUserProfileQuery()
  const isLoggedIn = !!currentUser

  // Get all chats - they now include unread_count from backend
  const { data: chats } = useGetMyChatsQuery(undefined, { skip: !isLoggedIn })

  // Count chats with unread messages
  const unreadChatCount = useMemo(() => {
    if (!chats || chats.length === 0) {
      return 0
    }

    // Count chats that have unread_count > 0
    return chats.filter((chat) => (chat.unread_count || 0) > 0).length
  }, [chats])

  return unreadChatCount
}
