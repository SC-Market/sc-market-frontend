import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const accept = vi.fn(() => ({ unwrap: () => Promise.resolve() }))
const decline = vi.fn(() => ({ unwrap: () => Promise.resolve() }))

vi.mock("../../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: { username: "me", contractors: [] } }),
}))
vi.mock("../../../notifications/api/notificationApi", () => ({
  useGetNotificationsQuery: () => ({
    data: {
      notifications: [
        { action: "contractor_invite", entity: { spectrum_id: "ACME" } },
      ],
    },
  }),
}))
vi.mock("../../api/contractorApi", () => ({
  useAcceptContractorInviteMutation: () => [accept, { isLoading: false }],
  useDeclineContractorInviteMutation: () => [decline, { isLoading: false }],
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../../components/buttons/ShareButton", () => ({
  ShareButton: () => null,
}))
vi.mock("../../../../views/contractor/ContractorList", () => ({
  contractorKindIcons: {},
}))

import { OrgHeader } from "../OrgHeader"

const org = {
  spectrum_id: "ACME",
  name: "Acme",
  avatar: "",
  fields: [],
  size: 1,
  description: "",
} as never

describe("OrgHeader pending invite (where the invite push opens)", () => {
  beforeEach(() => {
    accept.mockClear()
    decline.mockClear()
  })

  it("offers Join and Decline for a pending invite", () => {
    render(
      <MemoryRouter>
        <OrgHeader contractor={org} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Decline" }))
    expect(decline).toHaveBeenCalledWith({ contractor: "ACME" })
    fireEvent.click(screen.getByRole("button", { name: "Join Organization" }))
    expect(accept).toHaveBeenCalledWith({ contractor: "ACME" })
  })
})
