import React, { useEffect, useState } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { MessagesBody } from "../../views/messaging/MessagesBody"
import { MessagesBodyMobile } from "../../views/messaging/MessagesBodyMobile"
import { MessagingSidebar } from "../../views/messaging/MessagingSidebar"
import { Message } from "../../datatypes/Chat"
import { MessageGroupCreateContext } from "../../hooks/messaging/MessageGroupCreate"
import { MessagingSidebarContext } from "../../hooks/messaging/MessagingSidebar"
import { CreateMessageGroupBody } from "../../views/messaging/CreateMessageGroup"
import { useCurrentChat } from "../../hooks/messaging/CurrentChat"
import { useGetChatByIDQuery } from "../../store/chats"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CurrentChatIDContext } from "../../hooks/messaging/CurrentChatID"
import { messagingDrawerWidth } from "../../views/messaging/MessagingSidebar"
import { MessageThreadSkeleton } from "../../components/skeletons"
import { EmptyMessages } from "../../components/empty-states"
import { useTranslation } from "react-i18next"
import {
  useGetNotificationsQuery,
  useNotificationUpdateMutation,
} from "../../store/notification"

export function Messages() {
  const { chat_id } = useParams<{ chat_id: string }>()
  const navigate = useNavigate()
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  // On desktop, always show sidebar (unless collapsed). On mobile, hide sidebar when viewing chat
  const [messageSidebarOpen, setMessageSidebar] = useState(!isMobile)
  const [creatingMessageGroup, setCreatingMessageGroup] = useState(false)

  const [currentChat, setCurrentChat] = useCurrentChat()

  const {
    data: chatObj,
    isLoading,
    isFetching,
  } = useGetChatByIDQuery(chat_id!, {
    skip: !chat_id,
  })

  // Get notifications for this chat (need chatObj to determine order_id or session_id)

  // Get and mark as read message notifications for this chat
  // Query based on chat's order_id or session_id
  const { data: orderNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "order_message",
      entityId: chatObj?.order_id || undefined,
    },
    { skip: !chat_id || !chatObj?.order_id },
  )

  const { data: offerNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: chatObj?.session_id || undefined,
    },
    { skip: !chat_id || !chatObj?.session_id },
  )

  // Use the appropriate notification data based on chat type
  const notificationsData = chatObj?.order_id
    ? orderNotificationsData
    : chatObj?.session_id
      ? offerNotificationsData
      : undefined
  const notifications = notificationsData?.notifications || []
  const [updateNotification] = useNotificationUpdateMutation()

  // Mark chat notifications as read when viewing the chat
  useEffect(() => {
    if (chat_id && notifications.length > 0) {
      const unreadNotifications = notifications.filter((n) => !n.read)
      if (unreadNotifications.length > 0) {
        // Mark each unread notification for this chat as read
        unreadNotifications.forEach((notif) => {
          updateNotification({
            notification_id: notif.notification_id,
            read: true,
          }).catch((err) => {
            // Silently fail - notifications will update on next query
            console.error("Failed to mark notification as read:", err)
          })
        })
      }
    }
  }, [chat_id, notifications, updateNotification])

  useEffect(() => {
    if (chatObj) {
      const newObj = { ...chatObj }
      newObj.messages = [...newObj.messages].sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )
      setCurrentChat(chatObj)
    }

    return () => {
      setCurrentChat(null)
    }
  }, [chatObj, setCurrentChat])

  // On mobile, hide sidebar when viewing a chat
  useEffect(() => {
    if (isMobile && chat_id) {
      setMessageSidebar(false)
      setCreatingMessageGroup(false)
    } else if (!isMobile) {
      // On desktop, always show sidebar
      setMessageSidebar(true)
    }
  }, [isMobile, chat_id])

  return (
    <React.Fragment>
      <CurrentChatIDContext.Provider
        value={[
          chat_id || null,
          (id) => {
            if (id) {
              navigate(`/messages/${id}`)
            } else {
              navigate("/messages")
            }
          },
        ]}
      >
        <MessagingSidebarContext.Provider
          value={[messageSidebarOpen, setMessageSidebar]}
        >
          <MessageGroupCreateContext.Provider
            value={[creatingMessageGroup, setCreatingMessageGroup]}
          >
            {/* On desktop, always show sidebar. On mobile, only show if no chat selected */}
            {(!isMobile || !chat_id) && <MessagingSidebar />}
            <main
              style={{
                flexGrow: 1,
                overflow: "hidden",
                height: "100%", // Use 100% of parent instead of viewport height
                display: "flex",
                flexDirection: "column",
                marginLeft:
                  !isMobile && messageSidebarOpen ? messagingDrawerWidth : 0,
                transition: isMobile
                  ? undefined
                  : theme.transitions.create("marginLeft", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                position: "relative",
              }}
            >
              {/* Only add spacer on desktop or when not showing MessagesBodyMobile (which has its own spacer) */}
              {!isMobile && (
                <Box
                  sx={{
                    position: "relative",
                    width: 0,
                    height: { xs: 56, sm: 64 },
                    minHeight: { xs: 56, sm: 64 },
                  }}
                />
              )}
              {creatingMessageGroup ? (
                <CreateMessageGroupBody />
              ) : chat_id ? (
                isLoading || isFetching ? (
                  <MessageThreadSkeleton />
                ) : currentChat ? (
                  isMobile ? (
                    <MessagesBodyMobile />
                  ) : (
                    <MessagesBody />
                  )
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <EmptyMessages
                      isChatList={false}
                      showCreateAction={false}
                      title={t("emptyStates.messages.selectChat", {
                        defaultValue: "Select a chat to start messaging",
                      })}
                      description={undefined}
                    />
                  </Box>
                )
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <EmptyMessages
                    isChatList={false}
                    showCreateAction={false}
                    title={t("emptyStates.messages.selectChat", {
                      defaultValue: "Select a chat to start messaging",
                    })}
                    description={undefined}
                  />
                </Box>
              )}
            </main>
          </MessageGroupCreateContext.Provider>
        </MessagingSidebarContext.Provider>
      </CurrentChatIDContext.Provider>
    </React.Fragment>
  )
}
