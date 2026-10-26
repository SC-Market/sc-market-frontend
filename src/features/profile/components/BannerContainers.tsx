import React, { useState, useEffect } from "react"
import { Box, Paper } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import type { Contractor } from "../../contractor/domain/types"
import { ExtendedTheme, bannerFadeGradient } from "../../../hooks/styles/Theme"

/**
 * Banner heights of the profile / org / shop pages. The page header below is
 * pulled up over the banner by BANNER_OVERLAP. Their skeletons use the same
 * numbers so the header lands in the same place.
 */
export const BANNER_HEIGHT = { dark: 500, light: 250 } as const
export const BANNER_OVERLAP = { dark: 450, light: 200 } as const

export function LightBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (profile.banner) {
      const img = new Image()
      img.src = profile.banner
      img.onload = () => setImageLoaded(true)
    }
  }, [profile.banner])

  return (
    <Paper
      sx={{
        height: BANNER_HEIGHT.light,
        background: imageLoaded
          ? `url(${profile.banner})`
          : theme.palette.background.paper,
        backgroundPosition: "center",
        backgroundSize: "cover",
        borderRadius: 0,
        position: "relative",
        padding: 3,
        transition: "background 0.3s ease-in-out",
      }}
    >
      {props.children}
    </Paper>
  )
}

export function DarkBannerContainer(props: {
  children?: React.ReactNode
  profile: User | Contractor
}) {
  const { profile } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (profile.banner) {
      const img = new Image()
      img.src = profile.banner
      img.onload = () => setImageLoaded(true)
    }
  }, [profile.banner])

  return (
    <Paper
      sx={{
        height: BANNER_HEIGHT.dark,
        background: imageLoaded
          ? `url(${profile.banner})`
          : theme.palette.background.paper,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 0,
        position: "relative",
        padding: 3,
        transition: "background 0.3s ease-in-out",
      }}
    >
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          height: BANNER_HEIGHT.dark,
          top: 0,
          left: 0,
          background: bannerFadeGradient(theme),
        }}
      />
      {props.children}
    </Paper>
  )
}
