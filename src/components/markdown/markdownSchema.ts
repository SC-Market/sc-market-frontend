export const allowList = [
  "robertsspaceindustries.com",
  "starcitizen.tools",
  "i.imgur.com",
  // 'media.discordapp.net',
  // 'cdn.discordapp.com',
]

// Ultra-secure sanitization schema - minimal attributes only
export const sanitizeSchema = {
  tagNames: [
    // Basic formatting
    "u",
    "s",
    "small",
    "sub",
    "sup",
    // Safe structural elements
    "div",
    "span",
    "p",
    "br",
    // Lists (already handled by markdown, but allow for HTML)
    "ul",
    "ol",
    "li",
    // Headings (already handled by markdown, but allow for HTML)
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // Text formatting (already handled by markdown, but allow for HTML)
    "strong",
    "em",
    "b",
    "i",
    "code",
    "pre",
    // Links and media (minimal attributes only)
    "a",
    "img",
    // Tables (from GFM)
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    // Blockquotes
    "blockquote",
    // Horizontal rule
    "hr",
  ],
  attributes: {
    // Only allow href on links (no target, rel, title, etc.)
    a: ["href"],
    // Only allow src and alt on images (no width, height, title, etc.)
    img: ["src", "alt"],
    // No other attributes allowed on any other elements
  },
  protocols: {
    // Only allow safe protocols
    href: ["http", "https"],
    src: ["http", "https"],
  },
}

/** A YouTube watch link: rendered as a video (a block), not a link. */
export function youTubeVideoId(href: unknown): string | null {
  if (typeof href !== "string") return null
  try {
    const url = new URL(href)
    return url.origin.includes("youtube.com") ? url.searchParams.get("v") : null
  } catch {
    return null
  }
}

/**
 * Whether a paragraph holds a block (a YouTube video): it is then a <div>,
 * since a <div> inside a <p> closes the paragraph when the HTML is parsed,
 * and a server-rendered page would no longer match the app's tree.
 */
export function paragraphHasBlock(node: unknown): boolean {
  const children = (node as { children?: unknown[] } | undefined)?.children
  return (children ?? []).some((child) => {
    const element = child as {
      type?: string
      tagName?: string
      properties?: { href?: unknown }
    }
    return (
      element.type === "element" &&
      element.tagName === "a" &&
      youTubeVideoId(element.properties?.href) !== null
    )
  })
}

/** Whether an image src is on an allow-listed host (or a subdomain of one). */
export function imageHostAllowed(src: string): boolean {
  let hostname: string
  try {
    hostname = new URL(src).hostname
  } catch {
    // Relative or malformed src: not on the allow list.
    return false
  }
  return allowList.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain),
  )
}
