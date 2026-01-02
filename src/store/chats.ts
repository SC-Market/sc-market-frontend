import { Chat } from "../datatypes/Chat"
import { serviceApi } from "./service"
import { unwrapResponse } from "./api-utils"
import { generateTempId, createOptimisticUpdate } from "../util/optimisticUpdates"

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
      async onQueryStarted({ chat_id, content }, { dispatch, queryFulfilled, getState }) {
        // Note: Messages are also updated via socket.io, but we add optimistic update
        // for immediate feedback before socket event arrives
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: any[] = []

            // Get current user from state (if available)
            const state = getState() as any
            const currentUser = state?.auth?.user || state?.profile?.data

            // Optimistically add message to chat
            const chatPatch = dispatch(
              chatsApi.util.updateQueryData("getChatByID", chat_id, (draft) => {
                const tempMessage = {
                  author: currentUser?.username || null,
                  content: content,
                  timestamp: Date.now(),
                  chat_id: chat_id,
                }
                draft.messages = draft.messages || []
                draft.messages.push(tempMessage as any)
              }),
            )
            patches.push(chatPatch)

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
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
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: any[] = []

            // Optimistically add chat to my chats list
            // Note: We don't know the chat_id yet, so we'll create a temp one
            const tempChatId = generateTempId("chat")
            const myChatsPatch = dispatch(
              chatsApi.util.updateQueryData("getMyChats", undefined, (draft) => {
                const tempChat: Chat = {
                  chat_id: tempChatId,
                  title: null,
                  participants: body.users.map((username) => ({
                    type: "user" as const,
                    username,
                    avatar: "",
                  })),
                  messages: [],
                  order_id: null,
                }
                draft.unshift(tempChat)
              }),
            )
            patches.push(myChatsPatch)

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
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
