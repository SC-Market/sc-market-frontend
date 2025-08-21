import React, { useState } from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import {
  RecruitingPost,
  useRecruitingCommentOnPostMutation,
  useRecruitingGetPostByIDQuery,
  useRecruitingGetPostByOrgQuery,
  useRecruitingGetPostCommentsByIDQuery,
} from "../../store/recruiting"
import {
  RecruitingPostSkeleton,
  RecruitingPostView,
} from "../../views/recruiting/RecruitingPostView"
import { Navigate, useParams } from "react-router-dom"
import { CommentTree } from "../../views/comments/CommentTree"
import { Box, Button, Grid, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

export function PostCommentArea(props: { post: RecruitingPost }) {
  const { post } = props
  const [submitCommentPost] = useRecruitingCommentOnPostMutation()
  const [content, setContent] = useState("")
  const { data: comments } = useRecruitingGetPostCommentsByIDQuery(post.post_id)
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

export function RecruitingPostArea(props: { spectrum_id: string }) {
  const { data: post } = useRecruitingGetPostByOrgQuery(props.spectrum_id)

  return (
    <>
      {post ? <RecruitingPostView post={post} /> : <RecruitingPostSkeleton />}
      {post && <PostCommentArea post={post} />}
    </>
  )
}

export function RecruitingPostPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const { t } = useTranslation()
  const { data: post, error, isError } = useRecruitingGetPostByIDQuery(post_id!)

  return (
    <Page title={t("recruiting_post.page.createPost")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        {shouldRedirectTo404(error) && <Navigate to={"/404"} />}
        {shouldShowErrorPage(error) && <ErrorPage />}
        {post ? <RecruitingPostView post={post} /> : <RecruitingPostSkeleton />}
        {post && <PostCommentArea post={post} />}
      </ContainerGrid>
    </Page>
  )
}
