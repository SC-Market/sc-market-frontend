import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => alert }))
vi.mock("../../../../store/api/v2/market-overrides", () => ({ useUploadImageMutation: vi.fn() }))
vi.mock("../../../../store/api/v2/market", () => ({
  useCreateShopWebhookMutation: vi.fn(),
  useDeleteShopOrderSettingMutation: vi.fn(),
  useDeleteShopWebhookMutation: vi.fn(),
  useTransferShopMutation: vi.fn(),
  useUpdateShopMutation: vi.fn(),
  useUpsertShopOrderSettingMutation: vi.fn(),
}))

import * as market from "../../../../store/api/v2/market"
import * as overrides from "../../../../store/api/v2/market-overrides"
import type { marketV2Api } from "../../../../store/api/v2/market"
import { mockMutationTrigger, mutationIdle } from "../../../../__tests__/rtkQueryMocks"
import {
  useSaveShopOrderSettings,
  useSaveShopSettings,
  useShopWebhooks,
  useTransferShop,
  useUploadShopImage,
} from "../useShopSettingsActions"

type E = typeof marketV2Api.endpoints
const updateShop = mockMutationTrigger<E["updateShop"]>()
const upsert = mockMutationTrigger<E["upsertShopOrderSetting"]>()
const del = mockMutationTrigger<E["deleteShopOrderSetting"]>()
const transfer = mockMutationTrigger<E["transferShop"]>()
const createWebhook = mockMutationTrigger<E["createShopWebhook"]>()
const deleteWebhook = mockMutationTrigger<E["deleteShopWebhook"]>()
const upload = vi.fn()
const reject = (data: unknown) => ({ unwrap: () => Promise.reject({ status: 400, data }) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(market.useUpdateShopMutation).mockReturnValue([updateShop, mutationIdle<E["updateShop"]>()])
  vi.mocked(market.useUpsertShopOrderSettingMutation).mockReturnValue([upsert, mutationIdle<E["upsertShopOrderSetting"]>()])
  vi.mocked(market.useDeleteShopOrderSettingMutation).mockReturnValue([del, mutationIdle<E["deleteShopOrderSetting"]>()])
  vi.mocked(market.useTransferShopMutation).mockReturnValue([transfer, mutationIdle<E["transferShop"]>()])
  vi.mocked(market.useCreateShopWebhookMutation).mockReturnValue([createWebhook, mutationIdle<E["createShopWebhook"]>()])
  vi.mocked(market.useDeleteShopWebhookMutation).mockReturnValue([deleteWebhook, mutationIdle<E["deleteShopWebhook"]>()])
  vi.mocked(overrides.useUploadImageMutation).mockReturnValue([upload, {}] as unknown as ReturnType<typeof overrides.useUploadImageMutation>)
})

describe("useSaveShopOrderSettings", () => {
  it("sends the upserts and deletes in order", async () => {
    const { result } = renderHook(() => useSaveShopOrderSettings("shop-1"))
    await result.current([
      { op: "upsert", settingType: "allocation_mode", message_content: "manual", enabled: true },
      { op: "delete", settingType: "min_order_size" },
    ])
    expect(upsert).toHaveBeenCalledWith({
      shopId: "shop-1",
      settingType: "allocation_mode",
      upsertShopOrderSettingRequest: { message_content: "manual", enabled: true },
    })
    expect(del).toHaveBeenCalledWith({ shopId: "shop-1", settingType: "min_order_size" })
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("stops at the first failure", async () => {
    upsert.mockReturnValueOnce(reject({ message: "bad" }))
    const { result } = renderHook(() => useSaveShopOrderSettings("shop-1"))
    await result.current([
      { op: "upsert", settingType: "a", message_content: "", enabled: true },
      { op: "delete", settingType: "b" },
    ])
    expect(del).not.toHaveBeenCalled()
  })
})

describe("useSaveShopSettings", () => {
  it("returns the error so the slug field can explain it", async () => {
    const error = { status: 409, data: { error: { code: "SLUG_TAKEN" } } }
    updateShop.mockReturnValueOnce({ unwrap: () => Promise.reject(error) })
    const { result } = renderHook(() => useSaveShopSettings("shop-1"))
    await expect(result.current.save({ name: "x" })).resolves.toEqual({ ok: false, error })
  })
})

describe("useTransferShop", () => {
  it("returns the shop's slug", async () => {
    transfer.mockReturnValueOnce({ unwrap: () => Promise.resolve({ slug: "my-shop" }) })
    const { result } = renderHook(() => useTransferShop("shop-1"))
    await expect(result.current.transfer({ target_type: "contractor", target_id: "ORG" })).resolves.toBe("my-shop")
    expect(transfer).toHaveBeenCalledWith({
      shopId: "shop-1",
      transferShopRequest: { target_type: "contractor", target_id: "ORG" },
    })
  })
})

describe("useShopWebhooks", () => {
  it("creates and removes webhooks", async () => {
    const { result } = renderHook(() => useShopWebhooks("shop-1"))
    const request = { name: "Hook", webhook_url: "https://x", actions: ["order.created"] }
    await expect(result.current.create(request)).resolves.toBe(true)
    expect(createWebhook).toHaveBeenCalledWith({ shopId: "shop-1", createShopWebhookRequest: request })
    await result.current.remove("wh-1")
    expect(deleteWebhook).toHaveBeenCalledWith({ shopId: "shop-1", webhookId: "wh-1" })
  })
})

describe("useUploadShopImage", () => {
  it("returns the upload, or null when it fails", async () => {
    upload
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ resource_id: "r1", url: "u" }) })
      .mockReturnValueOnce(reject({}))
    const { result } = renderHook(() => useUploadShopImage())
    const file = new File(["x"], "a.png")
    await expect(result.current.upload(file)).resolves.toEqual({ resource_id: "r1", url: "u" })
    await expect(result.current.upload(file)).resolves.toBeNull()
  })
})
