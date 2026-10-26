import { describe, it, expect } from "vitest"
import { isChunkLoadError } from "../chunkLoadError"
import { MissingModuleError } from "../retryDynamicImport"
import { addCfasyncFalse } from "../../document/cfasync"

describe("isChunkLoadError", () => {
  it.each([
    new TypeError(
      "Failed to fetch dynamically imported module: https://sc-market.space/assets/A-x.js",
    ),
    new TypeError(
      "error loading dynamically imported module: https://sc-market.space/assets/A-x.js",
    ),
    new TypeError("Importing a module script failed."),
    new Error("Unable to preload CSS for /assets/A-x.css"),
    new MissingModuleError(undefined),
    "TypeError: Failed to fetch dynamically imported module: https://sc-market.space/assets/A-x.js",
  ])("recognises %s", (error) => {
    expect(isChunkLoadError(error)).toBe(true)
  })

  it.each([
    null,
    undefined,
    "",
    new Error("API exploded"),
    new TypeError("Cannot read properties of undefined (reading 'x')"),
    { status: 500 },
  ])("ignores %s", (error) => {
    expect(isChunkLoadError(error)).toBe(false)
  })
})

describe("addCfasyncFalse (Rocket Loader opt-out)", () => {
  it("marks every script tag, inline and module, once", () => {
    const html = [
      "<script>var a = 1</script>",
      '<script type="module" crossorigin src="/assets/index-abc.js"></script>',
      '<script data-cfasync="false">var b = 2</script>',
      '<script type="application/ld+json">{}</script>',
    ].join("\n")

    expect(addCfasyncFalse(html)).toBe(
      [
        '<script data-cfasync="false">var a = 1</script>',
        '<script data-cfasync="false" type="module" crossorigin src="/assets/index-abc.js"></script>',
        '<script data-cfasync="false">var b = 2</script>',
        '<script data-cfasync="false" type="application/ld+json">{}</script>',
      ].join("\n"),
    )
  })

  it("is idempotent", () => {
    const once = addCfasyncFalse('<script type="module" src="/a.js"></script>')
    expect(addCfasyncFalse(once)).toBe(once)
  })
})
