import { serviceApi } from "../../../store/service"
import { generatedApi } from "../../../store/generatedApi"
import { unwrapResponse } from "../../../store/api-utils"
import {
  generateTempId,
  createOptimisticUpdate,
  OptimisticPatch,
} from "../../../util/optimisticUpdates"
import type { RootState } from "../../../store/store"
import type { Chat, Message } from "../domain/types"

/**
 * Chats API endpoints
 */
export const chatsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
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
        username: string
      }
    >({
      query: ({ chat_id, content }) => ({
        url: `/api/chats/${chat_id}/messages`,
        method: "POST",
        body: { content },
      }),
      async onQueryStarted(
        { chat_id, content, username },
        { dispatch, queryFulfilled },
      ) {
        console.log('[sendMessage] Starting with:', { chat_id, content, username })
        // Note: Messages are also updated via socket.io, but we add optimistic update
        // for immediate feedback before socket event arrives
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: OptimisticPatch[] = []

            // Optimistically add message to chat
            const chatPatch = dispatch(
              chatsApi.util.updateQueryData("getChatByID", chat_id, (draft) => {
                const tempMessage: Message = {
                  author: username,
                  content: content,
                  timestamp: Date.now(),
                  chat_id: chat_id,
                }
                console.log('[sendMessage] Creating optimistic message:', tempMessage)
                draft.messages = draft.messages || []
                // Check if message already exists (avoid duplicates) - use content + author since timestamp is server-side
                const messageExists = draft.messages.some(
                  (msg) =>
                    msg.content === content && msg.author === username,
                )
                console.log('[sendMessage] Message exists?', messageExists, 'Current messages:', draft.messages.length)
                if (!messageExists) {
                  draft.messages.push(tempMessage)
                  console.log('[sendMessage] Added optimistic message, total messages:', draft.messages.length)
                }
              }),
            )
            patches.push(chatPatch)

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      // Don't invalidate - we handle updates via optimistic updates and socket.io
      // Invalidating would cause refetch and overwrite optimistic updates
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
              chatsApi.util.updateQueryData(
                "getMyChats",
                undefined,
                (draft) => {
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
                },
              ),
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

// Export hooks for usage in functional components
export const {
  useCreateChatMutation,
  useGetMyChatsQuery,
  useGetChatByOrderIDQuery,
  useSendChatMessageMutation,
  useGetChatByOfferIDQuery,
  useGetChatByIDQuery,
} = chatsApi
