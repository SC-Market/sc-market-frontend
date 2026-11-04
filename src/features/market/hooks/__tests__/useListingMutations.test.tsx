import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("../../../../store/api/v2/market", () => ({
  useCreateListingMutation: vi.fn(),
  useUpdateListingMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api, CreateListingRequest } from "../../../../store/api/v2/market"
import { mockMutationTrigger, mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import {
  useCreateListingSubmit,
  useListingStatusActions,
  useQuickEditListing,
  useUpdateListingSubmit,
} from "../useListingMutations"

type E = typeof marketV2Api.endpoints
const createListing = mockMutationTrigger<E["createListing"]>()
const updateListing = mockMutationTrigger<E["updateListing"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useCreateListingMutation).mockReturnValue([createListing, mutationIdle<E["createListing"]>()])
  vi.mocked(market.useUpdateListingMutation).mockReturnValue([updateListing, mutationIdle<E["updateListing"]>()])
})

const request = { title: "Laser", game_item_id: "gi", pricing_mode: "unified", lots: [] } as unknown as CreateListingRequest

describe("useCreateListingSubmit", () => {
  it("returns the new listing's id", async () => {
    createListing.mockReturnValueOnce({ unwrap: () => Promise.resolve({ listing_id: "L9" }) })
    const { result } = renderHook(() => useCreateListingSubmit())
    await expect(result.current.submit(request)).resolves.toEqual({ ok: true, listingId: "L9" })
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("returns the API's error for the form", async () => {
    createListing.mockReturnValueOnce({
      unwrap: () => Promise.reject({ data: { error: { message: "Title too long" } } }),
    })
    const { result } = renderHook(() => useCreateListingSubmit())
    const saved = await result.current.submit(request)
    expect(saved.ok).toBe(false)
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })
})

describe("useUpdateListingSubmit", () => {
  it("sends the changes for that listing", async () => {
    const { result } = renderHook(() => useUpdateListingSubmit())
    await expect(result.current.submit("L1", { title: "New" })).resolves.toEqual({ ok: true, listingId: "L1" })
    expect(updateListing).toHaveBeenCalledWith({ id: "L1", updateListingRequest: { title: "New" } })
  })
})

describe("useListingStatusActions", () => {
  it.each([
    ["activate", "active"],
    ["deactivate", "inactive"],
    ["archive", "cancelled"],
  ] as const)("%s sets status %s", async (action, status) => {
    const { result } = renderHook(() => useListingStatusActions())
    await expect(result.current[action]("L1")).resolves.toBe(true)
    expect(updateListing).toHaveBeenCalledWith({ id: "L1", updateListingRequest: { status } })
  })

  it("resolves false and alerts when it fails", async () => {
    updateListing.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error("x")) })
    const { result } = renderHook(() => useListingStatusActions())
    await expect(result.current.archive("L1")).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })
})

describe("useCreateListingSubmit with its own message", () => {
  it("alerts the given success message", async () => {
    createListing.mockReturnValueOnce({ unwrap: () => Promise.resolve({ listing_id: "L2" }) })
    const { result } = renderHook(() => useCreateListingSubmit("Listing created."))
    await result.current.submit(request)
    expect(alert).toHaveBeenCalledWith({ message: "Listing created.", severity: "success" })
  })
})

describe("useQuickEditListing", () => {
  it("saves and reports the API's message on failure", async () => {
    const { result } = renderHook(() => useQuickEditListing())
    await expect(result.current.save("L1", { base_price: 9 })).resolves.toBe(true)
    expect(updateListing).toHaveBeenCalledWith({ id: "L1", updateListingRequest: { base_price: 9 } })
    updateListing.mockReturnValueOnce({ unwrap: () => Promise.reject({ data: { message: "Locked" } }) })
    await expect(result.current.save("L1", { base_price: 9 })).resolves.toBe(false)
    expect(alert).toHaveBeenLastCalledWith({ message: "Locked", severity: "error" })
  })
})
