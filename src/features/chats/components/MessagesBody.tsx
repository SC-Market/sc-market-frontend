import { Box } from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { AccessTimeRounded } from "@mui/icons-material"
import { useCurrentChat } from "../hooks/CurrentChat"
import { useGetChatByIDQuery } from "../api/chatsApi"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { MobileFAB } from "../../../components/mobile/MobileFAB"
import {
  MessageHeader,
  DateTimePickerBottomSheet,
  MessagesArea,
  MessageSendArea,
} from "../messages"
import type { Message } from "../domain/types"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useChatSocket } from "../hooks/useChatSocket"
import { useSendChatMessage } from "../hooks/useChatActions"
import { useNow } from "../../../util/format"

/**
 * The main messages body used across Orders and Offers
 */
export function MessagesBody(props: {
  maxHeight?: number
  forceDesktop?: boolean
}) {
  const theme = useTheme<ExtendedTheme>()
  const isMobileQuery = useIsMobile()
  const isMobile = props.forceDesktop ? false : isMobileQuery
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const sendChatMessage = useSendChatMessage()
  const { data: profile } = useGetUserProfileQuery()

  useChatSocket(currentChat?.chat_id, setCurrentChat)

  // Subscribe to RTK Query cache updates to sync with currentChat state
  const { chat_id } = useParams<{ chat_id: string }>()
  const { data: chatFromCache } = useGetChatByIDQuery(chat_id!, {
    skip: !chat_id,
  })

  // Sync cache with local state, but merge messages to preserve optimistic updates and socket messages
  useEffect(() => {
    if (
      chatFromCache &&
      (!currentChat || chatFromCache.chat_id !== currentChat.chat_id)
    ) {
      setCurrentChat(chatFromCache)
      return
    }
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

  const onSend = useCallback(
    (content: string) => {
      if (content && currentChat && profile?.username) {
        // RTK Query handles optimistic updates, so we just send the message
        // The cache update will sync to currentChat via the useEffect
        sendChatMessage(currentChat.chat_id, content, profile.username)
      } else {
        console.warn("[MessagesBody] Cannot send - missing data:", {
          hasContent: !!content,
          hasChat: !!currentChat,
          hasUsername: !!profile?.username,
        })
      }
    },
    [currentChat, profile?.username, sendChatMessage],
  )

  const { t } = useTranslation()
  const now = useNow()
  const [dateTime, setDateTime] = useState(() => new Date(now))
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
              flexShrink: 0,
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
