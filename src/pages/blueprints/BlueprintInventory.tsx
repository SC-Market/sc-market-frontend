/**
 * BlueprintInventory — redirects to BlueprintBrowser with owned=true and inventory flag.
 */

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { GAME_DATA_PATHS } from "../../routes/paths"

export function BlueprintInventory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set("owned", "true")
    params.set("inventory", "true")
    navigate(`${GAME_DATA_PATHS.blueprints}?${params.toString()}`, {
      replace: true,
    })
  }, [])

  return null
}
