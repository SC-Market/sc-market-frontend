/// <reference types="node" />
/**
 * The head tags a prerendered page gets: the edge bridge's own document for
 * the path (src/bridge/handler.ts resolvePage), built at build time with the
 * same builders and the same public API, so crawlers get at least what the
 * bridge gives them (title, description, og:/twitter:, canonical, JSON-LD).
 * The page body is the real render instead of the bridge's summary.
 *
 * Build-time only (entry.server.tsx, on Node). Help & Guides pages read the
 * content build's JSON from build/client, like the bridge reads it from
 * Pages' ASSETS.
 */
import { readFile } from "node:fs/promises"
import path from "node:path"
import { resolvePage, type BridgeEnv } from "../bridge/handler"
import { headMarkup, type HtmlRewriterConstructor } from "../bridge/render"

const CLIENT_DIR = path.resolve(process.cwd(), "build/client")

/** Pages' ASSETS binding, served from the client build on disk. */
const localAssets: BridgeEnv["ASSETS"] = {
  async fetch(input) {
    const url = new URL(
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : input.href,
    )
    const file = path.join(CLIENT_DIR, decodeURIComponent(url.pathname))
    if (!file.startsWith(CLIENT_DIR)) return new Response(null, { status: 404 })
    try {
      return new Response(await readFile(file), {
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      return new Response(null, { status: 404 })
    }
  },
}

/** The bridge never rewrites HTML here; it only builds the document. */
const noRewriter = class {
  on() {
    throw new Error("not used at build time")
  }
} as unknown as HtmlRewriterConstructor

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export type BridgeHeadResult =
  | { kind: "page"; tags: string }
  | { kind: "none"; reason: string }

/** `<title>` + meta/canonical/JSON-LD for `pathname`, as the bridge renders them. */
export async function bridgeHeadTags(
  pathname: string,
  origin: string,
  env: { VITE_BACKEND_URL?: string; VITE_FRONTEND_URL?: string },
): Promise<BridgeHeadResult> {
  const outcome = await resolvePage(
    new URL(pathname, origin),
    { ASSETS: localAssets, ...env },
    { HTMLRewriter: noRewriter, fetch: (input, init) => fetch(input, init) },
    () => {},
  )
  if (outcome.kind !== "page") {
    return {
      kind: "none",
      reason: outcome.kind === "notFound" ? "not found" : outcome.reason,
    }
  }
  const { doc } = outcome
  return {
    kind: "page",
    tags: `<title>${escapeText(doc.title)}</title>${headMarkup(doc.head, doc.canonical, false)}`,
  }
}
