import { Box, Grid, useMediaQuery } from "@mui/material"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { AccessTimeRounded } from "@mui/icons-material"
import { useCurrentChat } from "../hooks/CurrentChat"
import {
  useSendChatMessageMutation,
  useGetChatByIDQuery,
  chatsApi,
} from "../api/chatsApi"
import { useParams } from "react-router-dom"
import { io } from "socket.io-client"
import { WS_URL } from "../../../util/constants"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../../store/store"
import moment from "moment"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { MobileFAB } from "../../../components/mobile/MobileFAB"
import {
  MessageHeader,
  DateTimePickerBottomSheet,
  MessagesArea,
  MessageSendArea,
} from "../messages"
import type { Message } from "../domain/types"
import { useGetUserProfileQuery } from "../../../store/profile"

export const socket = io(WS_URL, {
  withCredentials: true,
  path: "/ws",
  reconnectionDelay: 4000,
  autoConnect: false,
  secure: true,
  transports: ["websocket", "polling", "xhr-polling"],
})

/**
 * The main messages body used across Orders and Offers
 */
export function MessagesBody(props: {
  maxHeight?: number
  forceDesktop?: boolean
}) {
  const theme = useTheme<ExtendedTheme>()
  const dispatch = useDispatch<AppDispatch>()
  const isMobileQuery = useMediaQuery(theme.breakpoints.down("md"))
  const isMobile = props.forceDesktop ? false : isMobileQuery
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const [sendChatMessage] = useSendChatMessageMutation()
  const { isSuccess } = useGetUserProfileQuery()
  const { data: profile } = useGetUserProfileQuery()

  useEffect(() => {
    if (isSuccess && !socket.connected) {
      socket.connect()
    }

    if (!isSuccess || socket.connected) {
      socket.disconnect()
    }
  }, [isSuccess])

  // Listen for server messages from socket
  useEffect(() => {
    function onServerMessage(message: Message): void {
      setCurrentChat((chat) => {
        if (chat && message.chat_id === chat.chat_id) {
          // Find matching message by content + author (replace optimistic with server message)
          const messageIndex = chat.messages.findIndex(
            (msg) =>
              msg.content === message.content && msg.author === message.author,
          )

          if (messageIndex >= 0) {
            // Replace optimistic message with server message
            const updatedMessages = [...chat.messages]
            updatedMessages[messageIndex] = message
            return {
              ...chat,
              messages: updatedMessages.sort(
                (a: Message, b: Message) => a.timestamp - b.timestamp,
              ),
            }
          } else {
            // New message, add it
            return {
              ...chat,
              messages: [...chat.messages, message].sort(
                (a: Message, b: Message) => a.timestamp - b.timestamp,
              ),
            }
          }
        }
        return chat
      })

      // Also update RTK Query cache so it stays in sync
      dispatch(
        chatsApi.util.updateQueryData(
          "getChatByID",
          message.chat_id,
          (draft) => {
            // Find matching message by content + author (replace optimistic with server message)
            const messageIndex = draft.messages.findIndex(
              (msg) =>
                msg.content === message.content &&
                msg.author === message.author,
            )

            if (messageIndex >= 0) {
              // Replace optimistic message with server message
              draft.messages[messageIndex] = message
            } else {
              // New message, add it
              draft.messages.push(message)
            }
            draft.messages.sort(
              (a: Message, b: Message) => a.timestamp - b.timestamp,
            )
          },
        ),
      )
    }
    socket.on("serverMessage", onServerMessage)
    return () => {
      socket.off("serverMessage", onServerMessage)
    }
  }, [setCurrentChat, dispatch])

  useEffect(() => {
    if (currentChat) {
      socket.emit("clientJoinRoom", { chat_id: currentChat.chat_id })
    }
    return () => {
      if (currentChat) {
        socket.emit("clientLeaveRoom", { chat_id: currentChat.chat_id })
      }
    }
  }, [currentChat?.chat_id])

  // Subscribe to RTK Query cache updates to sync with currentChat state
  const { chat_id } = useParams<{ chat_id: string }>()
  const { data: chatFromCache } = useGetChatByIDQuery(chat_id!, {
    skip: !chat_id,
  })

  // Sync cache with local state, but merge messages to preserve optimistic updates and socket messages
  useEffect(() => {
    if (
      chatFromCache &&
      currentChat &&
      chatFromCache.chat_id === currentChat.chat_id
    ) {
      const sortedCacheMessages = [...chatFromCache.messages].sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )

      // Merge messages: combine cache messages with any local messages that aren't in cache
      // This preserves optimistic updates and socket messages that haven't been synced to cache yet
      // Use composite key (content + author) to uniquely identify messages since timestamp is server-side
      const getMessageKey = (msg: Message) =>
        `${msg.content}-${msg.author || "system"}`

      const localMessageMap = new Map<string, Message>()
      currentChat.messages.forEach((msg) => {
        const key = getMessageKey(msg)
        localMessageMap.set(key, msg)
      })

      const cacheMessageMap = new Map<string, Message>()
      sortedCacheMessages.forEach((msg) => {
        const key = getMessageKey(msg)
        cacheMessageMap.set(key, msg)
      })

      // Merge: start with cache messages, add any local messages not in cache
      const mergedMessages = [...sortedCacheMessages]
      localMessageMap.forEach((msg) => {
        const key = getMessageKey(msg)
        if (!cacheMessageMap.has(key)) {
          mergedMessages.push(msg)
        }
      })

      // Sort merged messages
      const sortedMerged = mergedMessages.sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )

      // Only update if messages actually differ
      const currentSorted = [...currentChat.messages].sort(
        (a: Message, b: Message) => a.timestamp - b.timestamp,
      )

      // Compare using content + author since timestamp may differ between optimistic and server
      const mergedKeys = new Set(sortedMerged.map(getMessageKey))
      const currentKeys = new Set(currentSorted.map(getMessageKey))

      if (
        mergedKeys.size !== currentKeys.size ||
        !Array.from(mergedKeys).every((key) => currentKeys.has(key))
      ) {
        setCurrentChat({
          ...chatFromCache,
          messages: sortedMerged,
        })
      }
    }
  }, [chatFromCache, currentChat, setCurrentChat])

  const issueAlert = useAlertHook()

  const onSend = useCallback(
    (content: string) => {
      if (content && currentChat && profile?.username) {
        console.log("[MessagesBody] Sending message:", {
          content,
          username: profile.username,
          chat_id: currentChat.chat_id,
        })
        // RTK Query handles optimistic updates, so we just send the message
        // The cache update will sync to currentChat via the useEffect
        sendChatMessage({
          chat_id: currentChat.chat_id,
          content,
          username: profile.username,
        })
          .unwrap()
          .then((response) => {
            console.log("[MessagesBody] Message sent successfully:", response)
          })
          .catch((error) => {
            console.error("[MessagesBody] Message send failed:", error)
            issueAlert(error)
          })
      } else {
        console.warn("[MessagesBody] Cannot send - missing data:", {
          hasContent: !!content,
          hasChat: !!currentChat,
          hasUsername: !!profile?.username,
        })
      }
    },
    [currentChat, profile?.username, sendChatMessage, issueAlert],
  )

  const { t } = useTranslation()
  const [dateTime, setDateTime] = useState(moment())
  const [dateTimeSheetOpen, setDateTimeSheetOpen] = useState(false)
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [inputAreaHeight, setInputAreaHeight] = useState(0)

  // Measure input area height for proper spacing
  useEffect(() => {
    if (isMobile && inputAreaRef.current) {
      const updateHeight = () => {
        setInputAreaHeight(inputAreaRef.current?.offsetHeight || 0)
      }
      updateHeight()
      const resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(inputAreaRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [isMobile])

  return (
    <>
      {currentChat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            position: "relative",
            isolation: "isolate", // Create new stacking context for FAB
          }}
        >
          <MessageHeader dateTime={dateTime} setDateTime={setDateTime} />
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <MessagesArea
              messages={currentChat.messages}
              messageBoxRef={messageBoxRef}
              maxHeight={props.maxHeight}
              inputAreaHeight={inputAreaHeight}
            />

            {/* Mobile FAB for date/time picker - positioned above input area */}
            {isMobile && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: inputAreaHeight
                    ? `${inputAreaHeight + 64}px`
                    : "144px", // Position 64px above input
                  right: 16,
                  zIndex: theme.zIndex.speedDial, // Use theme z-index for FABs (higher than messages)
                  pointerEvents: "auto",
                }}
              >
                <MobileFAB
                  color="primary"
                  size="small"
                  aria-label={t(
                    "MessagesBody.dateTimePicker",
                    "Date & Time Picker",
                  )}
                  onClick={() => setDateTimeSheetOpen(true)}
                  position="bottom-right"
                  aboveBottomNav={false}
                  sx={{
                    position: "relative",
                    bottom: "auto",
                    right: "auto",
                  }}
                >
                  <AccessTimeRounded />
                </MobileFAB>
              </Box>
            )}
          </Box>

          <Box
            ref={inputAreaRef}
            sx={{
              position: isMobile ? "relative" : "static",
              // Reserve space for input area on mobile
              height: isMobile ? inputAreaHeight || "auto" : "auto",
              minHeight: isMobile ? inputAreaHeight || 0 : 0,
            }}
          >
            <MessageSendArea onSend={onSend} />
          </Box>

          {/* Bottom sheets */}
          {isMobile && (
            <DateTimePickerBottomSheet
              open={dateTimeSheetOpen}
              onClose={() => setDateTimeSheetOpen(false)}
              dateTime={dateTime}
              setDateTime={setDateTime}
            />
          )}
        </Box>
      )}
    </>
  )
}
