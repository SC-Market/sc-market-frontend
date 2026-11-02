/**
 * Whether the server render in progress (the SSR Pages Function,
 * src/ssr/render.tsx) is for an org's white-label host, for the few helpers
 * that check the host outside React (features/help/links.ts). Components
 * get it from useCustomDomain(). Safe for the same reason as
 * util/renderLanguage.ts: the Function renders one page at a time per
 * isolate. Always false in the browser and at build time.
 */
let serverRenderWhiteLabel = false

export function setServerRenderWhiteLabel(whiteLabel: boolean): void {
  serverRenderWhiteLabel = whiteLabel
}

export function isServerRenderWhiteLabel(): boolean {
  return serverRenderWhiteLabel
}
