import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/profileApi", () => ({
  useProfileBlockUserMutation: vi.fn(),
  useProfileUnblockUserMutation: vi.fn(),
}))
vi.mock("../../../contractor/api/contractorApi", () => ({
  useBlockUserForOrgMutation: vi.fn(),
  useUnblockUserForOrgMutation: vi.fn(),
}))

import * as profileApi from "../../api/profileApi"
import * as contractorApi from "../../../contractor/api/contractorApi"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import {
  useBlockUser,
  useBlockUserForOrg,
  useUnblockUser,
  useUnblockUserForOrg,
} from "../useBlocklistActions"

type P = typeof profileApi.userApi.endpoints
type C = typeof contractorApi.contractorsApi.endpoints
const block = mockMutationTrigger<P["profileBlockUser"]>()
const unblock = mockMutationTrigger<P["profileUnblockUser"]>()
const orgBlock = mockMutationTrigger<C["blockUserForOrg"]>()
const orgUnblock = mockMutationTrigger<C["unblockUserForOrg"]>()
const reject = (error: unknown) => ({ unwrap: () => Promise.reject(error) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(profileApi.useProfileBlockUserMutation).mockReturnValue([
    block,
    mutationIdle<P["profileBlockUser"]>(),
  ])
  vi.mocked(profileApi.useProfileUnblockUserMutation).mockReturnValue([
    unblock,
    mutationIdle<P["profileUnblockUser"]>(),
  ])
  vi.mocked(contractorApi.useBlockUserForOrgMutation).mockReturnValue([
    orgBlock,
    mutationIdle<C["blockUserForOrg"]>(),
  ])
  vi.mocked(contractorApi.useUnblockUserForOrgMutation).mockReturnValue([
    orgUnblock,
    mutationIdle<C["unblockUserForOrg"]>(),
  ])
})

describe("personal blocklist", () => {
  it("blocks with an optional reason and unblocks", async () => {
    const { result: b } = renderHook(() => useBlockUser())
    await expect(b.current.block("griefer", "spam")).resolves.toBe(true)
    expect(block).toHaveBeenCalledWith({ username: "griefer", reason: "spam" })
    expect(alert).toHaveBeenLastCalledWith(
      expect.objectContaining({ severity: "success" }),
    )
    const { result: u } = renderHook(() => useUnblockUser())
    await expect(u.current.unblock("griefer")).resolves.toBe(true)
    expect(unblock).toHaveBeenCalledWith("griefer")
  })

  it("alerts the API's reason when it fails", async () => {
    block.mockReturnValueOnce(reject({ data: { message: "Can't block you" } }))
    const { result } = renderHook(() => useBlockUser())
    await expect(result.current.block("me")).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith({
      message: "Can't block you",
      severity: "error",
    })
  })
})

describe("org blocklist", () => {
  it("blocks and unblocks for the org", async () => {
    const { result: b } = renderHook(() => useBlockUserForOrg("ORG"))
    await expect(b.current.block("griefer")).resolves.toBe(true)
    expect(orgBlock).toHaveBeenCalledWith({
      spectrum_id: "ORG",
      username: "griefer",
    })
    orgUnblock.mockReturnValueOnce(reject({ error: { message: "Nope" } }))
    const { result: u } = renderHook(() => useUnblockUserForOrg("ORG"))
    await expect(u.current.unblock("griefer")).resolves.toBe(false)
    expect(alert).toHaveBeenLastCalledWith({
      message: "Nope",
      severity: "error",
    })
  })
})
