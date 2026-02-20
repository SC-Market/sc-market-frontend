import React, { useState } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import {
  MessagingSidebar,
  MessagingSidebarContent,
  messagingDrawerWidth,
  MessageGroupCreateContext,
  MessagingSidebarContext,
  CreateMessageGroupBody,
  CurrentChatIDContext,
} from "../../features/chats"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useNavigate } from "react-router-dom"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"

export function MessagesList() {
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [messageSidebarOpen, setMessageSidebar] = useState(true)
  const [creatingMessageGroup, setCreatingMessageGroup] = useState(false)

  return (
    <Page title={t("messages.title", { defaultValue: "Messages" })}>
      <CurrentChatIDContext.Provider
        value={[
          null,
          (id) => {
            if (id) {
              navigate(`/messages/${id}`)
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
            {/* On mobile, show sidebar content as page content. On desktop, show as drawer */}
            {isMobile ? (
              <main
                style={{
                  flexGrow: 1,
                  overflow: "auto",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: drawerOpen ? sidebarDrawerWidth : 0,
                    height: { xs: 56, sm: 64 },
                    minHeight: { xs: 56, sm: 64 },
                  }}
                />
                {creatingMessageGroup ? (
                  <CreateMessageGroupBody />
                ) : (
                  <MessagingSidebarContent asPageContent />
                )}
              </main>
            ) : (
              <>
                <MessagingSidebar />
                <main
                  style={{
                    flexGrow: 1,
                    overflow: "auto",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    marginLeft: messageSidebarOpen ? messagingDrawerWidth : 0,
                    transition: theme.transitions.create("marginLeft", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 0,
                      height: { xs: 56, sm: 64 },
                      minHeight: { xs: 56, sm: 64 },
                    }}
                  />
                  {creatingMessageGroup ? (
                    <CreateMessageGroupBody />
                  ) : (
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                      }}
                    >
                      {t("emptyStates.messages.selectChat", {
                        defaultValue: "Select a chat to start messaging",
                      })}
                    </Box>
                  )}
                </main>
              </>
            )}
          </MessageGroupCreateContext.Provider>
        </MessagingSidebarContext.Provider>
      </CurrentChatIDContext.Provider>
    </Page>
  )
}
