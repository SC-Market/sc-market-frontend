import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  TextField,
} from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { HapticIconButton } from "../../../components/haptic"
import { useTheme } from "@mui/material/styles"
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import SearchIcon from "@mui/icons-material/SearchRounded"
import AddIcon from "@mui/icons-material/AddRounded"
import { useMessageGroupCreate } from "../hooks/MessageGroupCreate"
import { useGetMyChatsQuery } from "../api/chatsApi"
import { useTranslation } from "react-i18next"
import { MessageListSkeleton } from "../../../components/skeletons"
import {
  EmptyMessages,
  EmptySearchResults,
} from "../../../components/empty-states"
import { isAwaitingData } from "../../../util/queryLoading"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"
import { ChatEntry } from "./ChatEntry"

export interface MessagingSidebarContentProps {
  asPageContent?: boolean
}

export function MessagingSidebarContent(
  props: MessagingSidebarContentProps = {},
) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const [, setCreatingMessageGroup] = useMessageGroupCreate()
  const {
    data: chats,
    isFetching,
    currentData,
    isLoading: pageIsLoading,
  } = useGetMyChatsQuery()
  // The chat list is primary content on the messages pages.
  usePageReady(
    isPrimaryLoading({ isLoading: pageIsLoading, isFetching, currentData }),
  )
  const [searchQuery, setSearchQuery] = useState("")

  // Create a map of chat_id -> unread count from the chats data
  // The backend now provides unread_count for each chat
  const unreadCountsByChat = useMemo(() => {
    const counts: Record<string, number> = {}

    if (!chats) return counts

    chats.forEach((chat) => {
      counts[chat.chat_id] = chat.unread_count || 0
    })

    return counts
  }, [chats])

  // Sort chats: unread first, then by last activity (most recent first)
  const sortedChats = useMemo(() => {
    if (!chats) return []

    return [...chats].sort((a, b) => {
      const aUnread = unreadCountsByChat[a.chat_id] || 0
      const bUnread = unreadCountsByChat[b.chat_id] || 0

      // First, sort by unread status (unread chats first)
      if (aUnread > 0 && bUnread === 0) return -1
      if (aUnread === 0 && bUnread > 0) return 1

      // Then sort by last activity (most recent first)
      const aLastMessage = a.messages[a.messages.length - 1]
      const bLastMessage = b.messages[b.messages.length - 1]

      // If no messages, put at the end
      if (!aLastMessage && !bLastMessage) return 0
      if (!aLastMessage) return 1
      if (!bLastMessage) return -1

      // Sort by timestamp descending (most recent first)
      return bLastMessage.timestamp - aLastMessage.timestamp
    })
  }, [chats, unreadCountsByChat])

  // Track visible chat entries using Intersection Observer
  const [visibleChatIds, setVisibleChatIds] = useState<Set<string>>(new Set())
  const chatEntryRefs = useRef<Map<string, HTMLElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Set up intersection observer once
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleChatIds((prev) => {
          const next = new Set(prev)
          entries.forEach((entry) => {
            const chatId = entry.target.getAttribute("data-chat-id")
            if (chatId) {
              if (entry.isIntersecting) {
                next.add(chatId)
              } else {
                next.delete(chatId)
              }
            }
          })
          return next
        })
      },
      {
        root: null, // Use viewport as root
        rootMargin: "50px", // Start loading 50px before entry becomes visible
        threshold: 0.1, // Trigger when 10% visible
      },
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  // Observe/unobserve elements as refs are set
  const createEntryRef = useCallback((chatId: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        chatEntryRefs.current.set(chatId, el)
        if (observerRef.current) {
          observerRef.current.observe(el)
        }
      } else {
        const existing = chatEntryRefs.current.get(chatId)
        if (existing && observerRef.current) {
          observerRef.current.unobserve(existing)
        }
        chatEntryRefs.current.delete(chatId)
      }
    }
  }, [])

  const content = (
    <Box
      sx={{
        width: "100%",
        height: props.asPageContent ? "100%" : undefined,
        flexDirection: "column",
        display: "flex",
        borderRight: props.asPageContent ? 0 : 1,
        paddingTop: props.asPageContent
          ? 0
          : { xs: theme.spacing(2), sm: theme.spacing(3) },
        borderColor: props.asPageContent
          ? "transparent"
          : theme.palette.outline.main,
        overflow: "hidden", // Prevent this container from scrolling
      }}
    >
      <Box
        display={"flex"}
        sx={{
          width: "100%",
          padding: { xs: 1.5, sm: 2 },
          flexDirection: { xs: "row", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
        justifyContent={"space-between"}
        alignItems={{ xs: "center", sm: "center" }}
      >
        <HeaderTitle sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          {t("MessagingSidebar.messages")}
        </HeaderTitle>
        {isMobile ? (
          <HapticIconButton
            aria-label={t("MessagingSidebar.newMessage", "New message")}
            onClick={() => setCreatingMessageGroup(true)}
          >
            <AddIcon />
          </HapticIconButton>
        ) : (
          <Button
            variant={"contained"}
            startIcon={<AddIcon />}
            size={"large"}
            onClick={() => setCreatingMessageGroup(true)}
          >
            {t("MessagingSidebar.group")}
          </Button>
        )}
      </Box>
      <Box sx={{ padding: { xs: 1.5, sm: 2 } }}>
        <TextField
          fullWidth
          label={t("MessagingSidebar.search")}
          value={searchQuery}
          onChange={(event: React.ChangeEvent<{ value: string }>) => {
            setSearchQuery(event.target.value)
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  aria-label={t("MessagingSidebar.search", "Search messages")}
                  size={isMobile ? "small" : "medium"}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          size={isMobile ? "small" : "medium"}
        />
      </Box>
      <List
        sx={{
          borderTop: 1,
          borderColor: theme.palette.outline.main,
          flexGrow: props.asPageContent ? 1 : 0,
          minHeight: 0, // Allow flex item to shrink
          overflow: "auto", // Only the list scrolls, not the whole sidebar
        }}
      >
        {isAwaitingData({ isFetching, currentData }) ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <MessageListSkeleton key={i} />
            ))}
          </>
        ) : (chats || []).length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyMessages
              isChatList={true}
              showCreateAction={true}
              sx={{ py: 2 }}
            />
          </Box>
        ) : sortedChats.filter((chat) => {
            if (!searchQuery) return true
            // Search in user usernames and contractor names
            const searchLower = searchQuery.toLowerCase()
            return chat.participants.some((p) => {
              if (p.type === "user") {
                return p.username.toLowerCase().includes(searchLower)
              } else {
                return p.name.toLowerCase().includes(searchLower)
              }
            })
          }).length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptySearchResults
              searchQuery={searchQuery}
              onClearFilters={() => setSearchQuery("")}
              sx={{ py: 2 }}
            />
          </Box>
        ) : (
          sortedChats
            .filter((chat) => {
              if (!searchQuery) return true
              // Search in user usernames and contractor names
              const searchLower = searchQuery.toLowerCase()
              return chat.participants.some((p) => {
                if (p.type === "user") {
                  return p.username.toLowerCase().includes(searchLower)
                } else {
                  return p.name.toLowerCase().includes(searchLower)
                }
              })
            })
            .map((chat) => {
              const isVisible = visibleChatIds.has(chat.chat_id)
              return (
                <ChatEntry
                  key={chat.chat_id}
                  chat={chat}
                  unreadCount={unreadCountsByChat[chat.chat_id]}
                  isVisible={isVisible}
                  entryRef={createEntryRef(chat.chat_id)}
                />
              )
            })
        )}
      </List>
    </Box>
  )

  return content
}
