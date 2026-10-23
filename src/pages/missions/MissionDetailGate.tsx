/**
 * MissionDetailGate — shows MissionSearch with modal on desktop,
 * standalone MissionDetail page on mobile and in server/hydration renders
 * (see useShowDetailPage).
 */

import React from "react"
import { useShowDetailPage } from "../../hooks/layout/useDetailGate"
import { MissionSearch } from "./MissionSearch"
import { MissionDetail } from "./MissionDetail"

export function MissionDetailGate() {
  const showDetailPage = useShowDetailPage()
  if (showDetailPage) return <MissionDetail />

  // Desktop: render the search page — it will read the URL param and open the modal
  return <MissionSearch />
}
