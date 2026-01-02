import React, { useState } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { MessagingSidebar } from "../../views/messaging/MessagingSidebar"
import { MessagingSidebarContent } from "../../views/messaging/MessagingSidebarContent"
import { MessageGroupCreateContext } from "../../hooks/messaging/MessageGroupCreate"
import { MessagingSidebarContext } from "../../hooks/messaging/MessagingSidebar"
import { CreateMessageGroupBody } from "../../views/messaging/CreateMessageGroup"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CurrentChatIDContext } from "../../hooks/messaging/CurrentChatID"
import { useNavigate } from "react-router-dom"
import { messagingDrawerWidth } from "../../views/messaging/MessagingSidebar"

export function MessagesList() {
  const [drawerOpen] = useDrawerOpen()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  const [messageSidebarOpen, setMessageSidebar] = useState(true)
  const [creatingMessageGroup, setCreatingMessageGroup] = useState(false)

  return (
    <React.Fragment>
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
                    marginLeft:
                      (drawerOpen ? sidebarDrawerWidth : 0) +
                      (messageSidebarOpen ? messagingDrawerWidth : 0),
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
                      Select a chat to start messaging
                    </Box>
                  )}
                </main>
              </>
            )}
          </MessageGroupCreateContext.Provider>
        </MessagingSidebarContext.Provider>
      </CurrentChatIDContext.Provider>
    </React.Fragment>
  )
}
