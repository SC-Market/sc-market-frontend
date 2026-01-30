import { generatedApi as api } from "../generatedApi"
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
