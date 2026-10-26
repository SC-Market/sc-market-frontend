import React, { PropsWithChildren, useEffect } from "react"
import { useCustomDomain } from "../../hooks/contractor/CustomDomain"
import { Helmet } from "@unhead/react/helmet"
import { useHead } from "@unhead/react"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { FRONTEND_URL } from "../../util/constants"
import { CircularProgress } from "@mui/material"
import { Stack } from "@mui/system"
import {
  Navigate,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { usePageReady } from "./PageReady"
import { isChunkLoadError } from "../../util/chunkLoadError"

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

  const backupCanonUrl = location.pathname

  // A route error moves to /error?message=…&target=…, EXCEPT a failed chunk
  // load (stale build after a deploy). That one renders in place: the URL stays
  // on the page itself, so a refresh loads the new build and works. Moving it
  // to /error baked the message into the URL, and every later refresh (even a
  // hard one) re-showed the old error from the query string.
  if (error && !isChunkLoadError(error)) {
    return (
      <Navigate
        to={
          "/error?" +
          new URLSearchParams([
            ["message", error.toString()],
            ["target", location.pathname],
          ]).toString()
        }
      />
    )
  }

  return customOrg && customOrgData ? (
    <>
      <Helmet>
        <link rel="icon" type="image/png" href={customOrgData.avatar} />
      </Helmet>
      {props.children}
    </>
  ) : (
    <>
      <Helmet>
        {(props.canonUrl || !props.dontUseDefaultCanonUrl) && (
          <link
            rel="canonical"
            href={`${FRONTEND_URL}${props.canonUrl || backupCanonUrl}`}
          />
        )}
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
