/**
 * Whether a URL's query string changes what the page renders. Prerendered
 * pages are rendered without a query (Cloudflare Pages serves the same file
 * for /missions and /missions?category=delivery), so with one the browser's
 * first render differs from the HTML: entry.client renders it from scratch
 * instead of hydrating. Tracking parameters and ?lng (handled as the
 * language) don't count. Keep in sync with document.html's pre-theme script.
 */
const IGNORED_PARAM = /^(utm_.*|fbclid|gclid|msclkid|ref|lng)$/

export function hasPageQuery(search: string): boolean {
  for (const key of new URLSearchParams(search).keys()) {
    if (!IGNORED_PARAM.test(key)) return true
  }
  return false
}
