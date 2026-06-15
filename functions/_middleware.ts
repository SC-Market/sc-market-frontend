const DEFAULT_BACKEND_URL = "https://api.sc-market.space"
const SITEMAP_PATH_PATTERN = /^\/sitemap(?:-\d+)?\.xml$/

interface PagesContext {
  request: Request
  env: {
    BACKEND_URL?: string
  }
  next: () => Promise<Response>
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { pathname } = new URL(context.request.url)
  if (!SITEMAP_PATH_PATTERN.test(pathname)) {
    return context.next()
  }

  const backendUrl = (context.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(
    /\/$/,
    "",
  )

  try {
    return await fetch(`${backendUrl}${pathname}`, {
      method: context.request.method,
      headers: {
        Accept: "application/xml",
        "Accept-Encoding": "gzip",
      },
    })
  } catch {
    return new Response("Failed to fetch sitemap", { status: 502 })
  }
}
