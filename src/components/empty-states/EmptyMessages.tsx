import React from "react"
import { useNavigate } from "react-router-dom"
import { ChatBubbleOutlineOutlined, InboxOutlined } from "@mui/icons-material"
import { EmptyState, EmptyStateProps } from "./EmptyState"
import { useTranslation } from "react-i18next"

export interface EmptyMessagesProps extends Omit<
  EmptyStateProps,
  "title" | "icon" | "action"
> {
  /**
   * Whether this is for chat list (vs. message thread)
   */
  isChatList?: boolean
  /**
   * Custom title override
   */
  title?: string
  /**
   * Custom description override
   */
  description?: string
  /**
   * Whether to show the create chat action
   */
  showCreateAction?: boolean
  /**
   * Custom action override
   */
  action?: EmptyStateProps["action"]
}

/**
 * Empty state component for messages/chats
 *
 * Displays when there are no messages or chats, with actionable CTA
 */
export function EmptyMessages({
  isChatList = false,
  title,
  description,
  showCreateAction = true,
  action,
  ...props
}: EmptyMessagesProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const defaultTitle = isChatList
    ? t("emptyStates.messages.noChats", {
        defaultValue: "No conversations yet",
      })
    : t("emptyStates.messages.noMessages", { defaultValue: "No messages yet" })

  const defaultDescription = isChatList
    ? t("emptyStates.messages.noChatsDescription", {
        defaultValue: "Start a conversation with other users or contractors",
      })
    : t("emptyStates.messages.noMessagesDescription", {
        defaultValue: "Send a message to start the conversation",
      })

  const defaultAction = showCreateAction
    ? {
        label: isChatList
          ? t("emptyStates.messages.startConversation", {
              defaultValue: "Start Conversation",
            })
          : t("emptyStates.messages.sendMessage", {
              defaultValue: "Send Message",
            }),
        onClick: () => {
          // For chat list, we could open the create chat dialog
          // For message thread, the action would be context-specific
          if (isChatList) {
            // This would typically trigger a create chat dialog
            // For now, we'll just navigate to messages page
            navigate("/messages")
          }
        },
        variant: "contained" as const,
      }
    : undefined

  return (
    <EmptyState
      title={title || defaultTitle}
      description={description || defaultDescription}
      icon={isChatList ? <InboxOutlined /> : <ChatBubbleOutlineOutlined />}
      action={action || defaultAction}
      {...props}
    />
  )
}
