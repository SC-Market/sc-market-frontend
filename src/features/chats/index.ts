// Import API to ensure it's registered (side effect)
import "./api/chatsApi"

// API exports
export {
  chatsApi,
  useCreateChatMutation,
  useGetMyChatsQuery,
  useGetChatByOrderIDQuery,
  useSendChatMessageMutation,
  useGetChatByOfferIDQuery,
  useGetChatByIDQuery,
} from "./api/chatsApi"

// Domain exports
export type {
  Chat,
  Message,
  UserParticipant,
  ContractorParticipant,
} from "./domain/types"

// Hooks exports
export { CurrentChatIDContext, useCurrentChatID } from "./hooks/CurrentChatID"
export { CurrentChatMessagesContext } from "./hooks/CurrentChatMessages"
export { CurrentChatContext, useCurrentChat } from "./hooks/CurrentChat"
export {
  MessageGroupCreateContext,
  useMessageGroupCreate,
} from "./hooks/MessageGroupCreate"
export {
  useMessagingSidebar,
  MessagingSidebarContext,
} from "./hooks/MessagingSidebar"
export { useUnreadChatCount } from "./hooks/UnreadChatCount"

// Component exports
export {
  MessagingSidebar,
  messagingDrawerWidth,
} from "./components/MessagingSidebar"
export { MessagingSidebarContent } from "./components/MessagingSidebarContent"
export { MessagesBody } from "./components/MessagesBody"
export { MessagesBodyMobile } from "./components/MessagesBodyMobile"
export { CreateMessageGroupBody } from "./components/CreateMessageGroup"
