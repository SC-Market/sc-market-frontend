import { Button, Grid, Link, TextField, Typography } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Section } from "../../components/paper/Section"
import { RecruitingPost } from "../../features/recruiting/api/recruitingApi"
import { useSubmitRecruitingPost } from "../../features/recruiting/hooks/useSubmitRecruitingPost"
import { useSelectedOrg } from "../../hooks/login/useSelectedOrg"
import throttle from "lodash/throttle"
import { RecruitingPostView } from "./RecruitingPostView"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { MarkdownEditor } from "../../components/markdown/Markdown.lazy"
import { useTranslation } from "react-i18next"
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

  // A new post is for the org selected in the sidebar (the same org that
  // /recruiting/post/create checks Manage Recruiting in); an edit keeps its org.
  const { org: selectedOrg } = useSelectedOrg()
  const contractor = post?.contractor ?? selectedOrg

  const submit = useSubmitRecruitingPost(post)
  const submitPost = useCallback(async () => {
    await submit(state, contractor?.spectrum_id)
    return false
  }, [submit, state, contractor])

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

  const fullPost: RecruitingPost | null = useMemo(
    () =>
      contractor
        ? {
            ...stateBuffer,
            post_id: "",
            contractor,
            timestamp: Date.now(),
            comments: [],
            upvotes: 25,
            downvotes: 4,
          }
        : null,
    [stateBuffer, contractor],
  )

  return (
    <>
      {/*TODO: Make it only update render every second or so*/}
      {fullPost && <RecruitingPostView post={fullPost} />}
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
          {contractor && (
            <Typography variant={"body2"} color={"text.secondary"}>
              {t("recruiting_post.posting_for", "Posting for {{org}}", {
                org: contractor.name,
              })}
            </Typography>
          )}
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
          type="submit"
          onClick={submitPost}
          disabled={!contractor}
        >
          {t("recruiting_post.submit")}
        </Button>
      </Grid>
    </>
  )
}
