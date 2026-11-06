/**
 * Recruiting post comments and votes: comment on a post, reply to a
 * comment, delete your comment, vote on comments, upvote a post. Fire and
 * forget: the API slices refresh the post.
 */
import { useCallback } from "react"
import {
  useCommentsDeleteMutation,
  useCommentsDownvoteMutation,
  useCommentsReplyMutation,
  useCommentsUpvoteMutation,
} from "../api/commentsApi"
import {
  useRecruitingCommentOnPostMutation,
  useRecruitingUpvotePostMutation,
} from "../api/recruitingApi"

/** Comment on a recruiting post. */
export function useCommentOnPost() {
  const [submitCommentPost] = useRecruitingCommentOnPostMutation()
  return useCallback(
    (postId: string, content: string) => {
      submitCommentPost({ content, post_id: postId })
    },
    [submitCommentPost],
  )
}

/**
 * Reply to a comment: under a recruiting post when `postId` is given,
 * otherwise as a plain comment reply.
 */
export function useReplyToComment(postId: string | undefined) {
  const [submitComment] = useCommentsReplyMutation()
  const [submitCommentPost] = useRecruitingCommentOnPostMutation()
  return useCallback(
    (commentId: string, content: string) => {
      if (postId) {
        submitCommentPost({ reply_to: commentId, content, post_id: postId })
      } else {
        submitComment({ comment_id: commentId, content })
      }
    },
    [postId, submitComment, submitCommentPost],
  )
}

/** Delete one of your comments. */
export function useDeleteComment(postId: string | undefined) {
  const [deleteComment] = useCommentsDeleteMutation()
  return useCallback(
    (commentId: string) => {
      deleteComment({ comment_id: commentId, post_id: postId })
    },
    [deleteComment, postId],
  )
}

/** Up- or downvote a comment. */
export function useCommentVotes(postId: string | undefined) {
  const [doUpvote] = useCommentsUpvoteMutation()
  const [doDownvote] = useCommentsDownvoteMutation()
  const upvote = useCallback(
    (commentId: string) => {
      doUpvote({ comment_id: commentId, post_id: postId })
    },
    [doUpvote, postId],
  )
  const downvote = useCallback(
    (commentId: string) => {
      doDownvote({ comment_id: commentId, post_id: postId })
    },
    [doDownvote, postId],
  )
  return { upvote, downvote }
}

/** Upvote a recruiting post. */
export function useUpvoteRecruitingPost() {
  const [doUpvote] = useRecruitingUpvotePostMutation()
  return useCallback(
    (postId: string) => {
      doUpvote(postId)
    },
    [doUpvote],
  )
}
