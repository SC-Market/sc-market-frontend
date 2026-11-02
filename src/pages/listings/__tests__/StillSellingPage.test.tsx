import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as marketApi from "../../../store/api/v2/market"
import type {
  StillSellingActionPreview,
  StillSellingActionResult,
} from "../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetStillSellingActionQuery: vi.fn(),
  useConfirmStillSellingActionMutation: vi.fn(),
}))
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

import { StillSellingPage } from "../StillSellingPage"

const confirm = vi.fn()

function setup(
  preview: StillSellingActionPreview | undefined,
  result?: StillSellingActionResult,
) {
  vi.mocked(marketApi.useGetStillSellingActionQuery).mockReturnValue({
    data: preview,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof marketApi.useGetStillSellingActionQuery>)
  vi.mocked(marketApi.useConfirmStillSellingActionMutation).mockReturnValue([
    confirm,
    { data: result, isLoading: false, isError: false },
  ] as unknown as ReturnType<
    typeof marketApi.useConfirmStillSellingActionMutation
  >)
  render(
    <MemoryRouter initialEntries={["/still-selling/tok123"]}>
      <Routes>
        <Route path="/still-selling/:token" element={<StillSellingPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const keepPreview: StillSellingActionPreview = {
  valid: true,
  action: "keep",
  listings_total: 3,
  listings_applicable: 2,
  listings: [
    { title: "Quantainium", status: "active" },
    { title: "Laranite", status: "expired" },
  ],
  manage_path: "/shop/my-shop/listings",
  used_at: null,
}

beforeEach(() => vi.clearAllMocks())

describe("StillSellingPage", () => {
  it("keep: lists what it refreshes and asks to confirm before doing anything", () => {
    setup(keepPreview)
    expect(screen.getByText("Keep your listings live?")).toBeInTheDocument()
    expect(screen.getByText(/This refreshes 2 listings/)).toBeInTheDocument()
    expect(screen.getByText("Quantainium")).toBeInTheDocument()
    expect(confirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Keep them live" }))
    expect(confirm).toHaveBeenCalledWith({ token: "tok123" })
  })

  it("pause: says nothing is deleted", () => {
    setup({
      ...keepPreview,
      action: "pause",
      listings_applicable: 1,
      listings: [{ title: "Quantainium", status: "active" }],
    })
    expect(screen.getByText("Pause your listings?")).toBeInTheDocument()
    expect(
      screen.getByText(/hidden from the market, not deleted/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Pause them" }),
    ).toBeInTheDocument()
  })

  it("shows the result after confirming", () => {
    setup(keepPreview, {
      ok: true,
      action: "keep",
      changed: 2,
      listings_total: 3,
      manage_path: "/shop/my-shop/listings",
    })
    expect(screen.getByText("Done: 2 listings refreshed.")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Manage listings" }),
    ).toHaveAttribute("href", "/shop/my-shop/listings")
  })

  it("an expired link says so, an invalid one too", () => {
    setup({
      valid: false,
      reason: "expired",
      listings_total: 0,
      listings_applicable: 0,
      listings: [],
    })
    expect(screen.getByText(/This link has expired/)).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Keep them live" }),
    ).not.toBeInTheDocument()
  })

  it("an invalid link", () => {
    setup({
      valid: false,
      reason: "invalid",
      listings_total: 0,
      listings_applicable: 0,
      listings: [],
    })
    expect(screen.getByText(/This link doesn't work/)).toBeInTheDocument()
  })

  it("nothing left to do", () => {
    setup({ ...keepPreview, listings_applicable: 0, listings: [] })
    expect(screen.getByText(/Nothing to refresh/)).toBeInTheDocument()
  })
})
