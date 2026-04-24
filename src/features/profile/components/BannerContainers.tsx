import React, { useState, useEffect } from "react"
import { Box, Paper } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import type { Contractor } from "../../contractor/domain/types"
import { ExtendedTheme, bannerFadeGradient } from "../../../hooks/styles/Theme"

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
        height: 250,
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
        height: 500,
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
          height: 500,
          top: 0,
          left: 0,
          background: bannerFadeGradient(theme),
        }}
      />
      {props.children}
    </Paper>
  )
}
