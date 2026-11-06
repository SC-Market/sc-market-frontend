import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const alert = vi.fn()
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => alert,
}))
vi.mock("../../api/contractorApi", () => ({
  useCreateContractorRoleMutation: vi.fn(),
  useUpdateContractorRoleMutation: vi.fn(),
  useDeleteContractorRoleMutation: vi.fn(),
}))

import * as contractorApi from "../../api/contractorApi"
import type { ContractorRole } from "../../domain/types"
import {
  mockMutationTrigger,
  mutationIdle,
} from "../../../../__tests__/rtkQueryMocks"
import { useOrgRoleActions } from "../useOrgRoleActions"

type C = typeof contractorApi.contractorsApi.endpoints
const create = mockMutationTrigger<C["createContractorRole"]>()
const update = mockMutationTrigger<C["updateContractorRole"]>()
const remove = mockMutationTrigger<C["deleteContractorRole"]>()

const role = {
  role_id: "r1",
  contractor_id: "c1",
  name: "Hauler",
  position: 3,
  manage_roles: false,
  manage_orders: true,
  kick_members: false,
  manage_invites: false,
  manage_org_details: false,
  manage_stock: false,
  manage_market: false,
  manage_webhooks: false,
  manage_recruiting: false,
  manage_blocklist: false,
  claim_orders: true,
  manage_theme: false,
} as ContractorRole

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(contractorApi.useCreateContractorRoleMutation).mockReturnValue([
    create,
    mutationIdle<C["createContractorRole"]>(),
  ])
  vi.mocked(contractorApi.useUpdateContractorRoleMutation).mockReturnValue([
    update,
    mutationIdle<C["updateContractorRole"]>(),
  ])
  vi.mocked(contractorApi.useDeleteContractorRoleMutation).mockReturnValue([
    remove,
    mutationIdle<C["deleteContractorRole"]>(),
  ])
})

describe("useOrgRoleActions", () => {
  it("creates a role without its ids or position", async () => {
    const { result } = renderHook(() => useOrgRoleActions("ORG"))
    await expect(result.current.create(role)).resolves.toBe(true)
    const body = create.mock.calls[0][0].body
    expect(create.mock.calls[0][0].contractor).toBe("ORG")
    expect(body).not.toHaveProperty("role_id")
    expect(body).not.toHaveProperty("contractor_id")
    expect(body).not.toHaveProperty("position")
    expect(body.name).toBe("Hauler")
  })

  it("updates a role keeping its position, and deletes one", async () => {
    const { result } = renderHook(() => useOrgRoleActions("ORG"))
    await result.current.update("r1", role)
    const arg = update.mock.calls[0][0]
    expect(arg).toMatchObject({ contractor: "ORG", role_id: "r1" })
    expect(arg.body.position).toBe(3)
    expect(arg.body).not.toHaveProperty("role_id")
    await result.current.remove("r1")
    expect(remove).toHaveBeenCalledWith({ contractor: "ORG", role_id: "r1" })
    expect(alert).toHaveBeenCalledTimes(2)
  })

  it("alerts the error when creating fails", async () => {
    create.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 403, data: {} }),
    })
    const { result } = renderHook(() => useOrgRoleActions("ORG"))
    await expect(result.current.create(role)).resolves.toBe(false)
    expect(alert).toHaveBeenCalledWith({ status: 403, data: {} })
  })
})
