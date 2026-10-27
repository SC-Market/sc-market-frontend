/**
 * Puts a prerendered page's own head tags into the static document head
 * (src/document/document.html), the same way the edge bridge does at request
 * time (src/bridge/render.ts rewriteShell): the page's <title> replaces the
 * shell's, and every shell <meta> with the same name/property (description,
 * og:*, twitter:*…) and the shell's canonical link make way for the page's.
 *
 * Plain string edits on a document we wrote ourselves: no user content is
 * parsed here, and the page's tags come already escaped (bridge headMarkup or
 * Unhead's SSR output).
 */

const META_TAG = /<meta\b[^>]*>/gi
const KEY_ATTRIBUTE = /\b(name|property)\s*=\s*"([^"]*)"/gi
const TITLE = /<title\b[^>]*>[\s\S]*?<\/title>/i
const CANONICAL = /<link\b[^>]*\brel\s*=\s*"canonical"[^>]*>\s*/gi

function metaKeys(tag: string): string[] {
  return [...tag.matchAll(KEY_ATTRIBUTE)].map((m) => m[2])
}

/**
 * `html`: the whole document. `pageHeadTags`: the page's tags (a <title>
 * plus meta/link/script elements), inserted at the end of <head>.
 */
export function applyPageHead(html: string, pageHeadTags: string): string {
  const headEnd = html.indexOf("</head>")
  if (headEnd === -1) throw new Error("document has no </head>")
  let head = html.slice(0, headEnd)
  const rest = html.slice(headEnd)

  const title = TITLE.exec(pageHeadTags)?.[0]
  let tags = pageHeadTags
  if (title) {
    tags = tags.replace(TITLE, "")
    head = head.replace(TITLE, () => title)
  }

  const pageKeys = new Set(
    (tags.match(META_TAG) ?? []).flatMap((tag) => metaKeys(tag)),
  )
  head = head.replace(META_TAG, (tag) =>
    metaKeys(tag).some((key) => pageKeys.has(key)) ? "" : tag,
  )
  if (/<link\b[^>]*\brel\s*=\s*"canonical"/i.test(tags)) {
    head = head.replace(CANONICAL, "")
  }

  return `${head}${tags.trim()}\n  ${rest}`
}
