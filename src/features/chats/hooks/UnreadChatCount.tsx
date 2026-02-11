import { useMemo } from "react"
import { useGetNotificationsQuery } from "../../../store/notification"
import { useGetMyChatsQuery } from "../api/chatsApi"
import type { Chat } from "../domain/types"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

/**
 * Hook to get the count of chats with unread messages
 * @returns number of chats with unread notifications
 */
export function useUnreadChatCount(): number {
  // Get all chats first
  const { data: chats } = useGetMyChatsQuery()

  // Query message notifications - chats use order_message or offer_message actions
  // Query both types to get all chat-related notifications
  const { data: orderMessageNotifications } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "order_message",
  })

  const { data: offerMessageNotifications } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action: "offer_message",
  })

  // Combine both notification types
  const allNotificationsData = useMemo(() => {
    if (!orderMessageNotifications && !offerMessageNotifications)
      return undefined

    const combinedNotifications = [
      ...(orderMessageNotifications?.notifications || []),
      ...(offerMessageNotifications?.notifications || []),
    ]

    // Combine unread counts
    const totalUnread =
      (orderMessageNotifications?.unread_count || 0) +
      (offerMessageNotifications?.unread_count || 0)

    return {
      notifications: combinedNotifications,
      unread_count: totalUnread,
      pagination: orderMessageNotifications?.pagination ||
        offerMessageNotifications?.pagination || {
          total: combinedNotifications.length,
          currentPage: 0,
          pageSize: 100,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
    }
  }, [orderMessageNotifications, offerMessageNotifications])

  // Calculate count of unique chats with unread notifications
  const unreadChatCount = useMemo(() => {
    if (!allNotificationsData?.notifications || !chats || chats.length === 0) {
      return 0
    }

    // Create a set of chat IDs
    const chatIds = new Set(chats.map((chat: Chat) => chat.chat_id))

    // Track which chats have unread notifications
    // We need to query notifications with entityId for each chat to get accurate counts
    // But that's expensive. Instead, let's query all and try to match.

    // For message notifications, we can check:
    // 1. If action is "order_message" or "offer_message", the entityId in query is order_id/offer_id
    // 2. We need to match these to chats by order_id or session_id (for offers)
    // 3. For standalone chats, there might be a "chat_message" action with entityId=chat_id

    // Since we can't reliably match without querying per chat, let's use a simpler approach:
    // Query all unread notifications that are message-related, then count unique chats
    // by checking if we can derive chat_id from the notification

    const unreadChatIds = new Set<string>()

    allNotificationsData.notifications.forEach((notif) => {
      if (!notif.read) {
        // Check if this is a message-related notification
        const isMessageNotification =
          notif.action === "order_message" || notif.action === "offer_message"

        if (isMessageNotification) {
          // Try to find chat_id from the entity
          if (notif.entity && typeof notif.entity === "object") {
            // For order_message, entity is Order which has order_id
            // We need to find the chat for this order
            if (
              notif.action === "order_message" &&
              "order_id" in notif.entity
            ) {
              const orderId = (notif.entity as any).order_id
              const chat = chats.find((c: Chat) => c.order_id === orderId)
              if (chat) {
                unreadChatIds.add(chat.chat_id)
              }
            }
            // For offer_message, entity is OfferSession which has session_id
            // We need to find the chat for this session
            else if (notif.action === "offer_message" && "id" in notif.entity) {
              const sessionId = (notif.entity as any).id
              const chat = chats.find((c: Chat) => c.session_id === sessionId)
              if (chat) {
                unreadChatIds.add(chat.chat_id)
              }
            }
          }
        }
      }
    })

    return unreadChatIds.size
  }, [allNotificationsData, chats])

  return unreadChatCount
}
