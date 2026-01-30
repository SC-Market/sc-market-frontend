import { serviceApi as api } from "../service"
export const addTagTypes = ["Chats"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getChatByOrderId: build.query<
        GetChatByOrderIdApiResponse,
        GetChatByOrderIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/chats/orders/${queryArg.orderId}` }),
        providesTags: ["Chats"],
      }),
      getChatByOfferSessionId: build.query<
        GetChatByOfferSessionIdApiResponse,
        GetChatByOfferSessionIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/chats/offers/${queryArg.sessionId}`,
        }),
        providesTags: ["Chats"],
      }),
      sendMessage: build.mutation<SendMessageApiResponse, SendMessageApiArg>({
        query: (queryArg) => ({
          url: `/api/chats/${queryArg.chatId}/messages`,
          method: "POST",
          body: queryArg.messageBody,
        }),
        invalidatesTags: ["Chats"],
      }),
      createChat: build.mutation<CreateChatApiResponse, CreateChatApiArg>({
        query: (queryArg) => ({
          url: `/api/chats`,
          method: "POST",
          body: queryArg.chatBody,
        }),
        invalidatesTags: ["Chats"],
      }),
      getChats: build.query<GetChatsApiResponse, GetChatsApiArg>({
        query: () => ({ url: `/api/chats` }),
        providesTags: ["Chats"],
      }),
      getChatById: build.query<GetChatByIdApiResponse, GetChatByIdApiArg>({
        query: (queryArg) => ({ url: `/api/chats/${queryArg.chatId}` }),
        providesTags: ["Chats"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as chatsApi }
export type GetChatByOrderIdApiResponse =
  /** status 200 OK - Successful request with response body */ Chat
export type GetChatByOrderIdApiArg = {
  /** Related order for chat */
  orderId: string
}
export type GetChatByOfferSessionIdApiResponse =
  /** status 200 OK - Successful request with response body */ Chat
export type GetChatByOfferSessionIdApiArg = {
  /** Related offer session for chat */
  sessionId: string
}
export type SendMessageApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type SendMessageApiArg = {
  /** ID of chat */
  chatId: string
  messageBody: MessageBody
}
export type CreateChatApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateChatApiArg = {
  chatBody: Chat2
}
export type GetChatsApiResponse =
  /** status 200 OK - Successful request with response body */ Chat[]
export type GetChatsApiArg = void
export type GetChatByIdApiResponse =
  /** status 200 OK - Successful request with response body */ Chat
export type GetChatByIdApiArg = {
  /** ID of chat */
  chatId: string
}
export type Message = {
  author: string | null
  content: string
  timestamp: number
}
export type Chat = {
  chat_id: string
  participants: {
    username: string
    avatar: string
  }[]
  messages: Message[]
  order_id: string | null
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type Unauthorized = {
  message: "Unauthorized"
}
export type Forbidden = {
  message: "Forbidden"
}
export type NotFound = {
  message: "Not Found"
}
export type RateLimitError = {
  /** Error type identifier */
  error: "RATE_LIMIT_EXCEEDED"
  /** Human-readable error message */
  message: string
  /** Seconds to wait before retrying */
  retryAfter: number
  /** Maximum requests allowed per time window */
  limit: number
  /** Requests remaining in current window */
  remaining: number
  /** Unix timestamp when rate limit resets */
  resetTime: number
  /** User tier that triggered the rate limit */
  userTier: "anonymous" | "authenticated" | "admin"
  /** Endpoint that was rate limited */
  endpoint: string
}
export type MessageBody = {
  content: string
}
export type Chat2 = {
  users?: string[]
}
export const {
  useGetChatByOrderIdQuery,
  useGetChatByOfferSessionIdQuery,
  useSendMessageMutation,
  useCreateChatMutation,
  useGetChatsQuery,
  useGetChatByIdQuery,
} = injectedRtkApi
