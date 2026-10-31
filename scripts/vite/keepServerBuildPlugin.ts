/**
 * Keeps React Router's server build for the SSR Pages Function
 * (src/ssr/, docs/ssr-worker.md).
 *
 * With `ssr: false` React Router builds build/server, uses it to prerender,
 * and then deletes it. This copies it to build/ssr first (writeBundle runs
 * before React Router's prerender step); functions/ imports it from there,
 * and Cloudflare Pages bundles it into the Function after the build.
 */
import { cpSync, rmSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

export const SSR_BUILD_DIR = "build/ssr"

export function keepServerBuildPlugin(root: string): Plugin {
  const target = path.resolve(root, SSR_BUILD_DIR)
  return {
    name: "sc-market-keep-server-build",
    apply: "build",
    writeBundle: {
      order: "pre",
      sequential: true,
      handler(options) {
        if (this.environment?.config.consumer !== "server" || !options.dir) {
          return
        }
        rmSync(target, { recursive: true, force: true })
        cpSync(options.dir, target, { recursive: true })
      },
    },
  }
}
