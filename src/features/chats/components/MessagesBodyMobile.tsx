/**
 * Mobile-specific messaging components
 * Handles keyboard visibility, sticky input, and bottom nav hiding
 */

import { Box, Typography, useTheme, Stack } from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { AccessTimeRounded } from "@mui/icons-material"
import type { Message } from "../domain/types"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../profile/api/profileApi"
import { replaceDiscordTimestamps } from "../messages/utils/timestampFormatter"
import { useCurrentChat } from "../hooks/CurrentChat"
import { useGetChatByIDQuery } from "../api/chatsApi"
import { useParams } from "react-router-dom"
import { useChatSocket } from "../hooks/useChatSocket"
import { useSendChatMessage } from "../hooks/useChatActions"
import SCMarketLogo from "../../../assets/scmarket-logo.webp"
import { useTranslation } from "react-i18next"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { LongPressMenu } from "../../../components/gestures"
import { MobileFAB } from "../../../components/mobile/MobileFAB"
import { ContentCopyRounded } from "@mui/icons-material"
import { useBottomNavHeight } from "../../../hooks/layout/useBottomNavHeight"
import { USER_PATHS } from "../../../routes/paths"
import { useFormatters, useNow } from "../../../util/format"
import { MessageHeaderMobile } from "./MessageHeaderMobile"
import {
  MessageSendAreaMobile,
  DateTimePickerBottomSheetMobile,
} from "./MessageSendAreaMobile"

function MessageEntryMobile(props: { message: Message }) {
  const { message } = props
  const fmt = useFormatters()
  const now = useNow()
  const { t } = useTranslation()
  const { data: author } = useGetUserByUsernameQuery(message.author!, {
    skip: !message.author,
  })
  const convertedContent = useMemo(
    () => replaceDiscordTimestamps(message.content, fmt, now),
    [message.content, fmt, now],
  )

  // Long-press menu actions for messages
  const longPressActions = useMemo(() => {
    if (!message.content) return []
    return [
      {
        label: t("messages.copy", { defaultValue: "Copy" }),
        icon: <ContentCopyRounded />,
        onClick: () => {
          navigator.clipboard.writeText(message.content || "")
        },
      },
    ]
  }, [message.content, t])

  const messageContent = (
    <Stack direction={"row"} spacing={1.5} justifyContent={"flex-start"}>
      {message.author ? (
        <Link to={USER_PATHS.profile(message.author)}>
          <ImageAvatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
            }}
            src={author?.avatar || SCMarketLogo}
            alt={t("accessibility.userAvatar", "Avatar of {{username}}", {
              username: author?.username,
            })}
          />
        </Link>
      ) : (
        <ImageAvatar
          alt=""
          variant="rounded"
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
          }}
          src={SCMarketLogo}
        />
      )}

      <Stack direction={"column"} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction={"row"} spacing={1} alignItems={"flex-end"}>
          {message.author ? (
            <Typography variant={"subtitle2"} sx={{ fontWeight: 500 }}>
              {author?.username}
            </Typography>
          ) : (
            <Typography variant={"subtitle2"}>
              {t("MessagesBody.system")}
            </Typography>
          )}
          <Typography
            color={"text.secondary"}
            variant={"caption"}
            sx={{
              fontSize: "0.7em",
            }}
          >
            {fmt.relative(message.timestamp, now)}
          </Typography>
        </Stack>
        <Box
          sx={{
            wordBreak: "break-word",
            "& p": {
              margin: 0,
              marginBottom: 0.5,
              "&:last-child": { marginBottom: 0 },
            },
          }}
        >
          <MarkdownRender text={convertedContent} />
        </Box>
      </Stack>
    </Stack>
  )

  // Wrap with LongPressMenu if there are actions
  if (longPressActions.length > 0) {
    return (
      <LongPressMenu actions={longPressActions} enabled={true}>
        {messageContent}
      </LongPressMenu>
    )
  }

  return messageContent
}

function MessagesAreaMobile(props: {
  messages: Message[]
  messageBoxRef: RefObject<HTMLDivElement | null>
  inputAreaHeight: number
  isKeyboardOpen?: boolean
}) {
  const { messageBoxRef, inputAreaHeight, isKeyboardOpen } = props
  const [chat] = useCurrentChat()

  // Scroll to bottom when messages change
  useEffect(() => {
    const currentRef = messageBoxRef.current
    if (currentRef) {
      currentRef.scrollTop = currentRef.scrollHeight
    }
  }, [messageBoxRef, chat, props.messages])

  // Scroll to bottom when keyboard opens or input area height changes (viewport/layout resizes)
  useEffect(() => {
    const currentRef = messageBoxRef.current
    if (currentRef) {
      // Small delay to allow viewport/layout to finish resizing
      const timeoutId = setTimeout(() => {
        if (currentRef) {
          currentRef.scrollTop = currentRef.scrollHeight
        }
      }, 150)
      return () => clearTimeout(timeoutId)
    }
  }, [isKeyboardOpen, inputAreaHeight, messageBoxRef])

  const { messages } = props
  return (
    <Box
      ref={messageBoxRef}
      sx={{
        flex: 1,
        width: "100%",
        padding: 1,
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        minHeight: 0,
        // Small bottom padding for visual spacing (input area is now in flex layout, not fixed)
        paddingBottom: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        {messages.map((message: Message) => (
          <MessageEntryMobile
            message={message}
            key={`${message.timestamp}-${message.author}-${message.content.substring(0, 20)}`}
          />
        ))}
      </Stack>
      <div ref={props.messageBoxRef} />
    </Box>
  )
}

export function MessagesBodyMobile() {
  const theme = useTheme<ExtendedTheme>()
  const [currentChat, setCurrentChat] = useCurrentChat()
  const messageBoxRef = useRef<HTMLDivElement>(null)
  const sendChatMessage = useSendChatMessage()
  const { data: profile } = useGetUserProfileQuery()
  const bottomNavHeight = useBottomNavHeight()
  const isMobile = useIsMobile()
  // isKeyboardOpen is derived from bottomNavHeight (0 when keyboard is open)
  const isKeyboardOpen = bottomNavHeight === 0 && isMobile
  const inputAreaRef = useRef<HTMLDivElement>(null)
  const [inputAreaHeight, setInputAreaHeight] = useState(0)

  // Measure input area height
  useEffect(() => {
    if (inputAreaRef.current) {
      const updateHeight = () => {
        setInputAreaHeight(inputAreaRef.current?.offsetHeight || 0)
      }
      updateHeight()
      const resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(inputAreaRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

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
      }
    },
    [currentChat, profile?.username, sendChatMessage],
  )

  const { t } = useTranslation()
  const now = useNow()
  const [dateTime, setDateTime] = useState(() => new Date(now))
  const [dateTimeSheetOpen, setDateTimeSheetOpen] = useState(false)

  return (
    <>
      {currentChat && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%", // Use 100% of parent instead of viewport
            overflow: "hidden",
          }}
        >
          {/* Header spacer using mixins */}
          <Box
            sx={{
              ...theme.mixins.toolbar,
              minHeight: 64,
              height: 64,
              flexShrink: 0,
            }}
          />

          <MessageHeaderMobile />

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <MessagesAreaMobile
              messages={currentChat.messages}
              messageBoxRef={messageBoxRef}
              inputAreaHeight={inputAreaHeight}
              isKeyboardOpen={isKeyboardOpen}
            />
          </Box>

          {/* Input area - part of flex layout, not floating */}
          <Box
            ref={inputAreaRef}
            sx={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative", // For absolute positioning of FAB
            }}
          >
            {/* FAB for date/time picker - positioned absolutely 2px above input area */}
            <Box
              sx={{
                position: "absolute",
                top: -48, // 8px above input area (40px FAB height + 8px gap)
                right: 16,
                zIndex: theme.zIndex.speedDial,
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

            <MessageSendAreaMobile
              onSend={onSend}
              isKeyboardOpen={isKeyboardOpen}
            />
          </Box>

          {/* Bottom sheet for date/time picker */}
          <DateTimePickerBottomSheetMobile
            open={dateTimeSheetOpen}
            onClose={() => setDateTimeSheetOpen(false)}
            dateTime={dateTime}
            setDateTime={setDateTime}
          />
        </Box>
      )}
    </>
  )
}
