/**
 * BlueprintDetailGate — modal on desktop, full page on mobile
 */

import React from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { BlueprintBrowser } from "./BlueprintBrowser"
import { BlueprintDetail } from "./BlueprintDetail"

export function BlueprintDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))

  if (isMobile) return <BlueprintDetail />

  // Desktop: render browser with modal auto-opened (reads :id from URL)
  return <BlueprintBrowser />
}
