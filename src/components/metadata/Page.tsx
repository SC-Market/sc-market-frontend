import React, { PropsWithChildren, useEffect } from "react"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import { Helmet } from "@unhead/react/helmet"
import { useHead } from "@unhead/react"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { FRONTEND_URL } from "../../util/constants"
import { CircularProgress } from "@mui/material"
import { Stack } from "@mui/system"
import { useLocation, useNavigate, useRouteError } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { usePageReady } from "./PageReady"
import { isPaginatedPath, queryIndexing } from "../../seo/queryIndexing"
import { ORG_PATHS } from "../../routes/paths"

export function Page(
  props: PropsWithChildren<{
    title?: string | null
    canonUrl?: string
    dontUseDefaultCanonUrl?: boolean
    /**
     * The page's primary data is still loading (its skeleton is showing).
     * Drives the page-ready signal on <main> (`aria-busy` / `data-ready`);
     * see PageReady.tsx and docs/testing-with-mcp.md. Omit for pages with no
     * primary data: they are ready as soon as they mount.
     */
    loading?: boolean
  }>,
) {
  usePageReady(!!props.loading)

  // Set the bare page title through Unhead. The " - SC Market" suffix is added
  // by the global idempotent titleTemplate in src/entry.client.tsx, so we must NOT append
  // it here. Passing "" lets that template emit the bare brand. This overrides
  // the low-priority route fallback from usePageTitle.
  useHead({ title: props.title ?? "" })

  const { customOrg } = useCustomDomain()
  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    customOrg!,
    { skip: !customOrg },
  )

  const location = useLocation()
  const navigate = useNavigate()
  const error = useRouteError()
  useEffect(() => {
    if (import.meta.env.DEV && error) {
      console.error(error)
    }
  }, [error])

  useEffect(() => {
    if (
      props.canonUrl &&
      props.canonUrl != location.pathname + location.search + location.hash
    ) {
      // Only redirect if the current path doesn't already contain the short-slug
      // (avoids infinite redirect loops and race conditions during loading)
      const currentSegment = location.pathname.split("/").pop() || ""
      const canonSegment = props.canonUrl.split("/").pop() || ""
      const isAlreadySlugified = currentSegment.includes("--")
      if (!isAlreadySlugified) {
        navigate(props.canonUrl, { replace: true })
      }
    }
  }, [location.pathname, location.hash, props.canonUrl])

  // Same rules as the edge bridge (src/seo/queryIndexing.ts): `?page=N` of
  // a paginated hub is its own self-canonical page; any other query (search,
  // filters, sort) is a noindex variant whose canonical is the clean URL.
  const indexing = queryIndexing(new URLSearchParams(location.search))
  const pageSuffix =
    indexing.pageNumber && isPaginatedPath(location.pathname)
      ? `?page=${indexing.pageNumber}`
      : ""
  const noindexQuery = indexing.hasQuery && !pageSuffix
  const backupCanonUrl = location.pathname

  // A route error (this Page is inside the route's error element, whose
  // children are the error body) renders IN PLACE: the URL stays on the
  // failed page. It used to move to /error?message=…&target=…, which baked
  // the message into the URL (every later refresh re-showed it) and gave
  // crawlers an /error URL to index. The error body is noindex.

  // An org's white-label subdomain is a copy of sc-market.space pages:
  // their canonical is the sc-market.space page (its home "/" is the org's
  // page there), so link equity and indexing stay on the main site.
  const whiteLabelCanonical =
    props.canonUrl ||
    (backupCanonUrl === "/" && customOrg ? ORG_PATHS.profile(customOrg) : backupCanonUrl)

  return customOrg && customOrgData ? (
    <>
      <Helmet>
        <link rel="icon" type="image/png" href={customOrgData.avatar} />
        {(props.canonUrl || !props.dontUseDefaultCanonUrl) && (
          <link rel="canonical" href={`${FRONTEND_URL}${whiteLabelCanonical}${pageSuffix}`} />
        )}
        {noindexQuery && <meta name="robots" content="noindex" />}
      </Helmet>
      {props.children}
    </>
  ) : (
    <>
      <Helmet>
        {(props.canonUrl || !props.dontUseDefaultCanonUrl) && (
          <link
            rel="canonical"
            href={`${FRONTEND_URL}${props.canonUrl || backupCanonUrl}${pageSuffix}`}
          />
        )}
        {noindexQuery && <meta name="robots" content="noindex" />}
      </Helmet>
      {props.children}
    </>
  )
}

export function PageFallback() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Stack width={"100%"} spacing={theme.layoutSpacing.layout}>
      <CircularProgress />
    </Stack>
  )
}
