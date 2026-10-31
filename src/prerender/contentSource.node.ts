/**
 * The build-time ContentSource (src/server/contentSource.ts): Pages' ASSETS
 * binding, served from the client build on disk. Node only; registered by
 * react-router.config.ts.
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import type { ContentSource } from "../server/contentSource"

export function diskContentSource(clientDir: string): ContentSource {
  const root = path.resolve(clientDir)
  return {
    async fetch(input) {
      const url = new URL(
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : input.href,
      )
      const file = path.join(root, decodeURIComponent(url.pathname))
      if (!file.startsWith(root)) return new Response(null, { status: 404 })
      try {
        return new Response(await readFile(file), {
          headers: { "Content-Type": "application/json" },
        })
      } catch {
        return new Response(null, { status: 404 })
      }
    },
  }
}
