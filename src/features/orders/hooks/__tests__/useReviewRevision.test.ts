import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
const requestRevision = vi.fn()
const updateReview = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/ordersApi", () => ({
  useRequestReviewRevisionMutation: () => [
    requestRevision,
    { isLoading: false },
  ],
  useUpdateOrderReviewMutation: () => [updateReview, { isLoading: false }],
}))

import { useRequestReviewRevision, useUpdateReview } from "../useReviewRevision"

const ok = { unwrap: () => Promise.resolve({}) }
const fail = { unwrap: () => Promise.reject({ message: "Nope" }) }
beforeEach(() => vi.clearAllMocks())

describe("useRequestReviewRevision", () => {
  it("asks for a revision; resolves to whether it worked", async () => {
    requestRevision.mockReturnValueOnce(ok).mockReturnValueOnce(fail)
    const { result } = renderHook(() => useRequestReviewRevision())
    const args = { reviewId: "R1", orderId: "O1", message: "Typo" }
    await expect(result.current.request(args)).resolves.toBe(true)
    expect(requestRevision).toHaveBeenCalledWith(args)
    await expect(result.current.request(args)).resolves.toBe(false)
    expect(alert).toHaveBeenLastCalledWith({ message: "Nope" })
  })
})

describe("useUpdateReview", () => {
  it("saves the revised review", async () => {
    updateReview.mockReturnValueOnce(ok)
    const { result } = renderHook(() => useUpdateReview())
    const args = { reviewId: "R1", orderId: "O1", content: "Better", rating: 5 }
    await expect(result.current.update(args)).resolves.toBe(true)
    expect(updateReview).toHaveBeenCalledWith(args)
  })
})
