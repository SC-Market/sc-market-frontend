import { useState } from "react"
import { useHydrated } from "../ssr/useHydrated"
import { useBreakpointDown } from "./useBreakpoint"

/**
 * For the viewport detail gates (BlueprintDetailGate, MissionDetailGate,
 * MiningOreDetailGate, MiningLocationDetailGate, WikiShipDetailGate):
 * `true` when the gate should render the standalone detail page, `false`
 * when it should render the browser with the detail modal auto-opened.
 *
 * - Below `lg`: the detail page, as before.
 * - `lg` and up: the browser + modal, as before.
 * - Server and hydration renders: the detail page, the one canonical server
 *   render. The desktop modal renders through a Portal and is closed on the
 *   server, so "browser + modal" would put the browser list in the HTML but
 *   none of the entity's content. A gate that hydrates server HTML keeps
 *   the detail page for its lifetime (decided at mount): swapping the
 *   hydrated page for the browser right after would replace what the
 *   visitor is reading (layout shift, refetches).
 * - Mounted after hydration (client navigation, the SPA's createRoot):
 *   exactly the old `useMediaQuery(down("lg"))` check.
 */
export function useShowDetailPage(): boolean {
  const belowLg = useBreakpointDown("lg")
  const hydrated = useHydrated()
  const [hydratingMount] = useState(!hydrated)
  return belowLg || hydratingMount
}
