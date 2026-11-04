/**
 * useNow / useRenderTimeZone / useFormatters: the server render's time and
 * UTC while hydrating, then the clock and the visitor's zone.
 */
import { act } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { createRoot, hydrateRoot } from "react-dom/client"
import { I18nextProvider } from "react-i18next"
import { createInstance } from "i18next"
import { describe, expect, it } from "vitest"
import { RenderTimeProvider, useNow, useRenderTimeZone } from "../renderTime"
import { useFormatters } from "../useFormatters"

const RENDERED_AT = Date.UTC(2026, 0, 1, 23, 30) // well in the past

function Probe() {
  const now = useNow()
  const zone = useRenderTimeZone()
  const fmt = useFormatters()
  return (
    <p>
      <span data-testid="now">
        {now === RENDERED_AT ? "rendered" : "clock"}
      </span>
      <span data-testid="zone">{zone ?? "local"}</span>
      <span data-testid="price">{fmt.price(1500)}</span>
      <span data-testid="time">
        {fmt.time(RENDERED_AT, { hour: "numeric", minute: "2-digit" })}
      </span>
      <span data-testid="relative">
        {fmt.relative(RENDERED_AT - 86_400_000 * 3, now)}
      </span>
    </p>
  )
}

function i18nIn(lng: string) {
  const instance = createInstance()
  void instance.init({
    lng,
    resources: {},
    initAsync: false,
    showSupportNotice: false,
  })
  return instance
}

const tree = (lng: string) => (
  <I18nextProvider i18n={i18nIn(lng)}>
    <RenderTimeProvider now={RENDERED_AT}>
      <Probe />
    </RenderTimeProvider>
  </I18nextProvider>
)

const text = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!.textContent

describe("render time and zone", () => {
  it("server-renders at the render's time, in UTC and the page's language", () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(tree("de"))
    expect(text(container, "now")).toBe("rendered")
    expect(text(container, "zone")).toBe("UTC")
    expect(text(container, "price")).toBe("1.500 aUEC")
    expect(text(container, "time")).toBe("23:30 UTC")
    expect(text(container, "relative")).toBe("vor 3 Tagen")
  })

  it("hydrates the same text without a mismatch, then switches to the clock and local zone", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(tree("de"))
    document.body.appendChild(container)
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, tree("de"), {
        onRecoverableError: (error) => errors.push(error),
      })
    })
    expect(errors).toEqual([])
    expect(text(container, "now")).toBe("clock")
    expect(text(container, "zone")).toBe("local")
    expect(text(container, "time")).not.toContain("UTC")
    act(() => root!.unmount())
    container.remove()
  })

  it("a browser-only render uses the clock and local zone from the start", async () => {
    const container = document.createElement("div")
    const root = createRoot(container)
    await act(async () => root.render(tree("en")))
    expect(text(container, "now")).toBe("clock")
    expect(text(container, "zone")).toBe("local")
    expect(text(container, "price")).toBe("1,500 aUEC")
    act(() => root.unmount())
  })
})
