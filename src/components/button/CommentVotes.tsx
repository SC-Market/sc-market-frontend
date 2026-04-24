import {
  RecruitingPost,
  useRecruitingDownvotePostMutation,
  useRecruitingUpvotePostMutation,
} from "../../features/recruiting/api/recruitingApi"
import { Button, ButtonGroup } from "@mui/material"
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from "@mui/icons-material"
import React from "react"
import { Comment as RecruitingComment } from "../../features/recruiting/api/recruitingApi"
import {
  Comment,
  useCommentsDownvoteMutation,
  useCommentsUpvoteMutation,
} from "../../features/recruiting/api/commentsApi"
import { useTranslation } from "react-i18next"

export function CommentVotes(props: {
  comment: Comment | RecruitingComment
  post?: RecruitingPost
}) {
  const { comment, post } = props
  const { t } = useTranslation()

  const [
    doUpvote, // This is the mutation trigger
  ] = useCommentsUpvoteMutation()

  const [
    doDownvote, // This is the mutation trigger
  ] = useCommentsDownvoteMutation()

  return (
    <ButtonGroup
      orientation={"vertical"}
      variant={"text"}
      size={"small"}
      aria-label={t("accessibility.commentVoting", "Comment voting controls")}
    >
      <Button
        color={"success"}
        startIcon={<KeyboardArrowUpRounded />}
        onClick={() =>
          doUpvote({ comment_id: comment.comment_id, post_id: post?.post_id })
        }
        title={t("commentVotes.upvoteTooltip", "Upvote this comment")}
        aria-label={t("accessibility.upvoteComment", "Upvote this comment")}
        aria-describedby={`upvote-count-${comment.comment_id}`}
      >
        <span id={`upvote-count-${comment.comment_id}`} className="sr-only">
          {t("accessibility.upvoteCount", "Upvotes: {{count}}", {
            count: comment.upvotes,
          })}
        </span>
        {comment.upvotes}
      </Button>
      <Button
        color={"error"}
        startIcon={<KeyboardArrowDownRounded />}
        onClick={() =>
          doDownvote({ comment_id: comment.comment_id, post_id: post?.post_id })
        }
        title={t("commentVotes.downvoteTooltip", "Downvote this comment")}
        aria-label={t("accessibility.downvoteComment", "Downvote this comment")}
        aria-describedby={`downvote-count-${comment.comment_id}`}
      >
        <span id={`downvote-count-${comment.comment_id}`} className="sr-only">
          {t("accessibility.downvoteCount", "Downvotes: {{count}}", {
            count: comment.downvotes,
          })}
        </span>
        {comment.downvotes}
      </Button>
    </ButtonGroup>
  )
}
