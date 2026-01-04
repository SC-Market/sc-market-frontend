import { Chat, Message } from "../datatypes/Chat"
import { serviceApi } from "./service"
import { unwrapResponse } from "./api-utils"
import {
  generateTempId,
  createOptimisticUpdate,
  OptimisticPatch,
} from "../util/optimisticUpdates"
import type { RootState } from "./store"

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
      async onQueryStarted(
        { chat_id, content },
        { dispatch, queryFulfilled, getState },
      ) {
        // Note: Messages are also updated via socket.io, but we add optimistic update
        // for immediate feedback before socket event arrives
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: OptimisticPatch[] = []

            // Get current user from RTK Query cache
            // The query key format is "profileGetUserProfile(undefined)"
            const state = getState() as RootState
            const serviceApiState = state[serviceApi.reducerPath]
            let profileData = serviceApiState?.queries?.["profileGetUserProfile(undefined)"]?.data as 
              | { username?: string } 
              | undefined
            
            // If not found, try alternative query key formats
            if (!profileData?.username) {
              const profileQueryKey = Object.keys(serviceApiState?.queries || {}).find(
                (key) => key.includes("profileGetUserProfile") && serviceApiState.queries[key]?.data
              )
              if (profileQueryKey) {
                profileData = serviceApiState.queries[profileQueryKey]?.data as { username?: string } | undefined
              }
            }
            
            const currentUser = profileData?.username || null

            // Optimistically add message to chat
            const chatPatch = dispatch(
              chatsApi.util.updateQueryData("getChatByID", chat_id, (draft) => {
                const tempMessage: Message = {
                  author: currentUser,
                  content: content,
                  timestamp: Date.now(),
                  chat_id: chat_id,
                }
                draft.messages = draft.messages || []
                // Check if message already exists (avoid duplicates) - use content + author since timestamp is server-side
                const messageExists = draft.messages.some(
                  (msg) => msg.content === content && msg.author === currentUser
                )
                if (!messageExists) {
                  draft.messages.push(tempMessage)
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

export const {
  useCreateChatMutation,
  useGetMyChatsQuery,
  useGetChatByOrderIDQuery,
  useSendChatMessageMutation,
  useGetChatByOfferIDQuery,
  useGetChatByIDQuery,
} = chatsApi
