/**
 * Adds data-cfasync="false" to every <script> tag in the built index.html.
 *
 * Cloudflare Rocket Loader (a zone setting, outside this repo) rewrites each
 * script's type to "<hash>-text/javascript" / "<hash>-module" and replays them
 * late from its own deferred loader. That delayed the inline asset-reload
 * guard until after the app could fail, and made the entry module load through
 * Rocket Loader instead of the browser. Scripts carrying data-cfasync="false"
 * are left alone, so the guard and the entry run natively whether Rocket
 * Loader is on or off.
 *
 * index.html sets the attribute on its own tags, but Vite replaces the entry
 * tag with a generated one (and plugins may add more), so the final HTML is
 * patched here, after every other transform.
 */
import type { Plugin } from "vite"

const SCRIPT_OPEN_TAG = /<script\b([^>]*)>/gi

export function addCfasyncFalse(html: string): string {
  return html.replace(SCRIPT_OPEN_TAG, (tag, attrs: string) =>
    /\bdata-cfasync\s*=/i.test(attrs)
      ? tag
      : `<script data-cfasync="false"${attrs}>`,
  )
}

export function cfasyncPlugin(): Plugin {
  return {
    name: "sc-market-cfasync",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler: (html) => addCfasyncFalse(html),
    },
  }
}
