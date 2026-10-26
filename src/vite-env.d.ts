/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.webp" {
  const src: string
  export default src
}

/** Help & Guides content index + lazy body loaders (scripts/vite/contentPlugin.ts). */
declare module "virtual:help-content" {
  export const index: import("./features/help/domain/types").ContentIndex
  /** Keyed by guide id ("buying/buy-an-item") or "about". */
  export const bodies: Record<
    string,
    () => Promise<{ default: import("./features/help/domain/types").ContentBody }>
  >
}

interface Window {
  /** Set by entry.client.tsx once the entry chunk runs (see document.html's guard). */
  __scmEntryStarted?: boolean
}
