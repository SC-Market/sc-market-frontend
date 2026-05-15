import React from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { WikiShipBrowser } from "./WikiShipBrowser"
import { WikiShipDetail } from "./WikiShipDetail"

export function WikiShipDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))

  if (isMobile) return <WikiShipDetail />

  return <WikiShipBrowser />
}
