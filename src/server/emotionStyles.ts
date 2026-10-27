/**
 * MUI/Emotion styles for a build-time render, collected into <style> tags
 * for the document <head>.
 *
 * Emotion's default server mode writes each rule inline, once, next to the
 * first element that uses it, and then marks it as written. When React
 * throws away a render attempt (a part of the tree suspended and is rendered
 * again), the rules written in that attempt are lost but stay marked: later
 * elements get the class without its CSS, and the page shifts when the
 * browser adds the rule after hydration. Here the cache keeps every rule
 * ("compat" mode, which is what @emotion/server builds on) and the document
 * gets the rules for the classes that are actually in the HTML, plus the
 * global styles, in the same <style data-emotion="css …"> format the
 * browser's Emotion cache adopts at start-up.
 */
import createCache, { type EmotionCache } from "@emotion/cache"

/** The browser's default Emotion cache key: its cache adopts these tags. */
const KEY = "css"

/** A fresh cache for one render (wrap the app in <CacheProvider>). */
export function createRenderCache(): EmotionCache {
  const cache = createCache({ key: KEY })
  // Keep each rule's CSS on cache.inserted instead of rendering it inline.
  cache.compat = true
  return cache
}

/** The <style> tags for the rules `html` uses (globals first). */
export function emotionStyleTags(cache: EmotionCache, html: string): string {
  const used = new Set<string>()
  const classPattern = new RegExp(`${KEY}-([a-zA-Z0-9-_]+)`, "g")
  for (const match of html.matchAll(classPattern)) used.add(match[1])

  const globals: string[] = []
  const ids: string[] = []
  let css = ""
  for (const [id, rules] of Object.entries(cache.inserted)) {
    if (typeof rules !== "string") continue
    const isGlobal = cache.registered[`${KEY}-${id}`] === undefined
    if (isGlobal) {
      globals.push(
        `<style data-emotion="${KEY}-global ${id}">${escapeStyle(rules)}</style>`,
      )
    } else if (used.has(id)) {
      ids.push(id)
      css += rules
    }
  }
  const regular =
    ids.length > 0
      ? `<style data-emotion="${KEY} ${ids.join(" ")}">${escapeStyle(css)}</style>`
      : ""
  return [...globals, regular].join("")
}

/** CSS can't end the <style> element early. */
function escapeStyle(css: string): string {
  return css.replace(/<\/style/gi, "<\\/style")
}
