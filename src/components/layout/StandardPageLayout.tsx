import React, { ReactElement, ReactNode, useMemo } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Grid, GridProps, Skeleton } from "@mui/material"
import { Helmet } from "@unhead/react/helmet"
import { Page } from "../metadata/Page"
import { PageBreadcrumbs } from "../navigation/PageBreadcrumbs"
import { ContainerGrid } from "./ContainerGrid"
import { HeaderTitle } from "../typography/HeaderTitle"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
  isForbiddenError,
  getErrorMessage,
} from "../../util/errorHandling"
import { ErrorPage } from "../../pages/errors/ErrorPage"
import { ForbiddenPage } from "../../pages/errors/ForbiddenPage"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { SerializedError } from "@reduxjs/toolkit"
import { useSession } from "../../hooks/login/useSession"
import { PATHS, ORG_PATHS } from "../../routes/paths"
import { layoutDescription } from "../../seo/pageHead"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

export interface StandardPageLayoutProps {
  // Metadata
  title?: string | null
  description?: string
  canonicalUrl?: string
  dontUseDefaultCanonUrl?: boolean

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[]
  showOrgInBreadcrumbs?: boolean

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
  ContainerProps?: Omit<
    React.ComponentProps<typeof ContainerGrid>,
    | "sidebarOpen"
    | "sidebarWidth"
    | "noFooter"
    | "noSidebar"
    | "GridProps"
    | "noTopSpacer"
    | "noMobilePadding"
    | "maxWidth"
    | "children"
  >
}

export function StandardPageLayout(
  props: StandardPageLayoutProps,
): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const { profile } = useSession()
  const location = useLocation()
  const primaryContractor = profile?.contractors?.[0]

  const {
    title,
    description,
    canonicalUrl,
    dontUseDefaultCanonUrl,
    breadcrumbs,
    showOrgInBreadcrumbs = false,
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

  // Inject primary contractor into breadcrumbs if it exists and is enabled
  const enhancedBreadcrumbs = useMemo(() => {
    if (!breadcrumbs || !primaryContractor || !showOrgInBreadcrumbs)
      return breadcrumbs

    // Insert org after first breadcrumb (home)
    return [
      breadcrumbs[0],
      {
        label: primaryContractor.name || primaryContractor.spectrum_id,
        href: ORG_PATHS.profile(primaryContractor.spectrum_id),
      },
      ...breadcrumbs.slice(1),
    ]
  }, [breadcrumbs, primaryContractor, showOrgInBreadcrumbs])

  // Handle 404 errors
  if (
    shouldRedirectTo404(
      error as FetchBaseQueryError | SerializedError | undefined,
    )
  ) {
    return <Navigate to="/404" />
  }

  // Handle 403 errors — redirect to login if not authenticated, show forbidden page otherwise
  if (
    isForbiddenError(error as FetchBaseQueryError | SerializedError | undefined)
  ) {
    const message = getErrorMessage(
      error as FetchBaseQueryError | SerializedError | undefined,
    )
    if (!profile) {
      const redirectUrl = encodeURIComponent(
        location.pathname + location.search,
      )
      return <Navigate to={`${PATHS.login}?redirect=${redirectUrl}`} />
    }
    return <ForbiddenPage message={message} />
  }

  // Handle server errors
  if (
    shouldShowErrorPage(
      error as FetchBaseQueryError | SerializedError | undefined,
    )
  ) {
    console.error("[StandardPageLayout] Page error – showing error page", {
      path: location.pathname,
      title: title ?? undefined,
      error,
    })
    return <ErrorPage />
  }

  return (
    <Page
      title={title}
      loading={isLoading}
      canonUrl={canonicalUrl}
      dontUseDefaultCanonUrl={dontUseDefaultCanonUrl}
    >
      <Helmet>
        <meta
          name="description"
          content={layoutDescription(title, description)}
        />
      </Helmet>
      <ContainerGrid
        sidebarOpen={sidebarOpen}
        sidebarWidth={sidebarWidth}
        maxWidth={
          maxWidth as "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | false
        }
        noFooter={noFooter}
        noSidebar={noSidebar}
        noMobilePadding={noMobilePadding}
        noTopSpacer={noTopSpacer}
        GridProps={GridProps}
        {...ContainerProps}
      >
        {/* Breadcrumbs */}
        {enhancedBreadcrumbs && enhancedBreadcrumbs.length > 0 && (
          <Grid item xs={12}>
            <PageBreadcrumbs items={enhancedBreadcrumbs} />
          </Grid>
        )}

        {/* Header with title and actions */}
        {(headerTitle || headerActions) && (
          <PageHeaderRow title={headerTitle} actions={headerActions} />
        )}

        {/* Content or skeleton */}
        {isLoading && skeleton ? skeleton : children}
      </ContainerGrid>
    </Page>
  )
}

/** StandardPageLayout's title + actions row. */
export function PageHeaderRow({
  title,
  actions,
}: {
  title?: ReactNode
  actions?: ReactNode
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid
      item
      container
      justifyContent="space-between"
      spacing={theme.layoutSpacing?.layout ?? 1}
      xs={12}
    >
      {title && (
        <HeaderTitle md={7} lg={7} xl={7}>
          {title}
        </HeaderTitle>
      )}

      {actions && <Grid item>{actions}</Grid>}
    </Grid>
  )
}

/**
 * The header row of a page whose title only exists once its data loads
 * (e.g. a listing's name): a title-sized placeholder in the same row, for
 * the page's `skeleton`, so the content below doesn't drop when it arrives.
 */
export function PageHeaderRowSkeleton({
  width = "50%",
}: {
  width?: string | number
}) {
  return <PageHeaderRow title={<Skeleton variant="text" width={width} />} />
}
