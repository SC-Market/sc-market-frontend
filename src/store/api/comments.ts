import { generatedApi as api } from "../generatedApi"
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';
export const addTagTypes = ["Comments"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      replyToComment: build.mutation<
        ReplyToCommentApiResponse,
        ReplyToCommentApiArg
      >({
        query: (queryArg) => ({
          url: `/api/comments/${queryArg.commentId}/reply`,
          method: "POST",
          body: queryArg.commentReplyRequest,
        }),
        invalidatesTags: ["Comments"],
      }),
      deleteComment: build.mutation<
        DeleteCommentApiResponse,
        DeleteCommentApiArg
      >({
        query: (queryArg) => ({
          url: `/api/comments/${queryArg.commentId}/delete`,
          method: "POST",
        }),
        invalidatesTags: ["Comments"],
      }),
      updateComment: build.mutation<
        UpdateCommentApiResponse,
        UpdateCommentApiArg
      >({
        query: (queryArg) => ({
          url: `/api/comments/${queryArg.commentId}/update`,
          method: "POST",
          body: queryArg.commentUpdateRequest,
        }),
        invalidatesTags: ["Comments"],
      }),
      upvoteComment: build.mutation<
        UpvoteCommentApiResponse,
        UpvoteCommentApiArg
      >({
        query: (queryArg) => ({
          url: `/api/comments/${queryArg.commentId}/upvote`,
          method: "POST",
        }),
        invalidatesTags: ["Comments"],
      }),
      downvoteComment: build.mutation<
        DownvoteCommentApiResponse,
        DownvoteCommentApiArg
      >({
        query: (queryArg) => ({
          url: `/api/comments/${queryArg.commentId}/downvote`,
          method: "POST",
        }),
        invalidatesTags: ["Comments"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as commentsApi }
export type ReplyToCommentApiResponse =
  /** status 200 Reply created successfully */ Comment
export type ReplyToCommentApiArg = {
  /** Comment ID to reply to */
  commentId: string
  commentReplyRequest: CommentReplyRequest
}
export type DeleteCommentApiResponse =
  /** status 200 Comment deleted successfully */ {
    message?: string
  }
export type DeleteCommentApiArg = {
  /** Comment ID to delete */
  commentId: string
}
export type UpdateCommentApiResponse =
  /** status 200 Comment updated successfully */ {
    message?: string
  }
export type UpdateCommentApiArg = {
  /** Comment ID to update */
  commentId: string
  commentUpdateRequest: CommentUpdateRequest
}
export type UpvoteCommentApiResponse =
  /** status 200 Comment upvoted successfully */ {
    message?: string
  }
export type UpvoteCommentApiArg = {
  /** Comment ID to upvote */
  commentId: string
}
export type DownvoteCommentApiResponse =
  /** status 200 Comment downvoted successfully */ {
    message?: string
  }
export type DownvoteCommentApiArg = {
  /** Comment ID to downvote */
  commentId: string
}
export type Comment = {
  comment_id: string
  author: string
  content: string
  reply_to?: string | null
  created_at: string
  updated_at: string
  deleted: boolean
  upvotes: number
  downvotes: number
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
export type ServerError = {
  message: "Internal Server Error"
}
export type CommentReplyRequest = {
  /** Comment content */
  content: string
}
export type CommentUpdateRequest = {
  /** Updated comment content */
  content: string
}
export const {
  useReplyToCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useUpvoteCommentMutation,
  useDownvoteCommentMutation,
} = injectedRtkApi
