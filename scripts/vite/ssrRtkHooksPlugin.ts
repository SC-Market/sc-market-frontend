/**
 * Server builds only: resolve "@reduxjs/toolkit/query/react" to
 * src/server/rtkQueryReactServer.ts, whose createApi starts queries during
 * render (see that file). That module itself still gets the real package.
 */
import path from "node:path"
import type { Plugin } from "vite"

const SPECIFIER = "@reduxjs/toolkit/query/react"

export function ssrRtkHooksPlugin(root: string): Plugin {
  const replacement = path.resolve(root, "src/server/rtkQueryReactServer.ts")
  return {
    name: "sc-market-ssr-rtk-hooks",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (source !== SPECIFIER || !options?.ssr) return null
      if (importer && path.resolve(importer.split("?")[0]) === replacement) {
        return null
      }
      return replacement
    },
  }
}
