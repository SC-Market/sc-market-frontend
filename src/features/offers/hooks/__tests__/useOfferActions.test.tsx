import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
const navigate = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }))
vi.mock("../../api/offerApi", () => ({
  useAssignOfferMutation: vi.fn(),
  useUnassignOfferMutation: vi.fn(),
  useCounterOfferMutation: vi.fn(),
}))

import * as offerApi from "../../api/offerApi"
import type { CounterOfferBody } from "../../domain/types"
import {
  useClaimOffer,
  useCounterOfferSubmit,
  useOfferAssignment,
} from "../useOfferActions"

type Hook<K extends keyof typeof offerApi> = (typeof offerApi)[K] extends (
  ...a: never[]
) => infer R
  ? R
  : never
const assign = vi.fn()
const unassign = vi.fn()
const counter = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(offerApi.useAssignOfferMutation).mockReturnValue([
    assign,
    {},
  ] as unknown as Hook<"useAssignOfferMutation">)
  vi.mocked(offerApi.useUnassignOfferMutation).mockReturnValue([
    unassign,
    {},
  ] as unknown as Hook<"useUnassignOfferMutation">)
  vi.mocked(offerApi.useCounterOfferMutation).mockReturnValue([
    counter,
    { isLoading: false },
  ] as unknown as Hook<"useCounterOfferMutation">)
})

describe("useClaimOffer", () => {
  it("assigns the offer to the viewer", async () => {
    assign.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    const { result } = renderHook(() => useClaimOffer())
    await result.current("S1", "me")
    expect(assign).toHaveBeenCalledWith({ session_id: "S1", username: "me" })
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
  })
})

describe("useOfferAssignment", () => {
  it("assigns, and explains a failure", async () => {
    assign.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({
      error: { status: 400, data: { error: "Not a member" } },
    })
    const { result } = renderHook(() => useOfferAssignment("S1"))
    await result.current.assign("bob")
    expect(assign).toHaveBeenCalledWith({ session_id: "S1", username: "bob" })
    expect(alert).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
    await result.current.assign("bob")
    expect(alert).toHaveBeenLastCalledWith({
      message: expect.stringContaining("Not a member"),
      severity: "error",
    })
  })

  it("unassigns", async () => {
    unassign.mockResolvedValueOnce({ data: {} })
    const { result } = renderHook(() => useOfferAssignment("S1"))
    await result.current.unassign()
    expect(unassign).toHaveBeenCalledWith({ session_id: "S1" })
  })
})

describe("useCounterOfferSubmit", () => {
  it("submits the body and goes back to the offer", async () => {
    counter.mockReturnValue({ unwrap: () => Promise.resolve() })
    const { result } = renderHook(() => useCounterOfferSubmit("S1"))
    const body = { session_id: "S1" } as CounterOfferBody
    await result.current.submit(body)
    expect(counter).toHaveBeenCalledWith(body)
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining("S1"))
  })
})
