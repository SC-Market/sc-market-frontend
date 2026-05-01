import React from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { MiningOreBrowser } from "./MiningOreBrowser"
import { MiningOreDetailPage } from "./MiningOreDetailPage"

export function MiningOreDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  if (isMobile) return <MiningOreDetailPage />
  return <MiningOreBrowser />
}
