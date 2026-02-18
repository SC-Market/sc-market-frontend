import React, { ReactElement, ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { Grid, GridProps } from "@mui/material"
import { Page } from "../metadata/Page"
import { PageBreadcrumbs } from "../navigation/PageBreadcrumbs"
import { ContainerGrid } from "./ContainerGrid"
import { HeaderTitle } from "../typography/HeaderTitle"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../../pages/errors/ErrorPage"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { SerializedError } from "@reduxjs/toolkit"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

export interface StandardPageLayoutProps {
  // Metadata
  title?: string | null
  canonicalUrl?: string
  dontUseDefaultCanonUrl?: boolean

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[]

  // Header
  headerTitle?: ReactNode
  headerActions?: ReactNode

  // Layout configuration
  sidebarOpen?: boolean
  sidebarWidth?: number
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | false
  noFooter?: boolean
  noSidebar?: boolean
  noMobilePadding?: boolean
  noTopSpacer?: boolean

  // Content
  children: ReactNode

  // Loading and error states
  isLoading?: boolean
  error?: FetchBaseQueryError | SerializedError | unknown
  skeleton?: ReactNode

  // Pass-through props for ContainerGrid
  GridProps?: GridProps
  ContainerProps?: Omit<React.ComponentProps<typeof ContainerGrid>, 'sidebarOpen' | 'sidebarWidth' | 'noFooter' | 'noSidebar' | 'GridProps' | 'noTopSpacer' | 'noMobilePadding' | 'maxWidth' | 'children'>
}

export function StandardPageLayout(
  props: StandardPageLayoutProps,
): ReactElement {
  const theme = useTheme<ExtendedTheme>()

  const {
    title,
    canonicalUrl,
    dontUseDefaultCanonUrl,
    breadcrumbs,
    headerTitle,
    headerActions,
    sidebarOpen = true,
    sidebarWidth,
    maxWidth = "lg",
    noFooter = false,
    noSidebar = false,
    noMobilePadding = false,
    noTopSpacer = false,
    children,
    isLoading = false,
    error,
    skeleton,
    GridProps,
    ContainerProps,
  } = props

  // Handle 404 errors
  if (shouldRedirectTo404(error as FetchBaseQueryError | SerializedError | undefined)) {
    return <Navigate to="/404" />
  }

  // Handle server errors
  if (shouldShowErrorPage(error as FetchBaseQueryError | SerializedError | undefined)) {
    return <ErrorPage />
  }

  return (
    <Page
      title={title}
      canonUrl={canonicalUrl}
      dontUseDefaultCanonUrl={dontUseDefaultCanonUrl}
    >
      <ContainerGrid
        sidebarOpen={sidebarOpen}
        sidebarWidth={sidebarWidth}
        maxWidth={maxWidth as any}
        noFooter={noFooter}
        noSidebar={noSidebar}
        noMobilePadding={noMobilePadding}
        noTopSpacer={noTopSpacer}
        GridProps={GridProps}
        {...ContainerProps}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Grid item xs={12}>
            <PageBreadcrumbs items={breadcrumbs} />
          </Grid>
        )}

        {/* Header with title and actions */}
        {(headerTitle || headerActions) && (
          <Grid
            item
            container
            justifyContent="space-between"
            spacing={theme.layoutSpacing?.layout ?? 1}
            xs={12}
          >
            {headerTitle && (
              <HeaderTitle md={7} lg={7} xl={7}>
                {headerTitle}
              </HeaderTitle>
            )}

            {headerActions && <Grid item>{headerActions}</Grid>}
          </Grid>
        )}

        {/* Content or skeleton */}
        {isLoading && skeleton ? skeleton : children}
      </ContainerGrid>
    </Page>
  )
}
