import "../../v2/__tests__/setup"
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  session: { status: "anonymous" } as { status: string; profile?: unknown },
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)
vi.mock("../../../../hooks/login/useSession", () => ({ useSession: () => h.session }))
vi.mock("../QuickListDialog", () => ({
  QuickListDialog: (props: { item?: { name: string } | null }) => (
    <div role="dialog" aria-label="Quick List">
      {props.item?.name}
    </div>
  ),
}))

import { QuickListProvider, SellYoursButton } from "../SellYours"

const ITEM = { id: "item-1", name: "Irradiated Valakkar Fang (Apex)", type: "Other" }

function Where() {
  const location = useLocation()
  return <div data-testid="where">{location.pathname + location.search}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/market/aggregate/:id"
          element={
            <QuickListProvider item={ITEM}>
              <SellYoursButton />
              <Where />
            </QuickListProvider>
          }
        />
        <Route path="/login" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  h.session = { status: "anonymous" }
})

describe("Sell yours", () => {
  it("asks a signed-out visitor to sign in, and comes back with Quick List open", () => {
    renderAt("/market/aggregate/fang?tab=1")
    fireEvent.click(screen.getByRole("button", { name: "Sell yours" }))
    expect(screen.getByText("Sign in to sell")).toBeInTheDocument()
    expect(screen.getByText(/straight back to listing Irradiated Valakkar Fang \(Apex\)/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(screen.getByTestId("where")).toHaveTextContent(
      `/login?redirect=${encodeURIComponent("/market/aggregate/fang?tab=1&sell=1")}`,
    )
  })

  it("opens Quick List with the page's item once back from signing in, and drops the marker", async () => {
    h.session = { status: "authenticated", profile: {} }
    renderAt("/market/aggregate/fang?tab=1&sell=1")
    expect(await screen.findByRole("dialog", { name: "Quick List" })).toHaveTextContent(ITEM.name)
    expect(screen.getByTestId("where")).toHaveTextContent("/market/aggregate/fang?tab=1")
    expect(screen.getByTestId("where")).not.toHaveTextContent("sell=1")
  })

  it("opens Quick List right away when signed in", async () => {
    h.session = { status: "authenticated", profile: {} }
    renderAt("/market/aggregate/fang")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Sell yours" }))
    expect(await screen.findByRole("dialog", { name: "Quick List" })).toBeInTheDocument()
  })
})
