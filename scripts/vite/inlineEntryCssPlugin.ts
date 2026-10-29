/**
 * Inlines the entry stylesheet(s) into the built index.html (run by
 * scripts/build/finalize.ts on the finished build).
 *
 * The entry CSS is small (~2 KB: the @font-face rules and base styles; MUI's
 * styles come from emotion at runtime), but as a <link rel="stylesheet"> it is
 * a render-blocking request: PSI mobile charged it ~180 ms before the edge
 * bridge's HTML summary (or anything else) could paint. Inlined, the first
 * paint needs only the HTML.
 *
 * This replaces the Beasties critical-CSS plugin, which never did anything
 * here: it runs from transformIndexHtml, before the CSS is on disk, so it only
 * logged "Unable to locate stylesheet".
 *
 * The CSS file is still emitted (nothing else references it); only stylesheets
 * found in this build's bundle and under MAX_INLINE_BYTES are inlined, so a
 * large future stylesheet stays a cacheable file.
 */
const MAX_INLINE_BYTES = 16 * 1024

const STYLESHEET_LINK =
  /<link\b[^>]*\brel=["']?stylesheet["']?[^>]*\bhref=["']\/([^"']+\.css)["'][^>]*>/gi

export function inlineStylesheets(
  html: string,
  cssByFileName: (fileName: string) => string | undefined,
): string {
  return html.replace(STYLESHEET_LINK, (tag, fileName: string) => {
    const css = cssByFileName(fileName)
    if (css === undefined || css.length > MAX_INLINE_BYTES) return tag
    // "</style" can't legally appear in CSS outside a string; guard anyway.
    if (/<\/style/i.test(css)) return tag
    return `<style data-inlined-from="/${fileName}">${css}</style>`
  })
}

const INLINED_FROM = /<style data-inlined-from="(\/[^"]+\.css)">/g

/** The hrefs of the stylesheets inlineStylesheets inlined into `html`. */
export function inlinedStylesheetHrefs(html: string): string[] {
  return [...html.matchAll(INLINED_FROM)].map((m) => m[1])
}

/**
 * Drops inlined stylesheets from the `css` lists of React Router's client
 * manifest (assets/manifest-*.js).
 *
 * React Router preloads a route's `css` when it loads the route module
 * (`<link rel="preload" as="style">`, skipped only when a
 * `<link rel="stylesheet">` with that href is in the document). With the
 * stylesheet inlined there is no such link, so it fetched the file again and
 * never applied it: Chrome's "preloaded but not used" warning on every
 * shell-rendered page. The CSS is already in the page, so the manifest
 * shouldn't list it.
 */
export function dropRouteCss(manifestJs: string, hrefs: string[]): string {
  if (hrefs.length === 0) return manifestJs
  const drop = new Set(hrefs)
  return manifestJs.replace(/"css":\[([^\]]*)\]/g, (whole, list: string) => {
    const kept = list
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "" && !drop.has(s.replace(/^"|"$/g, "")))
    return `"css":[${kept.join(",")}]`
  })
}
