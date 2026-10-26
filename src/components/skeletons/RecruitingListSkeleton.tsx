import React, { ReactNode } from "react"
import {
  Box,
  Divider,
  FormHelperText,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { SidebarPageLayout } from "../layout/SidebarPageLayout"
import { recruitingSeoText } from "../../seo/hubHeads"
import { ScOrgsNote } from "../../features/recruiting/components/ScOrgsNote"
import { RecruitingPostSkeleton } from "./RecruitingPostSkeleton"

/** Cards shown while recruiting posts load (enough to keep the footer out of view). */
export const RECRUITING_LIST_SKELETON_COUNT = 10

/** The /recruiting list's placeholder cards. */
export function RecruitingPostListSkeleton() {
  return (
    <>
      {Array.from({ length: RECRUITING_LIST_SKELETON_COUNT }).map((_, i) => (
        <RecruitingPostSkeleton key={i} />
      ))}
    </>
  )
}

/**
 * The content column of /recruiting: the SC Orgs note, the post cards (or
 * their skeletons) and the pagination. Shared by the page and its route
 * skeleton so both have the same structure and spacing.
 */
export function RecruitingListFrame(props: {
  children: ReactNode
  pagination: ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <ScOrgsNote sx={{ px: { xs: 1, md: 0 } }} />
        </Grid>
        {props.children}
      </Grid>
      <Divider light sx={{ mt: 2 }} />
      {props.pagination}
    </>
  )
}

/** A filter field's outline: 56px TextFields, 40px for the small language filter. */
function FieldSkeleton(props: { small?: boolean }) {
  return <Skeleton variant="rounded" height={props.small ? 40 : 56} />
}

/**
 * The recruiting filters sidebar (RecruitingSidebar) before the page loads:
 * the same Paper, padding and grid, the static section labels, and a
 * placeholder per field. On phones the filters are a bottom sheet, so there
 * is nothing in the page flow.
 */
export function RecruitingSidebarSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  if (isMobile) return null

  const label = (text: string) => (
    <Grid item xs={12}>
      <Typography variant={"subtitle2"} fontWeight={"bold"}>
        {text}
      </Typography>
    </Grid>
  )

  return (
    <Paper
      sx={{
        position: "sticky",
        top: "calc(64px + 16px)",
        maxHeight: "calc(100vh - 64px - 32px)",
        height: "fit-content",
        width: 300,
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <Box sx={{ width: "100%", padding: theme.spacing(2) }}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12}>
            <FieldSkeleton />
          </Grid>
          {label(t("recruiting_sidebar.sorting"))}
          <Grid item xs={12}>
            <FieldSkeleton />
          </Grid>
          {label(t("recruiting_sidebar.filtering"))}
          <Grid item xs={12}>
            <FieldSkeleton small />
            <FormHelperText sx={{ mx: "14px", mt: "4px" }}>
              {t(
                "search.languageFilter.helperText",
                "Show results from sellers who support any of these languages",
              )}
            </FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <FieldSkeleton />
          </Grid>
          {label(t("recruiting_sidebar.min_rating"))}
          <Grid item xs={12}>
            <Skeleton variant="rounded" width={150} height={37} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

/**
 * Route skeleton for /recruiting: the page's own SidebarPageLayout (header,
 * filters sidebar, content column) with the in-page loading state.
 */
export function RecruitingListSkeleton() {
  const { t } = useTranslation()
  const seo = recruitingSeoText()
  return (
    <SidebarPageLayout
      title={seo.title}
      description={seo.description}
      breadcrumbs={[{ label: t("recruiting_orgs") }]}
      showOrgInBreadcrumbs={true}
      headerTitle={t("recruiting_orgs")}
      isLoading
      sidebar={<RecruitingSidebarSkeleton />}
    >
      <RecruitingListFrame pagination={<Box sx={{ mt: 2, height: 52 }} />}>
        <RecruitingPostListSkeleton />
      </RecruitingListFrame>
    </SidebarPageLayout>
  )
}
