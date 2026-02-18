import React, { useState } from "react"
import { Box, Button, Grid, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  RecruitingPost,
  useRecruitingCommentOnPostMutation,
} from "../../../store/recruiting"
import { CommentTree } from "../../../views/comments/CommentTree"
import { Comment } from "../../../store/recruiting"

interface PostCommentAreaProps {
  post: RecruitingPost
  comments: Comment[]
}

export function PostCommentArea(props: PostCommentAreaProps) {
  const { post, comments } = props
  const [submitCommentPost] = useRecruitingCommentOnPostMutation()
  const [content, setContent] = useState("")
  const { t } = useTranslation()

  return (
    <>
      <Grid item xs={12}>
        <Box sx={{ marginTop: 2 }} display={"flex"} alignItems={"center"}>
          <TextField
            fullWidth
            sx={{ marginRight: 2 }}
            value={content}
            label={t("recruiting_post.commentArea.replyToPost")}
            multiline
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setContent(event.target.value)
            }}
          />

          <Button
            onClick={() => {
              submitCommentPost({ content, post_id: post!.post_id })
              setContent("")
            }}
          >
            {t("recruiting_post.commentArea.post")}
          </Button>
        </Box>
      </Grid>

      {(comments || []).map((c, i) => (
        <CommentTree comment={c} post={post} depth={0} key={i} />
      ))}
    </>
  )
}
