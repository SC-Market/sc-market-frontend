/**
 * Page frame for Help & Guides and About. On a white-label org domain the
 * guides aren't rendered: the visitor is sent to the same page on the
 * official site (owner decision, design doc §16).
 */
import React, { ReactNode, useEffect } from "react"
import { Box, Typography } from "@mui/material"
import { useLocation } from "react-router-dom"
import {
  StandardPageLayout,
  type BreadcrumbItem,
} from "../../../components/layout/StandardPageLayout"
import { SeoHead } from "../../../seo/SeoHead"
import { headDescription, type PageHead } from "../../../seo/pageHead"
import { isOfficialSite, officialHelpUrl } from "../links"

export function HelpLayout(props: {
  head: PageHead | null
  /** Site-relative canonical path. */
  path: string
  headerTitle: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  maxWidth?: "md" | "lg"
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
      breadcrumbs={props.breadcrumbs}
      maxWidth={props.maxWidth ?? "md"}
    >
      {props.head && <SeoHead head={props.head} />}
      {props.children}
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
