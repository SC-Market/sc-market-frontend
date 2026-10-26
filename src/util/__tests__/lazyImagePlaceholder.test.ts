import { afterEach, describe, expect, it } from "vitest"
import {
  initLazyImagePlaceholders,
  LAZY_IMAGE_SETTLED_ATTR,
} from "../lazyImagePlaceholder"

describe("initLazyImagePlaceholders", () => {
  let dispose: (() => void) | undefined
  afterEach(() => {
    dispose?.()
    document.body.innerHTML = ""
  })

  it("marks an image added later once it loads or fails", () => {
    dispose = initLazyImagePlaceholders()
    const ok = document.createElement("img")
    const broken = document.createElement("img")
    ok.loading = "lazy"
    broken.loading = "lazy"
    document.body.append(ok, broken)
    expect(ok.hasAttribute(LAZY_IMAGE_SETTLED_ATTR)).toBe(false)

    ok.dispatchEvent(new Event("load"))
    broken.dispatchEvent(new Event("error"))

    expect(ok.hasAttribute(LAZY_IMAGE_SETTLED_ATTR)).toBe(true)
    expect(broken.hasAttribute(LAZY_IMAGE_SETTLED_ATTR)).toBe(true)
  })

  it("ignores non-image load events", () => {
    dispose = initLazyImagePlaceholders()
    const frame = document.createElement("iframe")
    document.body.append(frame)
    frame.dispatchEvent(new Event("load"))
    expect(frame.hasAttribute(LAZY_IMAGE_SETTLED_ATTR)).toBe(false)
  })
})
