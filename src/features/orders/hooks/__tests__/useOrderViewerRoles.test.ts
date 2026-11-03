import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../../profile/api/profileApi", () => ({ useGetUserProfileQuery: vi.fn() }))
vi.mock("../../../contractor/api/contractorApi", () => ({ useGetContractorBySpectrumIDQuery: vi.fn() }))

import * as profileApi from "../../../profile/api/profileApi"
import * as contractorApi from "../../../contractor/api/contractorApi"
import { useOrderViewerRoles } from "../useOrderViewerRoles"

const profileQuery = vi.mocked(profileApi.useGetUserProfileQuery)
const contractorQuery = vi.mocked(contractorApi.useGetContractorBySpectrumIDQuery)
type ProfileResult = ReturnType<typeof profileApi.useGetUserProfileQuery>
type ContractorResult = ReturnType<typeof contractorApi.useGetContractorBySpectrumIDQuery>

const org = {
  spectrum_id: "ORG",
  owner_role: "owner",
  roles: [{ role_id: "manager", manage_orders: true, claim_orders: false }],
}

describe("useOrderViewerRoles", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches the org only for its members, and reads their permissions from it", () => {
    profileQuery.mockReturnValue({
      data: { username: "me", contractors: [{ spectrum_id: "ORG", role: "manager", roles: ["manager"] }] },
    } as unknown as ProfileResult)
    contractorQuery.mockReturnValue({ data: org } as unknown as ContractorResult)
    const { result } = renderHook(() =>
      useOrderViewerRoles({ customer: "buyer", assignedTo: null, contractor: "ORG" }),
    )
    expect(contractorQuery).toHaveBeenCalledWith("ORG", { skip: false })
    expect(result.current).toMatchObject({ orgMember: true, orgManager: true, orgClaimer: false, customer: false })
  })

  it("doesn't fetch the org for non-members", () => {
    profileQuery.mockReturnValue({ data: { username: "buyer" } } as unknown as ProfileResult)
    contractorQuery.mockReturnValue({ data: undefined } as unknown as ContractorResult)
    const { result } = renderHook(() =>
      useOrderViewerRoles({ customer: "buyer", assignedTo: null, contractor: "ORG" }),
    )
    expect(contractorQuery).toHaveBeenCalledWith("ORG", { skip: true })
    expect(result.current).toMatchObject({ customer: true, related: true, orgMember: false })
  })
})
