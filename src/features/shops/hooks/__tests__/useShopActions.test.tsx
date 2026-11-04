import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../../../store/api/v2/market", () => ({
  useBlockUserFromShopMutation: vi.fn(),
  useCreateShopMutation: vi.fn(),
  useQuickCreateShopMutation: vi.fn(),
  useSetShopStorefrontDirectoryMutation: vi.fn(),
  useUnblockUserFromShopMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import type { marketV2Api } from "../../../../store/api/v2/market"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useCreateShop,
  useQuickCreateShop,
  useShopBlocklist,
  useShopStorefrontDirectory,
} from "../useShopActions"

type E = typeof marketV2Api.endpoints
const block = mockMutationTrigger<E["blockUserFromShop"]>()
const unblock = mockMutationTrigger<E["unblockUserFromShop"]>()
const createShop = mockMutationTrigger<E["createShop"]>()
const quick = mockMutationTrigger<E["quickCreateShop"]>()
const setDirectory = mockMutationTrigger<E["setShopStorefrontDirectory"]>()
const reject = (data: unknown) => ({
  unwrap: () => Promise.reject({ status: 400, data }),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useBlockUserFromShopMutation).mockReturnValue([
    block,
    mutationIdle<E["blockUserFromShop"]>(),
  ])
  vi.mocked(market.useUnblockUserFromShopMutation).mockReturnValue([
    unblock,
    mutationIdle<E["unblockUserFromShop"]>(),
  ])
  vi.mocked(market.useCreateShopMutation).mockReturnValue([
    createShop,
    mutationIdle<E["createShop"]>(),
  ])
  vi.mocked(market.useQuickCreateShopMutation).mockReturnValue([
    quick,
    mutationIdle<E["quickCreateShop"]>(),
  ])
  vi.mocked(market.useSetShopStorefrontDirectoryMutation).mockReturnValue([
    setDirectory,
    mutationIdle<E["setShopStorefrontDirectory"]>(),
  ])
})

describe("useShopBlocklist", () => {
  it("blocks with a reason, and unblocks", async () => {
    const { result } = renderHook(() => useShopBlocklist("shop-1"))
    await expect(result.current.block("griefer", "spam")).resolves.toBe(true)
    expect(block).toHaveBeenCalledWith({
      shopId: "shop-1",
      blockUserRequest: { username: "griefer", reason: "spam" },
    })
    await result.current.unblock("u-1", "griefer")
    expect(unblock).toHaveBeenCalledWith({
      shopId: "shop-1",
      blockedUserId: "u-1",
    })
  })

  it("alerts the API's reason", async () => {
    block.mockReturnValueOnce(reject({ message: "Can't block yourself" }))
    const { result } = renderHook(() => useShopBlocklist("shop-1"))
    await expect(result.current.block("me", "")).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith({
      severity: "error",
      message: "Can't block yourself",
    })
  })
})

describe("useCreateShop", () => {
  it("returns the slug, or the error for the slug field", async () => {
    createShop.mockReturnValueOnce({
      unwrap: () => Promise.resolve({ slug: "my-shop" }),
    })
    const { result } = renderHook(() => useCreateShop())
    const request = { name: "My Shop", slug: "my-shop" } as Parameters<
      typeof result.current.create
    >[0]
    await expect(result.current.create(request)).resolves.toEqual({
      ok: true,
      slug: "my-shop",
    })
    const error = { status: 409, data: {} }
    createShop.mockReturnValueOnce({ unwrap: () => Promise.reject(error) })
    await expect(result.current.create(request)).resolves.toEqual({
      ok: false,
      error,
    })
  })
})

describe("useQuickCreateShop", () => {
  it("creates a personal shop; announces it only when asked", async () => {
    quick.mockReturnValue({
      unwrap: () => Promise.resolve({ shop_id: "s1", name: "Mine" }),
    })
    const { result } = renderHook(() => useQuickCreateShop())
    await result.current.create()
    expect(quick).toHaveBeenCalledWith({
      quickCreateShopRequest: { owner_type: "user" },
    })
    expect(alert).not.toHaveBeenCalled()
    await result.current.create(true)
    expect(alert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
  })
})

describe("useShopStorefrontDirectory", () => {
  it("sets the directory flag", () => {
    const { result } = renderHook(() => useShopStorefrontDirectory("shop-1"))
    result.current.setShown(true)
    expect(setDirectory).toHaveBeenCalledWith({
      shopId: "shop-1",
      storefrontDirectoryRequest: { show_in_directory: true },
    })
  })
})
