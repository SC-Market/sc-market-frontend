/**
 * Runtime access to the compiled Help & Guides content. Imported only by the
 * guides/about route chunks: the index is metadata only, each body is its own
 * lazy chunk (see scripts/vite/contentPlugin.ts).
 */
import { use, useEffect, useState } from "react"
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

interface BodyEntry {
  promise: Promise<void>
  body?: ContentBody
  error?: unknown
}

/** One load per body for the whole app (shared by both hooks below). */
const bodyCache = new Map<string, BodyEntry>()

function bodyEntry(key: string): BodyEntry | undefined {
  const load = bodies[key]
  if (!load) return undefined
  let entry = bodyCache.get(key)
  if (!entry) {
    const created: BodyEntry = { promise: Promise.resolve() }
    created.promise = retryDynamicImport(load).then(
      (mod) => {
        created.body = mod.default
      },
      (error: unknown) => {
        created.error = error
        // The next mount tries again.
        bodyCache.delete(key)
      },
    )
    bodyCache.set(key, created)
    entry = created
  }
  return entry
}

/** The bodies a server render showed (see takeRenderedContentBodies). */
const renderedBodies = new Set<string>()

/**
 * The bodies rendered since the last call (server only): a prerendered page
 * lists them so the browser loads them before hydrating (preloadContentBodies).
 */
export function takeRenderedContentBodies(): string[] {
  const keys = [...renderedBodies]
  renderedBodies.clear()
  return keys
}

/**
 * Load these bodies (settled either way). A body still loading while its
 * page hydrates is thrown away and shown as the page's placeholder as soon
 * as anything above it updates (the session check, say): a layout shift.
 */
export async function preloadContentBodies(keys: readonly string[]): Promise<void> {
  await Promise.allSettled(keys.map((key) => bodyEntry(key)?.promise))
}

/**
 * The body for a guide id or "about", suspending until it's loaded. Render
 * it inside a <Suspense> with the page's placeholder: the build-time render
 * of a prerendered guide waits for it (so the HTML has the whole guide), and
 * hydration keeps that HTML until the chunk is in.
 */
export function useSuspenseContentBody(key: string): {
  body: ContentBody | undefined
  error: unknown
} {
  if (typeof window === "undefined") renderedBodies.add(key)
  const entry = bodyEntry(key)
  if (!entry) return { body: undefined, error: undefined }
  if (entry.body === undefined && entry.error === undefined) use(entry.promise)
  return { body: entry.body, error: entry.error }
}

/** The body for a guide id or "about"; undefined while loading. */
export function useContentBody(key: string | undefined): {
  body: ContentBody | undefined
  error: unknown
} {
  const [state, setState] = useState<{ key?: string; body?: ContentBody; error?: unknown }>({})
  useEffect(() => {
    const entry = key ? bodyEntry(key) : undefined
    if (!key || !entry) return
    let cancelled = false
    void entry.promise.then(() => {
      if (!cancelled) setState({ key, body: entry.body, error: entry.error })
    })
    return () => {
      cancelled = true
    }
  }, [key])
  return state.key === key ? { body: state.body, error: state.error } : { body: undefined, error: undefined }
}
