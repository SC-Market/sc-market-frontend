import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../../profile/api/profileApi", () => ({
  useProfileCreateWebhook: vi.fn(),
  useProfileDeleteWebhook: vi.fn(),
  useProfileUseOfficialDiscordSettingsMutation: vi.fn(),
}))
vi.mock("../../../contractor/api/contractorApi", () => ({
  useCreateContractorWebhookMutation: vi.fn(),
  useDeleteContractorWebhookMutation: vi.fn(),
  useUseOfficialDiscordSettingsMutation: vi.fn(),
}))

import * as profileApi from "../../../profile/api/profileApi"
import * as contractorApi from "../../../contractor/api/contractorApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useCreateWebhook,
  useDeleteWebhook,
} from "../useNotificationChannelActions"

type P = typeof profileApi.userApi.endpoints
type C = typeof contractorApi.contractorsApi.endpoints
const createUser = mockMutationTrigger<P["profileCreateWebhook"]>()
const createOrg = mockMutationTrigger<C["createContractorWebhook"]>()
const deleteUser = vi.fn()
const deleteOrg = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(profileApi.useProfileCreateWebhook).mockReturnValue([
    createUser,
    mutationIdle<P["profileCreateWebhook"]>(),
  ])
  vi.mocked(contractorApi.useCreateContractorWebhookMutation).mockReturnValue([
    createOrg,
    mutationIdle<C["createContractorWebhook"]>(),
  ])
  vi.mocked(profileApi.useProfileDeleteWebhook).mockReturnValue([
    deleteUser as never,
    mutationIdle<P["profileDeleteWebhook"]>(),
  ])
  vi.mocked(contractorApi.useDeleteContractorWebhookMutation).mockReturnValue([
    deleteOrg as never,
    mutationIdle<C["deleteContractorWebhook"]>(),
  ])
})

describe("useCreateWebhook", () => {
  it("creates an org webhook for the org, a personal one otherwise", async () => {
    const { result: org } = renderHook(() => useCreateWebhook(true, "ORG"))
    await org.current("Orders", "https://hook", ["order_create"])
    expect(createOrg).toHaveBeenCalledWith({
      contractor: "ORG",
      body: {
        name: "Orders",
        webhook_url: "https://hook",
        actions: ["order_create"],
      },
    })
    const { result: mine } = renderHook(() => useCreateWebhook(false))
    await mine.current("Mine", "https://hook", [])
    expect(createUser).toHaveBeenCalledWith({
      name: "Mine",
      webhook_url: "https://hook",
      actions: [],
    })
    expect(alert).toHaveBeenCalledTimes(2)
  })
})

describe("useDeleteWebhook", () => {
  it("alerts success, or the API's reason", async () => {
    deleteOrg.mockResolvedValueOnce({ data: undefined })
    const { result } = renderHook(() => useDeleteWebhook(true, "ORG"))
    await result.current("w1")
    expect(deleteOrg).toHaveBeenCalledWith({
      contractor: "ORG",
      webhook_id: "w1",
    })
    expect(alert).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
    deleteOrg.mockResolvedValueOnce({
      error: { status: 403, data: { message: "No permission" } },
    })
    await result.current("w1")
    expect(alert).toHaveBeenLastCalledWith({
      message: expect.stringContaining("No permission"),
      severity: "error",
    })
  })
})
