import React, { PropsWithChildren, useEffect } from "react"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Helmet } from "react-helmet"
import { useGetContractorBySpectrumIDQuery } from "../../store/contractor"
import { FRONTEND_URL } from "../../util/constants"
import { Stack } from "@mui/system"
import {
  Navigate,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import useTheme1 from '@mui/material/styles';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';

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
  const theme = useTheme<ExtendedTheme>()
  return (
    <Stack width={"100%"} spacing={theme.layoutSpacing.layout}>
      <CircularProgress />
    </Stack>
  )
}
