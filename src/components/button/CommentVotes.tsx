import {
  RecruitingPost,
  useRecruitingDownvotePostMutation,
  useRecruitingUpvotePostMutation,
} from "../../store/recruiting"
import React from "react"
import { Comment as RecruitingComment } from "../../store/recruiting"
import {
  Comment,
  useCommentsDownvoteMutation,
  useCommentsUpvoteMutation,
} from "../../store/comments"
import { useTranslation } from "react-i18next"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';

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
