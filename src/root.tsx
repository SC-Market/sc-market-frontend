/**
 * Root route (React Router framework mode, SPA: react-router.config.ts).
 *
 * The document itself is static: src/document/document.html holds <head> (meta tags,
 * fonts, the pre-theme and asset-reload guard scripts) and entry.server.tsx
 * renders the React tree into its <div id="root">, which is also what
 * entry.client.tsx hydrates. So Layout here is only the part of the page
 * React owns: the route tree plus <Scripts />.
 *
 * Deliberately tiny: the root's component and everything else of the app
 * shell come from src/app/shell.ts, which entry.client.tsx provides, so the
 * shell is bundled with the client entry (one chunk graph, like the old
 * index chunk) instead of being split across the root and the entry.
 *
 * At build time React Router renders this root on Node (with
 * HydrateFallback in place of the routes) to produce index.html.
 */
import type { ReactNode } from "react"
import { Scripts } from "react-router-dom"
import "./fonts.css"
import "./index.css"
import { shellComponent } from "./routes/shell"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* data-cfasync="false": see src/document/cfasync.ts (Rocket Loader). */}
      <Scripts data-cfasync="false" />
    </>
  )
}

/**
 * Shown by React Router until the first page's route modules and loaders
 * are ready, and rendered into index.html at build time. Empty, like the
 * old <div id="root"></div>: the app shell appears as soon as the app runs.
 */
export function HydrateFallback() {
  return null
}

export default shellComponent("App")
