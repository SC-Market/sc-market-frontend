import React, { useState } from "react"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { Page } from "../../components/metadata/Page"
import { PageBreadcrumbs } from "../../components/navigation"
import {
  RecruitingPost,
  useRecruitingCommentOnPostMutation,
  useRecruitingGetPostByIDQuery,
  useRecruitingGetPostByOrgQuery,
  useRecruitingGetPostCommentsByIDQuery,
} from "../../store/recruiting"
import { RecruitingPostView } from "../../views/recruiting/RecruitingPostView"
import { RecruitingPostViewSkeleton } from "../../components/skeletons"
import { Navigate, useParams } from "react-router-dom"
import { CommentTree } from "../../views/comments/CommentTree"
import { useTranslation } from "react-i18next"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../errors/ErrorPage"

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
  const {
    data: post,
    isLoading,
    isFetching,
  } = useRecruitingGetPostByOrgQuery(props.spectrum_id)

  return (
    <>
      {isLoading || isFetching ? (
        <RecruitingPostViewSkeleton />
      ) : post ? (
        <>
          <RecruitingPostView post={post} />
          <PostCommentArea post={post} />
        </>
      ) : null}
    </>
  )
}

export function RecruitingPostPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const { t } = useTranslation()
  const {
    data: post,
    error,
    isLoading,
    isFetching,
  } = useRecruitingGetPostByIDQuery(post_id!)

  return (
    <Page title={t("recruiting_post.page.createPost")}>
      <ContainerGrid maxWidth={"md"} sidebarOpen={true}>
        <Grid item xs={12}>
          <PageBreadcrumbs
            items={[
              {
                label: t("recruiting.title", "Recruiting"),
                href: "/recruiting",
              },
              { label: post?.title || t("recruiting_post.page.createPost") },
            ]}
          />
        </Grid>
        {shouldRedirectTo404(error) && <Navigate to={"/404"} />}
        {shouldShowErrorPage(error) && <ErrorPage />}
        {isLoading || isFetching ? (
          <RecruitingPostViewSkeleton />
        ) : post ? (
          <>
            <RecruitingPostView post={post} />
            <PostCommentArea post={post} />
          </>
        ) : null}
      </ContainerGrid>
    </Page>
  )
}
