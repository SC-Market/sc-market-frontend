import { Button, Grid, Link, TextField, Typography } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  RecruitingPost,
  useRecruitingCreatePostMutation,
  useRecruitingUpdatePostMutation,
} from "../../store/recruiting"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import throttle from "lodash/throttle"
import { RecruitingPostView } from "./RecruitingPostView"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { MarkdownEditor } from "../../components/markdown/Markdown"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export interface RecruitingPostState {
  title: string
  body: string
}

export function CreateRecruitingPost(props: { post?: RecruitingPost }) {
  const { post } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [state, setState] = React.useState<RecruitingPostState>({
    title: "",
    body: "",
  })

  useEffect(() => {
    if (post) {
      setState({
        title: post.title,
        body: post.body,
      })
    }
  }, [post])

  const issueAlert = useAlertHook()
  const [contractor] = useCurrentOrg()

  const [
    createPost, // This is the mutation trigger
  ] = useRecruitingCreatePostMutation()
  const [
    updatePost, // This is the mutation trigger
  ] = useRecruitingUpdatePostMutation()

  const navigate = useNavigate()

  const submitPost = useCallback(
    async (event: any) => {
      let request
      if (!post) {
        request = createPost({
          ...state,
          contractor: contractor!.spectrum_id,
        })
      } else {
        request = updatePost({
          body: state,
          post_id: post.post_id,
        })
      }

      request
        .unwrap()
        .then((res) => {
          issueAlert({
            message: t("recruiting_post.alert.submitted"),
            severity: "success",
          })

          navigate(`/recruiting/post/${res.post_id}`)
        })
        .catch(issueAlert)

      return false
    },
    [contractor, createPost, post, issueAlert, state, updatePost, t],
  )

  const [stateBuffer, setStateBuffer] = useState(state)

  const updateStateBuffer = React.useMemo(
    () =>
      throttle(async (s) => {
        setStateBuffer(s)
      }, 2000),
    [setStateBuffer],
  )

  useEffect(() => {
    updateStateBuffer(state)
  }, [state, updateStateBuffer])

  const fullPost: RecruitingPost = useMemo(
    () => ({
      ...stateBuffer,
      post_id: "",
      contractor: contractor!,
      timestamp: Date.now(),
      comments: [],
      upvotes: 25,
      downvotes: 4,
    }),
    [stateBuffer, contractor],
  )

  return (
    <>
      {/*TODO: Make it only update render every second or so*/}
      <RecruitingPostView post={fullPost} />
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("recruiting_post.about")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid item xs={12} lg={12}>
            <TextField
              label={t("recruiting_post.title_required")}
              fullWidth
              id="order-title"
              value={state.title}
              onChange={(event: React.ChangeEvent<{ value: string }>) =>
                setState({ ...state, title: event.target.value })
              }
              color={"secondary"}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant={"body2"}>
              {t("recruiting_post.markdown_info") + " "}
              <Link
                rel="noopener noreferrer"
                target="_blank"
                href={
                  "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
                }
              >
                <UnderlineLink color={"text.secondary"}>
                  {t("recruiting_post.markdown_link")}
                </UnderlineLink>
              </Link>{" "}
              {t("recruiting_post.markdown_info_end")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <MarkdownEditor
              TextFieldProps={{
                label: t("recruiting_post.description_required"),
              }}
              value={state.body}
              onChange={(value: string) => {
                setState({ ...state, body: value })
              }}
              noPreview
            />
          </Grid>
        </Grid>
      </Section>

      <Grid item xs={12} container justifyContent={"right"}>
        <Button
          size={"large"}
          variant="contained"
          color={"secondary"}
          type="submit"
          onClick={submitPost}
        >
          {t("recruiting_post.submit")}
        </Button>
      </Grid>
    </>
  )
}
