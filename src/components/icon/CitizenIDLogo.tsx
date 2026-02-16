import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"

const PROD_LIGHT_LOGO_URL =
  "https://citizenid.space/assets/prod/citizenid-icon-light.png"
const PROD_DARK_LOGO_URL =
  "https://citizenid.space/assets/prod/citizenid-icon-dark.png"

const DEV_LIGHT_LOGO_URL =
  "https://dev.citizenid.space/assets/dev/citizenid-icon-light.png"
const DEV_DARK_LOGO_URL =
  "https://dev.citizenid.space/assets/dev/citizenid-icon-dark.png"

export function CitizenIDLogo(props: { height?: number }) {
  const theme = useTheme()
  const logoHeight = props.height ?? 20
  const useDevAssets = import.meta.env.DEV
  const lightLogo = useDevAssets ? DEV_LIGHT_LOGO_URL : PROD_LIGHT_LOGO_URL
  const darkLogo = useDevAssets ? DEV_DARK_LOGO_URL : PROD_DARK_LOGO_URL
  const logoSrc = theme.palette.mode === "dark" ? lightLogo : darkLogo

  return (
    <Box
      component="img"
      src={logoSrc}
      alt=""
      sx={{
        height: logoHeight,
        width: "auto",
        display: "block",
      }}
    />
  )
}
