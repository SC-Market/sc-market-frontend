/**
 * MissionDetailGate — shows MissionSearch with modal on desktop,
 * standalone MissionDetail page on mobile.
 */

import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMediaQuery, useTheme } from "@mui/material"
import { MissionSearch } from "./MissionSearch"
import { MissionDetail } from "./MissionDetail"

export function MissionDetailGate() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))

  if (isMobile) {
    return <MissionDetail />
  }

  // Desktop: render the search page — it will read the URL param and open the modal
  return <MissionSearchWithModal />
}

function MissionSearchWithModal() {
  // MissionSearch reads selectedMissionId from URL via this wrapper
  return <MissionSearch />
}
