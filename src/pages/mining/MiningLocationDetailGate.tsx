import React from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { MiningPage } from "./MiningPage"
import { MiningLocationDetailPage } from "./MiningLocationDetailPage"

export function MiningLocationDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  if (isMobile) return <MiningLocationDetailPage />
  return <MiningPage />
}
