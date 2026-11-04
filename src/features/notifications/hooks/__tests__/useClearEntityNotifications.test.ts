import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const deleteNotifications = vi.fn()
const query = vi.fn()
vi.mock("../../api/notificationApi", () => ({
  useGetNotificationsQuery: (arg: unknown) => query(arg),
  useNotificationDeleteMutation: () => [deleteNotifications],
}))

import { useClearEntityNotifications } from "../useClearEntityNotifications"

beforeEach(() => vi.clearAllMocks())

describe("useClearEntityNotifications", () => {
  it("clears the entity's message notifications", () => {
    query.mockReturnValue({ data: { notifications: [{ notification_id: "n1" }, { notification_id: "n2" }] } })
    renderHook(() => useClearEntityNotifications("order_message", "O1"))
    expect(query).toHaveBeenCalledWith({ page: 0, pageSize: 100, action: "order_message", entityId: "O1" })
    expect(deleteNotifications).toHaveBeenCalledWith(["n1", "n2"])
  })

  it("does nothing when there are none", () => {
    query.mockReturnValue({ data: { notifications: [] } })
    renderHook(() => useClearEntityNotifications("offer_message", "S1"))
    expect(deleteNotifications).not.toHaveBeenCalled()
  })
})
