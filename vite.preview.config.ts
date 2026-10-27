import { existsSync } from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"

/**
 * `vite preview` of a finished deploy directory (dist/, dist-e2e/) as a
 * plain static site, routed like Cloudflare Pages serves it with
 * public/_redirects:
 * - `/` → the prerendered homepage (__home.html) when there is one;
 * - a prerendered page (`/wiki/items` → wiki/items.html) as itself;
 * - any other app path → the SPA shell, index.html.
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
        if (req.method !== "GET" && req.method !== "HEAD") return next()
        const url = new URL(req.url ?? "/", "http://preview.local")
        const pathname = decodeURIComponent(url.pathname)
        if (path.extname(pathname) !== "") return next()
        const file =
          pathname === "/"
            ? "/__home.html"
            : `${pathname.replace(/\/$/, "")}.html`
        const page = path.join(outDir, file)
        const served =
          page.startsWith(outDir) && existsSync(page) ? file : "/index.html"
        req.url = `${served}${url.search}`
        return next()
      })
    },
  }
}

export default defineConfig({
  appType: "mpa",
  plugins: [pagesRouting()],
})
