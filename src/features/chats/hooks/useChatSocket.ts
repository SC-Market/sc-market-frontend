import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../../store/store"
import { chatsApi } from "../api/chatsApi"
import type { Chat, Message } from "../domain/types"
import { getChatSocket } from "../socket"
import { useSession } from "../../../hooks/login/useSession"

/**
 * Live chat updates for the open conversation, over the shared chat socket.
 *
 * - Keeps the socket connected while the user is authenticated and
 *   disconnects it otherwise. It stays connected across chat views.
 * - Merges `serverMessage` events into `currentChat` and the `getChatByID`
 *   cache (replacing the optimistic copy of a message we sent).
 * - Joins the room for `currentChatId` and leaves it on change/unmount.
 *
 * Mount it once per rendered message view.
 */
export function useChatSocket(
  currentChatId: string | undefined,
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null | undefined>>,
) {
  const dispatch = useDispatch<AppDispatch>()
  const { status } = useSession()
  const authenticated = status === "authenticated"

  useEffect(() => {
    const socket = getChatSocket()
    if (authenticated) {
      if (!socket.connected) socket.connect()
    } else {
      socket.disconnect()
    }
  }, [authenticated])

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

    const socket = getChatSocket()
    socket.on("serverMessage", onServerMessage)
    return () => {
      socket.off("serverMessage", onServerMessage)
    }
  }, [setCurrentChat, dispatch])

  useEffect(() => {
    if (!currentChatId) return
    const socket = getChatSocket()
    socket.emit("clientJoinRoom", { chat_id: currentChatId })
    return () => {
      socket.emit("clientLeaveRoom", { chat_id: currentChatId })
    }
  }, [currentChatId])
}
