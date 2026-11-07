import React from "react"
import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useNavigate } from "react-router-dom"

const h = vi.hoisted(() => ({
  consent: undefined as string | undefined,
  ga: {
    isInitialized: false,
    initialize: vi.fn(),
    send: vi.fn(),
  },
}))

vi.mock("react-ga4", () => ({ default: h.ga }))
vi.mock("react-cookie", () => ({
  useCookies: () => [{ cookie_consent: h.consent }, vi.fn()],
}))
vi.mock("../../../util/scripts/delayedScriptLoader", () => ({
  onPageInteractive: (cb: () => void) => cb(),
}))
vi.mock("../../../util/monitoring/bugsnagLoader", () => ({
  startPerformanceMonitoring: vi.fn(),
}))
vi.mock("../../../hooks/layout/useBottomNavHeight", () => ({
  useBottomNavHeight: () => 0,
}))

import { CookieConsent } from "../CookieConsent"

let navigate: ReturnType<typeof useNavigate>
function Nav() {
  navigate = useNavigate()
  return null
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Nav />
      <CookieConsent />
    </MemoryRouter>,
  )
}

const pageviews = () =>
  h.ga.send.mock.calls.filter(([arg]) => arg.hitType === "pageview")

describe("CookieConsent pageviews", () => {
  beforeEach(() => {
    h.consent = "all"
    h.ga.isInitialized = false
    h.ga.send.mockReset()
    h.ga.initialize.mockReset()
    h.ga.initialize.mockImplementation(() => {
      h.ga.isInitialized = true
    })
  })

  it("sends one pageview for the initial load, with gtag's own off", () => {
    renderAt("/market?sort=price")
    expect(h.ga.initialize).toHaveBeenCalledTimes(1)
    expect(h.ga.initialize.mock.calls[0][1].gtagOptions.send_page_view).toBe(
      false,
    )
    expect(pageviews()).toHaveLength(1)
    expect(pageviews()[0][0]).toEqual({
      hitType: "pageview",
      page: "/market?sort=price",
      page_location: `${window.location.origin}/market?sort=price`,
    })
  })

  it("sends nothing when only the query string or hash changes", () => {
    renderAt("/market")
    act(() => navigate("/market?type=ship", { replace: true }))
    act(() => navigate("/market?type=ship&q=aurora", { replace: true }))
    act(() => navigate("/market?type=ship#top", { replace: true }))
    expect(pageviews()).toHaveLength(1)
  })

  it("sends one pageview per path change, including back/forward", () => {
    renderAt("/market")
    act(() => navigate("/market/listing/1?ref=x"))
    expect(pageviews()).toHaveLength(2)
    expect(pageviews()[1][0]).toMatchObject({
      page: "/market/listing/1?ref=x",
      page_location: `${window.location.origin}/market/listing/1?ref=x`,
    })
    act(() => navigate(-1))
    expect(pageviews()).toHaveLength(3)
    expect(pageviews()[2][0].page).toBe("/market")
    act(() => navigate(1))
    expect(pageviews()).toHaveLength(4)
  })

  it("sends no pageviews before consent", () => {
    h.consent = undefined
    renderAt("/market")
    act(() => navigate("/orders"))
    expect(h.ga.initialize).not.toHaveBeenCalled()
    expect(h.ga.send).not.toHaveBeenCalled()

    h.consent = "necessary"
    renderAt("/contracts")
    expect(h.ga.send).not.toHaveBeenCalled()
  })

  it("sends the current page once consent is given mid-visit", () => {
    h.consent = undefined
    const view = renderAt("/market")
    act(() => navigate("/orders"))
    expect(h.ga.send).not.toHaveBeenCalled()
    h.consent = "all"
    view.rerender(
      <MemoryRouter initialEntries={["/orders"]}>
        <Nav />
        <CookieConsent />
      </MemoryRouter>,
    )
    expect(pageviews()).toHaveLength(1)
    expect(pageviews()[0][0].page).toBe("/orders")
  })
})
