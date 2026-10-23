import React from "react"
import { useShowDetailPage } from "../../hooks/layout/useDetailGate"
import { WikiShipBrowser } from "./WikiShipBrowser"
import { WikiShipDetail } from "./WikiShipDetail"

export function WikiShipDetailGate() {
  const showDetailPage = useShowDetailPage()
  if (showDetailPage) return <WikiShipDetail />

  return <WikiShipBrowser />
}
