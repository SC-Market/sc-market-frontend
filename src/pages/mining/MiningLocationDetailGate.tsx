import React from "react"
import { useShowDetailPage } from "../../hooks/layout/useDetailGate"
import { MiningPage } from "./MiningPage"
import { MiningLocationDetailPage } from "./MiningLocationDetailPage"

export function MiningLocationDetailGate() {
  const showDetailPage = useShowDetailPage()
  if (showDetailPage) return <MiningLocationDetailPage />
  return <MiningPage />
}
