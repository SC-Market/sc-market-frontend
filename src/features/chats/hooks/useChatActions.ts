/** Sending a chat message, and starting a chat with other users. */
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useAlertHook,
  type UnwrappedErrorInterface,
} from "../../../hooks/alert/AlertHook"
import {
  useCreateChatMutation,
  useSendChatMessageMutation,
} from "../api/chatsApi"

/**
 * Send a message. RTK Query adds it to the chat optimistically; a failure
 * is alerted.
 */
export function useSendChatMessage() {
  const issueAlert = useAlertHook()
  const [sendChatMessage] = useSendChatMessageMutation()
  return useCallback(
    (chatId: string, content: string, username: string) => {
      sendChatMessage({ chat_id: chatId, content, username })
        .unwrap()
        .catch((error) => {
          issueAlert(error as UnwrappedErrorInterface)
        })
    },
    [sendChatMessage, issueAlert],
  )
}

/**
 * Start a chat with users. Alerts the outcome; resolves to null when it was
 * created, else the message to show by the form.
 */
export function useCreateChat() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [createChatMutation, { isLoading: isCreating }] =
    useCreateChatMutation()

  const create = useCallback(
    async (usernames: string[]): Promise<string | null> => {
      try {
        await createChatMutation({ users: usernames }).unwrap()
        issueAlert({
          message: t("messages.chatCreated", {
            defaultValue: "Chat created",
          }),
          severity: "success",
        })
        return null
      } catch (err) {
        issueAlert(err as UnwrappedErrorInterface)
        return err && typeof err === "object" && "data" in err && err.data
          ? (err.data as { error?: { message?: string } })?.error?.message ||
              t("messagesUi2.createChat.failed")
          : t("messagesUi2.createChat.failed")
      }
    },
    [createChatMutation, issueAlert, t],
  )

  return { create, isCreating }
}
