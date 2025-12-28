import React, { PropsWithChildren, useEffect } from "react"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Helmet } from "react-helmet"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { FRONTEND_URL } from "../../util/constants"
import { CircularProgress } from "@mui/material"
import { Stack } from "@mui/system"
import {
  Navigate,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router-dom"

export function Page(
  props: PropsWithChildren<{
    title?: string | null
    canonUrl?: string
    dontUseDefaultCanonUrl?: boolean
  }>,
) {
  useEffect(() => {
    document.title = props.title ? `${props.title} - SC Market` : "SC Market"
  }, [props.title])

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
      navigate(props.canonUrl)
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
  return (
    <Stack width={"100%"} spacing={2}>
      <CircularProgress />
    </Stack>
  )
}
