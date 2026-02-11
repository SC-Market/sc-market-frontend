import {
  Comment,
  RecruitingPost,
  useRecruitingCommentOnPostMutation,
} from "../../store/recruiting"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import {
  useCommentsDeleteMutation,
  useCommentsReplyMutation,
} from "../../store/comments"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useGetUserProfileQuery } from "../../store/profile"
import { TrashCan } from "mdi-material-ui"
import { CommentVotes } from "../../components/button/CommentVotes"
import { useTranslation } from "react-i18next"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';

export const defaultAvatar =
  "https://robertsspaceindustries.com/rsi/static/images/account/avatar_default_big.jpg"

export function CommentTree(props: {
  comment: Comment
  post?: RecruitingPost
  depth: number
}) {
  const { comment, post, depth } = props
  const [replyOpen, setReplyOpen] = useState(false)
  const { t } = useTranslation()

  const [submitComment] = useCommentsReplyMutation()
  const [deleteComment] = useCommentsDeleteMutation()
  const [submitCommentPost] = useRecruitingCommentOnPostMutation()
  const [content, setContent] = useState("")

  const { data: profile } = useGetUserProfileQuery()

  return (
    <Grid item xs={12}>
      <Divider light />
      <Box
        display={"flex"}
        justifyContent={"evenly-spaced"}
        sx={{ marginTop: 2, "& > *": { marginRight: 2 } }}
      >
        <CommentVotes comment={comment} post={post} />
        <Avatar
          variant={"rounded"}
          src={comment.author?.avatar || defaultAvatar}
          sx={{ width: 64, height: 64 }}
          alt={t("commentTree.avatar_alt", {
            username: comment.author?.username,
          })}
        />
        <Box>
          <MaterialLink
            component={Link}
            to={`/user/${comment.author?.username}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <UnderlineLink variant={"subtitle2"}>
              {comment.author?.display_name || t("commentTree.deleted")}
            </UnderlineLink>
          </MaterialLink>
          <Typography>
            <MarkdownRender text={comment.content} plainText />
          </Typography>
        </Box>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <IconButton
            color={"secondary"}
            onClick={() => setReplyOpen((o) => !o)}
          >
            <ReplyRounded />
          </IconButton>
          {comment.author && comment.author?.username === profile?.username && (
            <IconButton
              color={"error"}
              onClick={() =>
                deleteComment({
                  comment_id: comment.comment_id,
                  post_id: post?.post_id,
                })
              }
            >
              <TrashCan />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Collapse in={replyOpen}>
          <Box sx={{ marginTop: 2 }} display={"flex"} alignItems={"center"}>
            <TextField
              fullWidth
              sx={{ marginRight: 2 }}
              multiline
              label={t("commentTree.reply")}
              value={content}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setContent(event.target.value)
              }}
            />

            <Button
              onClick={() => {
                if (post) {
                  submitCommentPost({
                    reply_to: comment.comment_id,
                    content,
                    post_id: post?.post_id,
                  })
                } else {
                  submitComment({ comment_id: comment.comment_id, content })
                }
                setContent("")
                setReplyOpen(false)
              }}
            >
              {t("commentTree.post")}
            </Button>
          </Box>
        </Collapse>
      </Box>
      <Box
        display={"flex"}
        justifyContent={"evenly-spaced"}
        sx={{ marginTop: 2 }}
      >
        {depth < 3 && <Box sx={{ width: 32, marginRight: 2 }} />}
        <Box sx={{ width: "100%" }}>
          {comment.replies.map((c) => (
            <CommentTree
              comment={c}
              post={post}
              depth={depth + 1}
              key={c.comment_id}
            />
          ))}
        </Box>
      </Box>
    </Grid>
  )
}
