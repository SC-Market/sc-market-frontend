import React from "react"
import { Box, Grid, Skeleton, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { DetailPageLayout } from "../layout/DetailPageLayout"
import { FormPageLayout } from "../layout/FormPageLayout"
import { Section } from "../paper/Section"
import { HelpLink } from "../../features/help/components/HelpLink"
import { ScOrgsNote } from "../../features/recruiting/components/ScOrgsNote"
import { RecruitingPostViewSkeleton } from "./RecruitingPostViewSkeleton"

/**
 * Loading states of the recruiting post pages, shared by each page and its
 * route skeleton (routeSkeletonMap) so the two always have the same layout:
 * the post page (/recruiting/post/:id) and the create / update forms.
 */

/** Breadcrumb label for a post whose title hasn't loaded yet. */
export const RECRUITING_POST_LOADING_LABEL = "…"

/** The post title in the page header while the post loads. */
export function RecruitingPostTitleSkeleton() {
  return <Skeleton variant="text" width="60%" />
}

/** A post page's body while it loads: the post card and the reply field. */
export function RecruitingPostBodySkeleton() {
  return (
    <>
      <RecruitingPostViewSkeleton />
      <Grid item xs={12}>
        <Box sx={{ marginTop: 2 }}>
          <Skeleton variant="rounded" height={56} />
        </Box>
      </Grid>
    </>
  )
}

/** Route skeleton for /recruiting/post/:post_id (RecruitingPostPage). */
export function RecruitingPostPageSkeleton() {
  const { t } = useTranslation()
  return (
    <DetailPageLayout
      title={t("recruiting.title", "Recruiting")}
      breadcrumbs={[
        { label: t("recruiting.title", "Recruiting"), href: "/recruiting" },
        { label: RECRUITING_POST_LOADING_LABEL },
      ]}
      headerTitle={<RecruitingPostTitleSkeleton />}
      isLoading
      skeleton={<RecruitingPostBodySkeleton />}
      sidebarOpen={true}
      maxWidth="md"
    >
      {null}
    </DetailPageLayout>
  )
}

/**
 * The create / update form (CreateRecruitingPost) while it loads: the live
 * preview card, the About / Title / Description section and Submit. A new
 * post's preview has no title or text yet (`empty`).
 */
export function RecruitingPostFormSkeleton(props: { empty?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      <RecruitingPostViewSkeleton empty={props.empty} />
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
          <Typography variant={"body2"}>
            <Skeleton variant="text" width="70%" />
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
            <Skeleton variant="rounded" height={56} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant={"body2"}>
              {t("recruiting_post.markdown_info") + " "}
              {t("recruiting_post.markdown_link")}{" "}
              {t("recruiting_post.markdown_info_end")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={354} />
          </Grid>
        </Grid>
      </Section>
      <Grid item xs={12} container justifyContent={"right"}>
        <Skeleton variant="rounded" width={103} height={42} />
      </Grid>
    </>
  )
}

/** /recruiting/post/create's content above the form: the SC Orgs note. */
export function CreateRecruitingPostIntro() {
  return (
    <Grid item xs={12}>
      <ScOrgsNote />
    </Grid>
  )
}

/** Route skeleton for /recruiting/post/create (CreateRecruitingPostPage). */
export function CreateRecruitingPostSkeleton() {
  const { t } = useTranslation()
  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.createPost")}
      title={t("recruiting_post.page.createPost")}
      breadcrumbs={[
        { label: t("recruiting.title", "Recruiting"), href: "/recruiting" },
        { label: t("recruiting_post.page.createPost") },
      ]}
      showOrgInBreadcrumbs={true}
      sidebarOpen={true}
      maxWidth="md"
      headerActions={<HelpLink guide="orgRecruiting" />}
      isLoading
    >
      <CreateRecruitingPostIntro />
      <RecruitingPostFormSkeleton empty />
    </FormPageLayout>
  )
}

/** Route skeleton for /recruiting/post/:post_id/update (UpdateRecruitingPostPage). */
export function UpdateRecruitingPostSkeleton() {
  const { t } = useTranslation()
  return (
    <FormPageLayout
      formTitle={t("recruiting_post.page.updatePost")}
      title={t("recruiting_post.page.updatePost")}
      isLoading
      skeleton={<RecruitingPostFormSkeleton />}
      sidebarOpen={true}
      maxWidth="md"
    >
      {null}
    </FormPageLayout>
  )
}
