/**
 * The review form is disabled, with a hint, until the order is finished
 * (fulfilled or cancelled) or has been open 14 days; the backend refuses
 * earlier reviews with 409.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import type { Order, OrderStatus } from "../../../features/orders/domain/types"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

const submitReview = vi.fn()
vi.mock("../../../features/orders/hooks/useOrderReview", () => ({
  useOrderReview: () => ({
    content: "",
    setContent: vi.fn(),
    rating: 0,
    setRating: vi.fn(),
    submitReview,
  }),
}))

import { OrderReviewArea } from "../OrderReviewArea"

const theme = createTheme({
  layoutSpacing: { component: 2, layout: 3 },
} as Parameters<typeof createTheme>[0])

const DAY = 24 * 60 * 60 * 1000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString()

function renderFor(status: OrderStatus, timestamp: string = daysAgo(1)) {
  const order = {
    order_id: "o1",
    status,
    timestamp,
    customer: "buyer",
    assigned_to: "seller",
    contractor: null,
  } as unknown as Order
  return render(
    <ThemeProvider theme={theme}>
      <OrderReviewArea asCustomer order={order} />
    </ThemeProvider>,
  )
}

const button = () =>
  screen.getByRole("button", { name: "Leave Review" })

beforeEach(() => submitReview.mockClear())

describe("OrderReviewArea", () => {
  for (const status of ["not-started", "in-progress"] as const) {
    it(`disables the review and shows a hint while the order is ${status}`, () => {
      renderFor(status)
      expect(button()).toHaveProperty("disabled", true)
      expect(screen.getByText("You can review once the order is completed or cancelled, or 14 days after it started.")).toBeTruthy()
      fireEvent.click(button())
      expect(submitReview).not.toHaveBeenCalled()
    })
  }

  for (const status of ["fulfilled", "cancelled"] as const) {
    it(`allows a review once the order is ${status}`, () => {
      renderFor(status)
      expect(button()).toHaveProperty("disabled", false)
      expect(screen.queryByText("You can review once the order is completed or cancelled, or 14 days after it started.")).toBeNull()
      fireEvent.click(button())
      expect(submitReview).toHaveBeenCalledTimes(1)
    })
  }

  for (const status of ["not-started", "in-progress"] as const) {
    it(`allows a review of a ${status} order open 14+ days`, () => {
      renderFor(status, daysAgo(15))
      expect(button()).toHaveProperty("disabled", false)
      expect(screen.queryByText("You can review once the order is completed or cancelled, or 14 days after it started.")).toBeNull()
      fireEvent.click(button())
      expect(submitReview).toHaveBeenCalledTimes(1)
    })
  }

  it("keeps an open order disabled at 13 days", () => {
    renderFor("in-progress", daysAgo(13))
    expect(button()).toHaveProperty("disabled", true)
    expect(screen.getByText("You can review once the order is completed or cancelled, or 14 days after it started.")).toBeTruthy()
  })
})
