/**
 * Fills src/document/document.html (see entry.server.tsx): the rendered app
 * goes into <div id="root">, the app's stylesheets into <head>.
 */
import { addCfasyncFalse } from "./cfasync"

export const HEAD_MARKER = "<!--app-head-->"
export const APP_MARKER = "<!--app-html-->"

export interface DocumentParts {
  /** React's HTML for the root route (goes inside <div id="root">). */
  appHtml: string
  /** Stylesheet URLs the first render needs, in order (duplicates dropped). */
  stylesheets: string[]
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

export function renderDocument(template: string, parts: DocumentParts): string {
  if (!template.includes(HEAD_MARKER) || !template.includes(APP_MARKER)) {
    throw new Error(
      "document.html is missing the <!--app-head--> or <!--app-html--> marker",
    )
  }
  const head = [...new Set(parts.stylesheets)]
    .map(
      (href) =>
        `<link rel="stylesheet" crossorigin href="${escapeAttribute(href)}" />`,
    )
    .join("\n    ")
  // Function replacers: `$` in the HTML must not be read as a pattern.
  const html = template
    .replace(HEAD_MARKER, () => head)
    .replace(APP_MARKER, () => parts.appHtml)
  return addCfasyncFalse(html)
}
