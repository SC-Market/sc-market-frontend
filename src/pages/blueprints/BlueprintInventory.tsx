/**
 * BlueprintInventory — redirects to BlueprintBrowser with owned=true.
 * The browser handles all search, filters, list/grid, etc.
 */

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export function BlueprintInventory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set("owned", "true")
    navigate(`/blueprints?${params.toString()}`, { replace: true })
  }, [])

  return null
}
