import React, { useEffect, useState } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import {
  MessagesBody,
  MessagesBodyMobile,
  MessagingSidebar,
  messagingDrawerWidth,
  MessageGroupCreateContext,
  MessagingSidebarContext,
  CreateMessageGroupBody,
  useCurrentChat,
  CurrentChatIDContext,
  usePageMessages,
  type Message,
} from "../../features/chats"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MessageThreadSkeleton } from "../../components/skeletons"
import { EmptyMessages } from "../../components/empty-states"
import { useTranslation } from "react-i18next"
import { Page } from "../../components/metadata/Page"

export function Messages() {
  const { chat_id } = useParams<{ chat_id: string }>()
  const navigate = useNavigate()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()

  // Use page hook for data fetching
  const pageData = usePageMessages(chat_id)

  // On desktop, always show sidebar (unless collapsed). On mobile, hide sidebar when viewing chat
  const [messageSidebarOpen, setMessageSidebar] = useState(!isMobile)
  const [creatingMessageGroup, setCreatingMessageGroup] = useState(false)

  const [currentChat, setCurrentChat] = useCurrentChat()

  // Update current chat when data loads
  useEffect(() => {
    if (pageData.data?.chat) {
      const newObj = { ...pageData.data.chat }
      newObj.messages = [...newObj.messages].sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )
      setCurrentChat(pageData.data.chat)
    }

    return () => {
      setCurrentChat(null)
    }
  }, [pageData.data?.chat, setCurrentChat])

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
    <Page title={t("messages.title", { defaultValue: "Messages" })}>
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
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                position: "relative",
                marginLeft:
                  !isMobile && messageSidebarOpen ? messagingDrawerWidth : 0,
                transition: isMobile
                  ? undefined
                  : theme.transitions.create("marginLeft", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
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
                pageData.isLoading || pageData.isFetching ? (
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
    </Page>
  )
}
