import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

const alert = vi.fn()
const assign = vi.fn(() => ({
  unwrap: () => Promise.reject({ message: "Taken" }),
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/ordersApi", () => ({
  useAssignOrderMutation: () => [assign],
}))

import { useClaimOrder } from "../useClaimOrder"

describe("useClaimOrder", () => {
  it("assigns the order to the viewer and alerts a failure", async () => {
    const { result } = renderHook(() => useClaimOrder())
    await result.current("O1", "me")
    expect(assign).toHaveBeenCalledWith({ order_id: "O1", username: "me" })
    expect(alert).toHaveBeenCalledWith({ message: "Taken" })
  })
})
