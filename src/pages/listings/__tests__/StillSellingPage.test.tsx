import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
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
  useSendStillSellingFeedbackMutation: vi.fn(),
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
const sendFeedback = vi.fn()

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
  vi.mocked(marketApi.useSendStillSellingFeedbackMutation).mockReturnValue([
    sendFeedback,
    { data: undefined, isLoading: false, isError: false },
  ] as unknown as ReturnType<
    typeof marketApi.useSendStillSellingFeedbackMutation
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
    // On a card with the question as its heading, not text on the background.
    const card = within(screen.getByTestId("still-selling-card"))
    expect(
      card.getByRole("heading", { level: 1, name: "Keep your listings live?" }),
    ).toBeInTheDocument()
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

describe("StillSellingPage feedback", () => {
  const pausedResult: StillSellingActionResult = {
    ok: true,
    action: "pause",
    changed: 2,
    listings_total: 3,
    manage_path: "/shop/my-shop/listings",
  }

  it("after pausing: optional reasons as chips, submitted with the picked ones", () => {
    setup({ ...keepPreview, action: "pause" }, pausedResult)
    expect(screen.getByText("Mind telling us why?")).toBeInTheDocument()
    const submit = screen.getByRole("button", { name: "Submit" })
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Not enough buyers" }))
    fireEvent.click(
      screen.getByRole("button", { name: "Something about SC Market" }),
    )
    fireEvent.change(
      screen.getByLabelText("What about SC Market? (optional)"),
      {
        target: { value: "Fees" },
      },
    )
    fireEvent.click(submit)
    expect(sendFeedback).toHaveBeenCalledWith({
      token: "tok123",
      stillSellingFeedbackRequest: {
        reasons: ["not_enough_buyers", "about_sc_market"],
        about_sc_market: "Fees",
      },
    })
  })

  it("after keeping: one free-text question, capped at 500", () => {
    setup(keepPreview, { ...pausedResult, action: "keep" })
    expect(
      screen.getByText("Anything that would make selling here easier?"),
    ).toBeInTheDocument()
    const box = screen.getByLabelText("Your thoughts (optional)")
    fireEvent.change(box, { target: { value: "x".repeat(700) } })
    expect((box as HTMLTextAreaElement).value).toHaveLength(500)
  })

  it("No thanks hides it; never required", () => {
    setup({ ...keepPreview, action: "pause" }, pausedResult)
    fireEvent.click(screen.getByRole("button", { name: "No thanks" }))
    expect(
      screen.queryByTestId("still-selling-feedback"),
    ).not.toBeInTheDocument()
    expect(sendFeedback).not.toHaveBeenCalled()
    expect(screen.getByText(/Done: 2 listings paused/)).toBeInTheDocument()
  })

  it("already answered from this link: thanks instead of the form", () => {
    setup(
      { ...keepPreview, action: "pause", feedback_submitted: true },
      pausedResult,
    )
    expect(screen.getByText("Thanks for telling us.")).toBeInTheDocument()
  })

  it("test links: banners say nothing is changed", () => {
    setup({ ...keepPreview, test: true })
    expect(screen.getByTestId("still-selling-test-preview")).toHaveTextContent(
      "Test mode: confirming won't change any listings.",
    )
  })

  it("test link result: no listings were changed", () => {
    setup({ ...keepPreview, test: true }, { ...pausedResult, test: true })
    expect(screen.getByTestId("still-selling-test-done")).toHaveTextContent(
      "Test mode: no listings were changed.",
    )
  })
})
