import React, { PropsWithChildren, useEffect } from "react"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
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

export function Page(
  props: PropsWithChildren<{
    title?: string | null
    canonUrl?: string
    dontUseDefaultCanonUrl?: boolean
  }>,
) {
  // Set the bare page title through Unhead. The " - SC Market" suffix is added
  // by the global idempotent titleTemplate in index.tsx, so we must NOT append
  // it here. Passing "" lets that template emit the bare brand. This overrides
  // the low-priority route fallback from usePageTitle.
  useHead({ title: props.title ?? "" })

  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    CURRENT_CUSTOM_ORG!,
    { skip: !CURRENT_CUSTOM_ORG },
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

  if (error) {
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

  return CURRENT_CUSTOM_ORG && customOrgData ? (
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
