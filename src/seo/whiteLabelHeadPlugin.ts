import { dedupeKey } from "@unhead/react/utils"
import type { HeadPluginOptions } from "unhead/types"
import {
  applyWhiteLabelHeadRules,
  type WhiteLabelHeadOptions,
} from "./pageHead"

/**
 * The browser's head on an org's white-label host: the same rules as the
 * server render's (applyWhiteLabelHeadRules, src/seo/pageHead.ts), applied
 * to every head Unhead resolves. A page the app renders from scratch there
 * (the static "/" redirecting to the org's page, client-side navigation)
 * then has the org's titles, site name and, on the org's own pages, its
 * URLs on the host, like a server-rendered one; a hydrated one keeps them.
 *
 * `options` is read per resolve: the org's name comes from the domain
 * cache, which a first visit fills once the domain answer is in. Without
 * it (null) the head is left as the pages make it.
 */
export function whiteLabelHeadPlugin(
  options: () => WhiteLabelHeadOptions | null,
): HeadPluginOptions & { key: string } {
  return {
    key: "white-label-head",
    hooks: {
      "tags:resolve": (ctx: {
        tags: Parameters<typeof dedupeKey>[0][]
      }): void => {
        const resolved = options()
        if (!resolved) return
        const added = applyWhiteLabelHeadRules(ctx.tags, resolved)
        for (const tag of added) {
          const next = { ...tag, tag: "meta" as const }
          ctx.tags.push({ ...next, _d: dedupeKey(next) })
        }
      },
    },
  }
}
