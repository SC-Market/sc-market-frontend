import React from "react"
import { useShowDetailPage } from "../../hooks/layout/useDetailGate"
import { MiningPage } from "./MiningPage"
import { MiningOreDetailPage } from "./MiningOreDetailPage"

export function MiningOreDetailGate() {
  const showDetailPage = useShowDetailPage()
  if (showDetailPage) return <MiningOreDetailPage />
  // Desktop: render the full mining page — the ore browser reads :name from URL and auto-opens modal
  return <MiningPage />
}
