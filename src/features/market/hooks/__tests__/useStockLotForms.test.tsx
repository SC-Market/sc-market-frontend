import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("../../../../store/api/v2/market", () => ({
  useCreateStockLotMutation: vi.fn(),
  useDeleteStockLotMutation: vi.fn(),
  useUpdateStockLotMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api } from "../../../../store/api/v2/market"
import { mockMutationTrigger, mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import { useCreateLot, useEditLot, useTransferLot } from "../useStockLotActions"

type E = typeof marketV2Api.endpoints
const createStockLot = mockMutationTrigger<E["createStockLot"]>()
const updateStockLot = mockMutationTrigger<E["updateStockLot"]>()
const reject = (data: unknown) => ({ unwrap: () => Promise.reject({ data }) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useCreateStockLotMutation).mockReturnValue([createStockLot, mutationIdle<E["createStockLot"]>()])
  vi.mocked(market.useUpdateStockLotMutation).mockReturnValue([updateStockLot, mutationIdle<E["updateStockLot"]>()])
  vi.mocked(market.useDeleteStockLotMutation).mockReturnValue([mockMutationTrigger<E["deleteStockLot"]>(), mutationIdle<E["deleteStockLot"]>()])
})

describe("useCreateLot", () => {
  it("creates the lot", async () => {
    const { result } = renderHook(() => useCreateLot())
    const request = { item_id: "I1", quantity: 3, variant_attributes: { quality_tier: 3 } }
    await expect(result.current(request)).resolves.toBe(true)
    expect(createStockLot).toHaveBeenCalledWith({ createStockLotRequest: request })
    createStockLot.mockReturnValueOnce(reject({}))
    await expect(result.current(request)).resolves.toBe(false)
  })
})

describe("useEditLot", () => {
  it("warns when the stock is committed to orders", async () => {
    updateStockLot.mockReturnValueOnce(reject({ details: { code: "INVALID_QUANTITY" } }))
    const { result } = renderHook(() => useEditLot())
    await expect(result.current.save("lot-1", { quantity_total: 0 })).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })

  it("errors otherwise", async () => {
    updateStockLot.mockReturnValueOnce(reject({ code: "OTHER" }))
    const { result } = renderHook(() => useEditLot())
    await result.current.save("lot-1", { quantity_total: 0 })
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })
})

describe("useTransferLot", () => {
  it("moves the lot to the new location", async () => {
    const { result } = renderHook(() => useTransferLot())
    await expect(result.current.transfer("lot-1", "loc-2")).resolves.toBe(true)
    expect(updateStockLot).toHaveBeenCalledWith({ id: "lot-1", updateStockLotRequest: { location_id: "loc-2" } })
  })
})
