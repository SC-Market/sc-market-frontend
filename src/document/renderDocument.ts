/**
 * Fills src/document/document.html (see entry.server.tsx): the rendered app
 * goes into <div id="root">, the app's stylesheets into <head>.
 */
import { addCfasyncFalse } from "./cfasync"
import { applyPageHead } from "./pageHead"

export const HEAD_MARKER = "<!--app-head-->"
export const APP_MARKER = "<!--app-html-->"

export interface DocumentParts {
  /** React's HTML for the root route (goes inside <div id="root">). */
  appHtml: string
  /** Stylesheet URLs the first render needs, in order (duplicates dropped). */
  stylesheets: string[]
  /**
   * The render's MUI/Emotion <style> tags (server/emotionStyles.ts), after
   * the stylesheets like the browser's Emotion cache adds them.
   */
  styleTags?: string
  /** A prerendered page's own <title> and head tags (see pageHead.ts). */
  pageHeadTags?: string
  /**
   * A prerendered page's RTK Query data (store/hydration.ts), as a JSON
   * <script> after #root.
   */
  data?: { elementId: string; value: unknown }
}

/** JSON that can't close its <script> (or start a comment) early. */
export function serializeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

export function renderDocument(template: string, parts: DocumentParts): string {
  if (
    !template.includes(HEAD_MARKER) ||
    !template.includes(`<div id="root">${APP_MARKER}</div>`)
  ) {
    throw new Error(
      "document.html is missing the <!--app-head--> or <!--app-html--> marker",
    )
  }
  const head = [
    ...[...new Set(parts.stylesheets)].map(
      (href) =>
        `<link rel="stylesheet" crossorigin href="${escapeAttribute(href)}" />`,
    ),
    ...(parts.styleTags ? [parts.styleTags] : []),
  ].join("\n    ")
  // Function replacers: `$` in the HTML must not be read as a pattern.
  const data = parts.data
    ? `<script type="application/json" id="${escapeAttribute(parts.data.elementId)}">${serializeJsonForScript(parts.data.value)}</script>`
    : ""
  let html = template
    .replace(HEAD_MARKER, () => head)
    .replace(
      `<div id="root">${APP_MARKER}</div>`,
      () =>
        `<div id="root"${parts.pageHeadTags ? " data-prerendered" : ""}>${parts.appHtml}</div>${data}`,
    )
  if (parts.pageHeadTags) html = applyPageHead(html, parts.pageHeadTags)
  return addCfasyncFalse(html)
}
