/**
 * Where a server render reads this deployment's static files (the content
 * build's /content/bridge/*.json, which the page heads of Help & Guides
 * pages are built from).
 *
 * - On Cloudflare (the bridge and the SSR Pages Function): Pages' ASSETS
 *   binding, passed in per request.
 * - At build time (the prerender, on Node): build/client on disk. That
 *   reader needs node:fs, which must stay out of the server build (it also
 *   runs on Cloudflare), so react-router.config.ts registers it here
 *   (src/prerender/contentSource.node.ts) before React Router prerenders.
 */
export interface ContentSource {
  fetch(input: Request | URL | string): Promise<Response>
}

const BUILD_SOURCE_KEY = "__scmBuildContentSource"

type WithBuildSource = typeof globalThis & {
  [BUILD_SOURCE_KEY]?: ContentSource
}

/** Build time only: the reader for build/client (see above). */
export function registerBuildContentSource(source: ContentSource): void {
  ;(globalThis as WithBuildSource)[BUILD_SOURCE_KEY] = source
}

/** The build-time reader, if this process registered one. */
export function buildContentSource(): ContentSource | undefined {
  return (globalThis as WithBuildSource)[BUILD_SOURCE_KEY]
}
