import {
  Comment,
  RecruitingPost,
} from "../../features/recruiting/api/recruitingApi"
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Link as MaterialLink,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { ReplyRounded } from "@mui/icons-material"
import {
  useDeleteComment,
  useReplyToComment,
} from "../../features/recruiting/hooks/useCommentActions"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { TrashCan } from "mdi-material-ui"
import { CommentVotes } from "../../components/button/CommentVotes"
import { useTranslation } from "react-i18next"
import { USER_PATHS } from "../../routes/paths"

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

  const replyToComment = useReplyToComment(post?.post_id)
  const deleteComment = useDeleteComment(post?.post_id)
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
          {comment.author ? (
            <MaterialLink
              component={Link}
              to={USER_PATHS.profile(comment.author.username)}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <UnderlineLink variant={"subtitle2"}>
                {comment.author.display_name || t("commentTree.deleted")}
              </UnderlineLink>
            </MaterialLink>
          ) : (
            <Typography variant={"subtitle2"}>
              {t("commentTree.deleted")}
            </Typography>
          )}
          <Typography component="div">
            <MarkdownRender text={comment.content} plainText />
          </Typography>
        </Box>
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <IconButton
            color={"secondary"}
            onClick={() => setReplyOpen((o) => !o)}
            aria-label={t("comments.reply", "Reply")}
            aria-expanded={replyOpen}
          >
            <ReplyRounded />
          </IconButton>
          {comment.author && comment.author?.username === profile?.username && (
            <IconButton
              color={"error"}
              aria-label={t("comments.delete", "Delete comment")}
              onClick={() => deleteComment(comment.comment_id)}
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
                replyToComment(comment.comment_id, content)
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
