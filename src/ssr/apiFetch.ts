/**
 * The API fetch of one SSR render (src/ssr/, docs/ssr-worker.md).
 *
 * - Anonymous: a fresh GET with only an Accept header. Never the visitor's
 *   cookies, auth or other headers (Workers' fetch keeps no cookie jar).
 *   Anything but GET is refused: a server render never mutates.
 * - One request per URL per render: the loaders' calls and the page head's
 *   (bridgeHead) share the answers.
 * - Edge-cached per URL (Cache API) for `ttlSeconds`, like the bridge's
 *   API cache, so a burst of renders of one page costs the API one call.
 * - A hard timeout per call; a timed-out call is an error (the page then
 *   renders without that data, or the render fails open).
 * - `freeze()`: once the loaders are done, queries a render starts on its
 *   own (a component's hook that no loader prefetched) never settle. They
 *   render as loading, exactly like the browser's first render, and cost
 *   no API call; `unprefetched` lists them (logged, to extend the loaders).
 */
export interface ApiFetchOptions {
  fetch: typeof fetch
  cache?: Cache
  waitUntil: (promise: Promise<unknown>) => void
  timeoutMs: number
  ttlSeconds: number
}

export interface ApiFetch {
  fetch: typeof fetch
  /** Stop answering: from now on every call stays pending. */
  freeze(): void
  /** URLs requested after freeze(). */
  readonly unprefetched: string[]
  /** Network calls made (cache misses). */
  readonly upstreamCalls: number
}

const CACHE_STATUS_HEADER = "x-ssr-upstream-status"

interface Answer {
  status: number
  body: string
  contentType: string
}

function toResponse(answer: Answer): Response {
  return new Response(answer.body, {
    status: answer.status,
    headers: { "Content-Type": answer.contentType },
  })
}

/** Statuses worth caching: success and "doesn't exist" answers. */
function cacheable(status: number): boolean {
  return status === 200 || status === 400 || status === 404
}

export function createApiFetch(options: ApiFetchOptions): ApiFetch {
  const answers = new Map<string, Promise<Answer>>()
  const unprefetched: string[] = []
  let frozen = false
  let upstreamCalls = 0

  async function load(url: string): Promise<Answer> {
    const cacheKey = new Request(url, { method: "GET" })
    const cached = await options.cache?.match(cacheKey).catch(() => undefined)
    if (cached) {
      return {
        status: Number(cached.headers.get(CACHE_STATUS_HEADER)) || 200,
        body: await cached.text(),
        contentType: cached.headers.get("Content-Type") ?? "application/json",
      }
    }
    upstreamCalls++
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), options.timeoutMs)
    let answer: Answer
    try {
      const response = await options.fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        redirect: "manual",
        signal: controller.signal,
      })
      answer = {
        status: response.status,
        body: await response.text(),
        contentType: response.headers.get("Content-Type") ?? "application/json",
      }
    } finally {
      clearTimeout(timer)
    }
    if (options.cache && cacheable(answer.status)) {
      options.waitUntil(
        options.cache
          .put(
            cacheKey,
            new Response(answer.body, {
              headers: {
                "Content-Type": answer.contentType,
                "Cache-Control": `public, max-age=${options.ttlSeconds}`,
                [CACHE_STATUS_HEADER]: String(answer.status),
              },
            }),
          )
          .catch(() => {}),
      )
    }
    return answer
  }

  const apiFetch: typeof fetch = async (input, init) => {
    const request = input instanceof Request ? input : null
    const url = request ? request.url : String(input)
    const method = (init?.method ?? request?.method ?? "GET").toUpperCase()
    if (method !== "GET") {
      throw new TypeError(`SSR: refusing ${method} ${url}`)
    }
    if (frozen) {
      unprefetched.push(url)
      return new Promise<Response>(() => {})
    }
    let answer = answers.get(url)
    if (!answer) {
      answer = load(url)
      answers.set(url, answer)
      // A failed call may be retried (RTK's retry): don't keep the failure.
      answer.catch(() => answers.delete(url))
    }
    return toResponse(await answer)
  }

  return {
    fetch: apiFetch,
    freeze() {
      frozen = true
    },
    unprefetched,
    get upstreamCalls() {
      return upstreamCalls
    },
  }
}
