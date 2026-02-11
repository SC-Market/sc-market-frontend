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

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Badge from '@mui/material/Badge';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BusinessIcon from '@mui/icons-material/Business';
import StarRounded from '@mui/icons-material/StarRounded';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';

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
                draft.messages = draft.messages || []
                // Check if message already exists (avoid duplicates) - use content + author since timestamp is server-side
                const messageExists = draft.messages.some(
                  (msg) => msg.content === content && msg.author === username,
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

// Export hooks for usage in functional components
export const {
  useCreateChatMutation,
  useGetMyChatsQuery,
  useGetChatByOrderIDQuery,
  useSendChatMessageMutation,
  useGetChatByOfferIDQuery,
  useGetChatByIDQuery,
} = chatsApi
