import React, { ReactElement, ReactNode, useMemo } from "react"
import { Navigate } from "react-router-dom"
import { Page } from "../metadata/Page"
import { PageBreadcrumbs } from "../navigation/PageBreadcrumbs"
import { OpenLayout } from "./ContainerGrid"
import {
  shouldRedirectTo404,
  shouldShowErrorPage,
} from "../../util/errorHandling"
import { ErrorPage } from "../../pages/errors/ErrorPage"
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { SerializedError } from "@reduxjs/toolkit"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

export interface BannerPageLayoutProps {
  // Metadata
  title?: string | null
  canonicalUrl?: string
  dontUseDefaultCanonUrl?: boolean

  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[]
  showOrgInBreadcrumbs?: boolean

  // Layout configuration
  sidebarOpen?: boolean
  noFooter?: boolean
  noSidebar?: boolean
  noMobilePadding?: boolean

  // Content
  children: ReactNode

  // Loading and error states
  isLoading?: boolean
  error?: FetchBaseQueryError | SerializedError | unknown
  skeleton?: ReactNode
}

/**
 * BannerPageLayout - Layout for pages with custom banner/header designs
 *
 * Uses OpenLayout instead of ContainerGrid to allow for full-width banner areas
 * with custom positioning (like profile banners, org banners).
 *
 * This layout is appropriate for:
 * - Profile pages with banner images
 * - Organization pages with banner images
 * - Landing pages with hero sections
 * - Any page requiring full-width header content
 *
 * For standard pages with consistent container widths, use StandardPageLayout instead.
 *
 * Requirements: 1.1, 1.2, 2.1, 2.2, 7.1, 7.2, 10.1, 10.2
 */
export function BannerPageLayout(props: BannerPageLayoutProps): ReactElement {
  const [currentOrg] = useCurrentOrg()
  
  const {
    title,
    canonicalUrl,
    dontUseDefaultCanonUrl,
    breadcrumbs,
    showOrgInBreadcrumbs = false,
    sidebarOpen = true,
    noFooter = false,
    noSidebar = false,
    noMobilePadding = false,
    children,
    isLoading = false,
    error,
    skeleton,
  } = props

  // Inject currentOrg into breadcrumbs if it exists and is enabled
  const enhancedBreadcrumbs = useMemo(() => {
    if (!breadcrumbs || !currentOrg || !showOrgInBreadcrumbs) return breadcrumbs
    
    // Insert org after first breadcrumb (home)
    return [
      breadcrumbs[0],
      {
        label: currentOrg.name || currentOrg.spectrum_id,
        href: `/contractor/${currentOrg.spectrum_id}`,
      },
      ...breadcrumbs.slice(1),
    ]
  }, [breadcrumbs, currentOrg, showOrgInBreadcrumbs])

  // Handle 404 errors
  if (
    shouldRedirectTo404(
      error as FetchBaseQueryError | SerializedError | undefined,
    )
  ) {
    return <Navigate to="/404" />
  }

  // Handle server errors
  if (
    shouldShowErrorPage(
      error as FetchBaseQueryError | SerializedError | undefined,
    )
  ) {
    return <ErrorPage />
  }

  return (
    <Page
      title={title}
      canonUrl={canonicalUrl}
      dontUseDefaultCanonUrl={dontUseDefaultCanonUrl}
    >
      <OpenLayout
        sidebarOpen={sidebarOpen}
        noFooter={noFooter}
        noSidebar={noSidebar}
        noMobilePadding={noMobilePadding}
      >
        {/* Breadcrumbs - only render if provided and not loading */}
        {!isLoading && enhancedBreadcrumbs && enhancedBreadcrumbs.length > 0 && (
          <PageBreadcrumbs
            items={enhancedBreadcrumbs}
            MuiBreadcrumbsProps={{
              sx: {
                mb: 0,
              },
            }}
          />
        )}

        {/* Content or skeleton */}
        {isLoading && skeleton ? skeleton : children}
      </OpenLayout>
    </Page>
  )
}
