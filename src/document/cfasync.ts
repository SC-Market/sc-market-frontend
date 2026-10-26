/**
 * Adds data-cfasync="false" to every <script> tag in a built HTML page.
 *
 * Cloudflare Rocket Loader (a zone setting, outside this repo) rewrites each
 * script's type to "<hash>-text/javascript" / "<hash>-module" and replays them
 * late from its own deferred loader. That delayed the inline asset-reload
 * guard until after the app could fail, and made the entry module load through
 * Rocket Loader instead of the browser. Scripts carrying data-cfasync="false"
 * are left alone, so the guard and the entry run natively whether Rocket
 * Loader is on or off.
 *
 * document.html sets the attribute on its own tags and src/root.tsx passes it
 * to React Router's <Scripts />; entry.server.tsx runs every rendered page
 * through this as well, so a script added anywhere else can't miss it.
 */
const SCRIPT_OPEN_TAG = /<script\b([^>]*)>/gi

export function addCfasyncFalse(html: string): string {
  return html.replace(SCRIPT_OPEN_TAG, (tag, attrs: string) =>
    /\bdata-cfasync\s*=/i.test(attrs)
      ? tag
      : `<script data-cfasync="false"${attrs}>`,
  )
}
