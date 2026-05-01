import React from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { MiningPage } from "./MiningPage"
import { MiningOreDetailPage } from "./MiningOreDetailPage"

export function MiningOreDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  if (isMobile) return <MiningOreDetailPage />
  // Desktop: render the full mining page — the ore browser reads :name from URL and auto-opens modal
  return <MiningPage />
}
