import { defineConfig } from "vite"

/**
 * `vite preview` of a finished deploy directory (dist/, dist-e2e/) as a
 * plain static site with the SPA fallback, like Cloudflare Pages serves it.
 * Not vite.config.ts: the React Router plugin there replaces the preview
 * server with its own, which serves build/client instead.
 */
export default defineConfig({
  appType: "spa",
})
