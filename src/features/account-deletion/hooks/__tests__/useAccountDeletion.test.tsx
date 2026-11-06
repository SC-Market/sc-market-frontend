import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../../profile/api/profileApi", () => ({
  useAccountRequestDeletionMutation: vi.fn(),
  useAccountCancelDeletionMutation: vi.fn(),
  useLogoutMutation: vi.fn(),
}))

import * as profileApi from "../../../profile/api/profileApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useCancelAccountDeletion,
  useRequestAccountDeletion,
} from "../useAccountDeletion"

type P = typeof profileApi.userApi.endpoints
const request = mockMutationTrigger<P["accountRequestDeletion"]>()
const cancel = mockMutationTrigger<P["accountCancelDeletion"]>()
const logout = mockMutationTrigger<P["logout"]>()
const originalLocation = window.location

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: "/settings" },
  })
  vi.mocked(profileApi.useAccountRequestDeletionMutation).mockReturnValue([
    request,
    mutationIdle<P["accountRequestDeletion"]>(),
  ])
  vi.mocked(profileApi.useAccountCancelDeletionMutation).mockReturnValue([
    cancel,
    mutationIdle<P["accountCancelDeletion"]>(),
  ])
  vi.mocked(profileApi.useLogoutMutation).mockReturnValue([
    logout,
    mutationIdle<P["logout"]>(),
  ])
})

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  })
})

describe("useRequestAccountDeletion", () => {
  it("schedules the deletion, logs out and goes home", async () => {
    const { result } = renderHook(() => useRequestAccountDeletion())
    await result.current.request("")
    expect(request).toHaveBeenCalledWith({ reason: undefined })
    expect(logout).toHaveBeenCalled()
    expect(window.location.href).toBe("/")
  })

  it("stays put when the request fails", async () => {
    request.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 409 }),
    })
    const { result } = renderHook(() => useRequestAccountDeletion())
    await result.current.request("moving on")
    expect(request).toHaveBeenCalledWith({ reason: "moving on" })
    expect(logout).not.toHaveBeenCalled()
    expect(window.location.href).toBe("/settings")
  })
})

describe("useCancelAccountDeletion", () => {
  it("alerts the API's message, or the error", async () => {
    cancel.mockReturnValueOnce({
      unwrap: () => Promise.resolve({ message: "Deletion cancelled" }),
    })
    const { result } = renderHook(() => useCancelAccountDeletion())
    await result.current.cancel()
    expect(alert).toHaveBeenCalledWith({
      message: "Deletion cancelled",
      severity: "success",
    })
    cancel.mockReturnValueOnce({ unwrap: () => Promise.reject({}) })
    await result.current.cancel()
    expect(alert).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: "error" }),
    )
  })
})
