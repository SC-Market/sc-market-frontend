// @vitest-environment node
import React, { Suspense } from "react"
import { prerender } from "react-dom/static"
import { CacheProvider, Global } from "@emotion/react"
import { Box } from "@mui/material"
import { describe, expect, it } from "vitest"
import { createRenderCache, emotionStyleTags } from "../emotionStyles"

async function render(element: React.ReactElement) {
  const cache = createRenderCache()
  const { prelude } = await prerender(
    <CacheProvider value={cache}>{element}</CacheProvider>,
  )
  const html = await new Response(prelude).text()
  return { html, tags: emotionStyleTags(cache, html) }
}

describe("emotionStyleTags", () => {
  it("collects the rules into <head> tags instead of inline styles", async () => {
    const { html, tags } = await render(<Box sx={{ height: 48 }}>a</Box>)
    expect(html).not.toContain("<style")
    const className = /class="[^"]*\b(css-[\w-]+)/.exec(html)?.[1]
    expect(className).toBeDefined()
    expect(tags).toMatch(
      new RegExp(`<style data-emotion="css [^"]*${className!.slice(4)}`),
    )
    expect(tags).toContain("height:48px")
  })

  it("keeps the rules of a render attempt that suspended", async () => {
    // The first attempt renders the Box and then suspends; Emotion marks its
    // rule as written. The retried render must still get the rule.
    let ready = false
    const pending = new Promise<void>((resolve) =>
      setTimeout(() => {
        ready = true
        resolve()
      }, 10),
    )
    function Suspends() {
      if (!ready) throw pending
      return null
    }
    const { html, tags } = await render(
      <Suspense fallback={null}>
        <Box sx={{ minHeight: 56 }}>
          <Suspends />
        </Box>
      </Suspense>,
    )
    expect(html).toContain("css-")
    expect(tags).toContain("min-height:56px")
  })

  it("includes global styles and drops rules the HTML doesn't use", async () => {
    const cache = createRenderCache()
    await prerender(
      <CacheProvider value={cache}>
        <Global styles={{ body: { margin: 0 } }} />
        <Box sx={{ color: "red" }} />
      </CacheProvider>,
    )
    const tags = emotionStyleTags(cache, "<div></div>")
    expect(tags).toContain('data-emotion="css-global')
    expect(tags).toContain("margin:0")
    expect(tags).not.toContain("color:red")
  })

  it("can't close its <style> element early", () => {
    const cache = createRenderCache()
    cache.inserted.abc = ".css-abc{content:'</style><script>'}"
    cache.registered["css-abc"] = "content:'</style><script>'"
    expect(emotionStyleTags(cache, 'class="css-abc"')).not.toContain(
      "</style><script>",
    )
  })
})
