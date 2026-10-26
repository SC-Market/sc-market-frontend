/**
 * The edge bridge (src/bridge/render.ts) appends a plain-HTML summary of the
 * page to <div id="root"> for crawlers that don't run JavaScript. It is not
 * part of the React tree, so it is removed before hydration (React would
 * otherwise report a hydration mismatch and re-render the whole root).
 */
export const BRIDGE_SUMMARY_ATTRIBUTE = "data-bridge-summary"

export function removeBridgeSummary(container: Element): void {
  for (const node of Array.from(
    container.querySelectorAll(`:scope > [${BRIDGE_SUMMARY_ATTRIBUTE}]`),
  )) {
    node.remove()
  }
}
