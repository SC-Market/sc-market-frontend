/**
 * The review form is disabled, with a hint, until the order is finished
 * (fulfilled or cancelled); the backend refuses earlier reviews with 409.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import type { Order, OrderStatus } from "../../../features/orders/domain/types"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

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

function renderFor(status: OrderStatus) {
  const order = {
    order_id: "o1",
    status,
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
  screen.getByRole("button", { name: /orderReviewArea.leaveReviewButton/ })

beforeEach(() => submitReview.mockClear())

describe("OrderReviewArea", () => {
  for (const status of ["not-started", "in-progress"] as const) {
    it(`disables the review and shows a hint while the order is ${status}`, () => {
      renderFor(status)
      expect(button()).toHaveProperty("disabled", true)
      expect(screen.getByText("orderReviewArea.notFinishedHint")).toBeTruthy()
      fireEvent.click(button())
      expect(submitReview).not.toHaveBeenCalled()
    })
  }

  for (const status of ["fulfilled", "cancelled"] as const) {
    it(`allows a review once the order is ${status}`, () => {
      renderFor(status)
      expect(button()).toHaveProperty("disabled", false)
      expect(screen.queryByText("orderReviewArea.notFinishedHint")).toBeNull()
      fireEvent.click(button())
      expect(submitReview).toHaveBeenCalledTimes(1)
    })
  }
})
