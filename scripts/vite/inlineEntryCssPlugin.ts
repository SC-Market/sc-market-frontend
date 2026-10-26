/**
 * Inlines the entry stylesheet(s) into the built index.html.
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
import type { Plugin } from "vite"

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

export function inlineEntryCssPlugin(): Plugin {
  return {
    name: "sc-market-inline-entry-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        return inlineStylesheets(html, (fileName) => {
          const asset = bundle[fileName]
          if (!asset || asset.type !== "asset") return undefined
          return typeof asset.source === "string"
            ? asset.source
            : new TextDecoder().decode(asset.source)
        })
      },
    },
  }
}
