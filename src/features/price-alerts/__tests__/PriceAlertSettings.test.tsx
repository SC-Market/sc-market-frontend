import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  prefs: { site: true, push: true, email: false, discord: true } as Record<
    string,
    boolean
  >,
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetPriceAlertPreferencesQuery: () => ({
    data: h.prefs,
    isLoading: false,
    isError: false,
  }),
}))
vi.mock("../components/WatchlistManager", () => ({
  WatchlistManager: () => <div data-testid="watchlist-manager" />,
}))
vi.mock("../../help/components/FirstUseHint", () => ({
  FirstUseHint: ({ title }: { title: string }) => (
    <aside data-testid="first-use-hint">{title}</aside>
  ),
}))
vi.mock("../../../components/paper/Section", () => ({
  FlatSection: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}))

import { PriceAlertSettings } from "../components/PriceAlertSettings"

function renderTab() {
  return render(
    <MemoryRouter>
      <PriceAlertSettings />
    </MemoryRouter>,
  )
}

describe("PriceAlertSettings", () => {
  beforeEach(() => {
    h.prefs = { site: true, push: true, email: false, discord: true }
  })

  it("shows the first-use hint and the watchlist", () => {
    renderTab()
    expect(screen.getByTestId("first-use-hint")).toBeTruthy()
    expect(screen.getByTestId("watchlist-manager")).toBeTruthy()
  })

  it("summarises the channels that are on, without its own toggles", () => {
    renderTab()
    expect(
      screen.getByText(
        "Alerts go to: Site notification, Push notification, Discord DM.",
      ),
    ).toBeTruthy()
    expect(screen.queryByRole("checkbox")).toBeNull()
  })

  it("warns when every channel is off", () => {
    h.prefs = { site: false, push: false, email: false, discord: false }
    renderTab()
    expect(
      screen.getByText(
        "Every channel is off, so your watches can't alert you.",
      ),
    ).toBeTruthy()
  })

  it("links to Notification settings on the Market & watchlist tab", () => {
    renderTab()
    const link = screen.getByRole("link", {
      name: "Open Notification settings",
    })
    expect(link.getAttribute("href")).toBe(
      "/settings?tab=notifications&group=market",
    )
  })
})
