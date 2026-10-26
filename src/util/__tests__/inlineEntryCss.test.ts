import { describe, expect, it } from "vitest"
import { inlineStylesheets } from "../../../scripts/vite/inlineEntryCssPlugin"

describe("inlineStylesheets", () => {
  const html =
    '<head><link rel="stylesheet" crossorigin href="/assets/index-abc.css"></head>'

  it("replaces a bundled stylesheet link with its CSS", () => {
    const out = inlineStylesheets(html, (f) =>
      f === "assets/index-abc.css" ? "body{margin:0}" : undefined,
    )
    expect(out).toBe(
      '<head><style data-inlined-from="/assets/index-abc.css">body{margin:0}</style></head>',
    )
  })

  it("leaves links it can't resolve, large files and unsafe CSS alone", () => {
    expect(inlineStylesheets(html, () => undefined)).toBe(html)
    expect(inlineStylesheets(html, () => "a{}".repeat(10000))).toBe(html)
    expect(inlineStylesheets(html, () => "a{}</style><script>")).toBe(html)
  })

  it("does not touch non-stylesheet links", () => {
    const preload =
      '<link rel="preload" href="/fonts/x.woff2" as="font" crossorigin>'
    expect(inlineStylesheets(preload, () => "x{}")).toBe(preload)
  })
})
