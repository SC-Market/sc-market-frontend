/**
 * BlueprintDetailGate — modal on desktop, full page on mobile and in
 * server/hydration renders (see useShowDetailPage).
 */

import React from "react"
import { useShowDetailPage } from "../../hooks/layout/useDetailGate"
import { BlueprintBrowser } from "./BlueprintBrowser"
import { BlueprintDetail } from "./BlueprintDetail"

export function BlueprintDetailGate() {
  const showDetailPage = useShowDetailPage()
  if (showDetailPage) return <BlueprintDetail />

  // Desktop: render browser with modal auto-opened (reads :id from URL)
  return <BlueprintBrowser />
}
