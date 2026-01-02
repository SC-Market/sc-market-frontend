import { Chat } from "../datatypes/Chat"
import { serviceApi } from "./service"
import { unwrapResponse } from "./orders"

export const chatsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatByID: builder.query<Chat, string>({
      query: (chat_id) => `/api/chats/${chat_id}`,
      providesTags: ["Chat" as const],
      transformResponse: unwrapResponse,
    }),
    sendChatMessage: builder.mutation<
      void,
      {
        chat_id: string
        content: string
      }
    >({
      query: ({ chat_id, content }) => ({
        url: `/api/chats/${chat_id}/messages`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Chat" as const],
      transformResponse: unwrapResponse,
    }),
    getChatByOrderID: builder.query<Chat, string>({
      query: (order_id) => `/api/chats/orders/${order_id}`,
      providesTags: ["Chat" as const],
      transformResponse: unwrapResponse,
    }),
    getChatByOfferID: builder.query<Chat, string>({
      query: (offer_id) => `/api/chats/offers/${offer_id}`,
      providesTags: ["Chat" as const],
      transformResponse: unwrapResponse,
    }),
    createChat: builder.mutation<
      void,
      {
        users: string[]
      }
    >({
      query: (body) => ({
        url: `/api/chats`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: ["Chat" as const],
    }),
    getMyChats: builder.query<Chat[], void>({
      query: () => `/api/chats`,
      transformResponse: unwrapResponse,
    }),
  }),
})

export const {
  useCreateChatMutation,
  useGetMyChatsQuery,
  useGetChatByOrderIDQuery,
  useSendChatMessageMutation,
  useGetChatByOfferIDQuery,
  useGetChatByIDQuery,
} = chatsApi
