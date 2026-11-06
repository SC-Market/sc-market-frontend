import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../api/wishlistsApi", () => ({
  useAddWishlistItemMutation: vi.fn(),
  useRemoveWishlistItemMutation: vi.fn(),
  useUpdateWishlistItemMutation: vi.fn(),
  useUpdateWishlistMutation: vi.fn(),
}))

import * as wishlistsApi from "../../api/wishlistsApi"
import type { marketV2Api } from "../../../../store/api/v2/market"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useWishlistItemActions,
  useWishlistSharing,
} from "../useWishlistActions"

type E = typeof marketV2Api.endpoints
const update = mockMutationTrigger<E["updateWishlist"]>()
const updateItem = mockMutationTrigger<E["updateWishlistItem"]>()
const removeItem = mockMutationTrigger<E["removeWishlistItem"]>()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(wishlistsApi.useUpdateWishlistMutation).mockReturnValue([
    update,
    mutationIdle<E["updateWishlist"]>(),
  ])
  vi.mocked(wishlistsApi.useUpdateWishlistItemMutation).mockReturnValue([
    updateItem,
    mutationIdle<E["updateWishlistItem"]>(),
  ])
  vi.mocked(wishlistsApi.useRemoveWishlistItemMutation).mockReturnValue([
    removeItem,
    mutationIdle<E["removeWishlistItem"]>(),
  ])
})

describe("useWishlistSharing", () => {
  it("makes the list public, or reports why not", async () => {
    const { result } = renderHook(() => useWishlistSharing("w1"))
    const ok = await result.current.setPublic(true)
    expect("success" in ok).toBe(true)
    expect(update).toHaveBeenCalledWith({
      wishlistId: "w1",
      updateWishlistRequest: { is_public: true },
    })
    update.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 500 }),
    })
    const failed = await result.current.setCollaborative(true)
    expect("error" in failed).toBe(true)
  })
})

describe("useWishlistItemActions", () => {
  it("changes a quantity and removes an item", () => {
    const { result } = renderHook(() => useWishlistItemActions("w1"))
    result.current.setQuantity("i1", 3)
    expect(updateItem).toHaveBeenCalledWith({
      wishlistId: "w1",
      itemId: "i1",
      updateWishlistItemRequest: { desired_quantity: 3 },
    })
    result.current.remove("i1")
    expect(removeItem).toHaveBeenCalledWith({ wishlistId: "w1", itemId: "i1" })
  })
})
