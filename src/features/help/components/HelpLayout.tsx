/**
 * Page frame for Help & Guides and About. On a white-label org domain the
 * guides aren't rendered: the visitor is sent to the same page on the
 * official site (owner decision, design doc §16).
 */
import React, { ReactNode, useEffect } from "react"
import { Box, Breadcrumbs, Grid, Link, Typography } from "@mui/material"
import { Link as RouterLink, useLocation } from "react-router-dom"
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded"
import {
  StandardPageLayout,
  type BreadcrumbItem,
} from "../../../components/layout/StandardPageLayout"
import { SeoHead } from "../../../seo/SeoHead"
import { headDescription, type PageHead } from "../../../seo/pageHead"
import { isOfficialSite, officialHelpUrl } from "../links"
import { GuidesDirectory, GuidesDirectoryToggle } from "./GuidesDirectory"

export function HelpLayout(props: {
  head: PageHead | null
  /** Site-relative canonical path. */
  path: string
  headerTitle: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  /** The page's content is still loading (page-ready signal on <main>). */
  loading?: boolean
  children: ReactNode
}) {
  const location = useLocation()
  const official = isOfficialSite()

  useEffect(() => {
    if (!official) {
      window.location.replace(officialHelpUrl(location.pathname + location.hash))
    }
  }, [official, location.pathname, location.hash])

  if (!official) return null

  return (
    <StandardPageLayout
      title={props.head?.title}
      description={props.head ? headDescription(props.head) : undefined}
      canonicalUrl={props.path}
      headerTitle={props.headerTitle}
      isLoading={props.loading}
      maxWidth="lg"
    >
      {props.head && <SeoHead head={props.head} />}
      {/* Visual breadcrumbs only: the page head already carries the full
          BreadcrumbList (SC Market › Help & Guides › …), and the layout's
          own breadcrumbs would emit a second, shorter one. */}
      {props.breadcrumbs && props.breadcrumbs.length > 1 && (
        <Grid item xs={12} sx={{ order: -1 }}>
          <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />}>
            {props.breadcrumbs.map((crumb) =>
              crumb.href ? (
                <Link key={crumb.label} component={RouterLink} to={crumb.href} color="secondary" underline="hover">
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} color="text.primary">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        </Grid>
      )}
      {/* Directory of every guide: sticky column on desktop, a toggle on mobile. */}
      <Grid item xs={12} sx={{ display: { md: "none" } }}>
        <GuidesDirectoryToggle />
      </Grid>
      <Grid item md={3} sx={{ display: { xs: "none", md: "block" } }}>
        <GuidesDirectory />
      </Grid>
      <Grid item xs={12} md={9}>
        <Grid container spacing={2}>
          {props.children}
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}

/** "Updated Oct 25, 2026 · Khuzdul" (dates are UTC calendar days). */
export function UpdatedStamp({ updated, author }: { updated: string; author: string }) {
  const date = new Date(`${updated}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Updated <time dateTime={updated}>{date}</time> · {author}
      </Typography>
    </Box>
  )
}
