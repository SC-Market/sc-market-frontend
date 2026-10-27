/**
 * Prerendered pages ship the RTK Query data their build-time render used
 * (entry.server.tsx), so the browser's first render shows the same thing and
 * hydrates without refetching. Every API slice reads it from this action
 * (createApi's extractRehydrationInfo).
 *
 * Only data that doesn't go stale between deploys is shipped
 * (isPrerenderableQuery): game data. Live data (listings, prices, shops,
 * anything per-user) is fetched in the browser as usual.
 */
import { createAction, type UnknownAction } from "@reduxjs/toolkit"

/** `{ [reducerPath]: apiSliceState }` from the build-time render. */
export type PrerenderedApiState = Record<string, unknown>

export const hydratePrerenderedData = createAction<PrerenderedApiState>(
  "scmarket/hydratePrerenderedData",
)

/** createApi `extractRehydrationInfo` for every slice. */
export function extractPrerenderedApiState(
  action: UnknownAction,
  { reducerPath }: { reducerPath: string },
) {
  if (hydratePrerenderedData.match(action)) {
    // RTK reads the fulfilled queries (and their tags) out of this.
    return action.payload[reducerPath] as never
  }
  return undefined
}

/** The id of the JSON <script> entry.server.tsx writes the data into. */
export const PRERENDERED_DATA_ELEMENT_ID = "scmarket-prerendered-data"

/** What a prerendered page ships next to its HTML. */
export interface PrerenderedData {
  /** RTK Query state for hydratePrerenderedData. */
  api: PrerenderedApiState
  /**
   * The guide/About bodies in the HTML (features/help/content.ts): loaded
   * before hydrating, like the page's chunk.
   */
  contentBodies: string[]
}

/** Read and remove the data script (before hydration). */
export function takePrerenderedData(): PrerenderedData | null {
  const element = document.getElementById(PRERENDERED_DATA_ELEMENT_ID)
  if (!element) return null
  element.remove()
  try {
    return JSON.parse(element.textContent ?? "null") as PrerenderedData
  } catch {
    return null
  }
}
