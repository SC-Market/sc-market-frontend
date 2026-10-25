/**
 * Runtime access to the compiled Help & Guides content. Imported only by the
 * guides/about route chunks: the index is metadata only, each body is its own
 * lazy chunk (see scripts/vite/contentPlugin.ts).
 */
import { useEffect, useState } from "react"
import { bodies, index } from "virtual:help-content"
import { retryDynamicImport } from "../../util/retryDynamicImport"
import type { CategoryMeta, ContentBody, GuideMeta } from "./domain/types"

export const helpIndex = index

export function findCategory(id: string | undefined): CategoryMeta | undefined {
  return index.categories.find((c) => c.id === id)
}

export function guidesIn(categoryId: string): GuideMeta[] {
  return index.guides.filter((g) => g.category === categoryId)
}

export function findGuide(category: string | undefined, slug: string | undefined): GuideMeta | undefined {
  return index.guides.find((g) => g.category === category && g.slug === slug)
}

export function findGuideById(id: string): GuideMeta | undefined {
  return index.guides.find((g) => g.id === id)
}

/** The body for a guide id or "about"; undefined while loading. */
export function useContentBody(key: string | undefined): {
  body: ContentBody | undefined
  error: unknown
} {
  const [state, setState] = useState<{ key?: string; body?: ContentBody; error?: unknown }>({})
  useEffect(() => {
    const load = key ? bodies[key] : undefined
    if (!key || !load) return
    let cancelled = false
    retryDynamicImport(load).then(
      (mod) => !cancelled && setState({ key, body: mod.default }),
      (error: unknown) => !cancelled && setState({ key, error }),
    )
    return () => {
      cancelled = true
    }
  }, [key])
  return state.key === key ? { body: state.body, error: state.error } : { body: undefined, error: undefined }
}
