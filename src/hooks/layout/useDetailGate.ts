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
 * - Server and hydration renders: the detail page. The desktop modal renders
 *   through a Portal and is closed on the server, so "browser + modal" would
 *   put the browser list in the HTML but none of the entity's content. The
 *   detail page puts the entity in the HTML. After hydration, desktop
 *   switches to the browser + modal it shows today.
 *
 * In the SPA (`createRoot`), `useHydrated()` is `true` from the first
 * render, so this is exactly the old `useMediaQuery(down("lg"))` check.
 */
export function useShowDetailPage(): boolean {
  const belowLg = useBreakpointDown("lg")
  const hydrated = useHydrated()
  return belowLg || !hydrated
}
