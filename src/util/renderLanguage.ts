/**
 * The language of the server render in progress (the SSR Pages Function,
 * src/ssr/render.tsx), for the few helpers that read the language outside
 * React (util/format/pageLocale.ts). Components get it from their i18next instance
 * (useTranslation, a per-request cloneInstance on the server). Safe because
 * the Function renders one page at a time per isolate (render.tsx).
 * Always null in the browser.
 */
let serverRenderLanguage: string | null = null

export function setServerRenderLanguage(language: string | null): void {
  serverRenderLanguage = language
}

export function getServerRenderLanguage(): string | null {
  return serverRenderLanguage
}
