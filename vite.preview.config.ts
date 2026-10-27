import { existsSync } from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"

/**
 * `vite preview` of a finished deploy directory (dist/, dist-e2e/) as a
 * plain static site, routed like Cloudflare Pages serves it:
 * - a prerendered page (`/wiki/items` → wiki/items/index.html) as itself;
 * - any other app path → the SPA shell (__spa-fallback.html, or index.html
 *   when nothing is prerendered), like public/_redirects.
 * Not vite.config.ts: the React Router plugin there replaces the preview
 * server with its own, which serves build/client instead.
 */
function pagesRouting(): Plugin {
  return {
    name: "sc-market-pages-routing",
    configurePreviewServer(server) {
      const outDir = path.resolve(
        server.config.root,
        server.config.build.outDir,
      )
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url ?? "/", "http://preview.local")
        const pathname = decodeURIComponent(url.pathname)
        if (req.method !== "GET" && req.method !== "HEAD") return next()
        if (path.extname(pathname) !== "") return next()
        const page = path.join(outDir, pathname, "index.html")
        if (page.startsWith(outDir) && existsSync(page)) {
          req.url = `${path.posix.join(pathname, "index.html")}${url.search}`
          return next()
        }
        const fallback = existsSync(path.join(outDir, "__spa-fallback.html"))
          ? "/__spa-fallback.html"
          : "/index.html"
        req.url = `${fallback}${url.search}`
        return next()
      })
    },
  }
}

export default defineConfig({
  appType: "mpa",
  plugins: [pagesRouting()],
})
