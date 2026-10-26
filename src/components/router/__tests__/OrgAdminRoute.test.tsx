/**
 * OrgAdminRoute: the current org loaded but the user's roles lack the
 * permission → a "no permission" empty state linking to the org page, and the
 * page is ready (it used to render nothing and stay busy).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import "../../../util/i18n"
import type {
  Contractor,
  ContractorRole,
} from "../../../features/contractor/domain/types"
import type { UserProfileState } from "../../../hooks/login/UserProfile"
import {
  PageReadyProvider,
  usePageReadyAttributes,
} from "../../metadata/PageReady"

const ORG = "TESTORG"

const { state } = vi.hoisted(() => ({
  state: {
    contractor: undefined as Contractor | undefined,
    profile: undefined as UserProfileState | undefined,
  },
}))

vi.mock("react-cookie", () => ({
  useCookies: () => [{ current_contractor: ORG }],
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({
    data: state.contractor,
    isLoading: false,
    isSuccess: true,
    isError: false,
  }),
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: state.profile, isLoading: false }),
}))
// The real ContainerGrid pulls in the drawer, footer and their providers.
vi.mock("../../layout/ContainerGrid", () => ({
  ContainerGrid: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}))

import { OrgAdminRoute } from "../LoggedInRoute"

function role(overrides: Partial<ContractorRole>): ContractorRole {
  return {
    contractor_id: "contractor-1",
    name: "Member",
    position: 5,
    role_id: "role-member",
    manage_roles: false,
    manage_orders: false,
    kick_members: false,
    manage_invites: false,
    manage_org_details: false,
    manage_stock: false,
    manage_market: false,
    manage_recruiting: false,
    manage_webhooks: false,
    manage_blocklist: false,
    claim_orders: false,
    manage_theme: false,
    ...overrides,
  }
}

function setup(memberRole: ContractorRole) {
  state.contractor = {
    contractor_id: "contractor-1",
    kind: "organization",
    avatar: "",
    banner: "",
    rating: { avg_rating: 0, rating_count: 0, total_rating: 0, streak: 0 },
    size: 2,
    name: "Test Org",
    description: "",
    fields: [],
    spectrum_id: ORG,
    roles: [memberRole],
    default_role: memberRole.role_id,
    owner_role: "role-owner",
    balance: 0,
    market_order_template: "",
    archived: false,
  }
  state.profile = {
    username: "member",
    display_name: "Member",
    discord_username: "member",
    avatar: "",
    role: "user",
    contractors: [
      {
        avatar: "",
        name: "Test Org",
        spectrum_id: ORG,
        rating: state.contractor.rating,
        roles: [memberRole.role_id],
        role: memberRole.name,
      },
    ],
    balance: 0,
    rsi_confirmed: true,
    profile_description: "",
    settings: { discord_order_share: false, discord_public: false },
    market_order_template: "",
    locale: "en",
    onboarding_completed_at: "2024-01-01T00:00:00.000Z",
  }
}

function ReadyMain(props: { children: React.ReactNode }) {
  return <main {...usePageReadyAttributes()}>{props.children}</main>
}

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={["/org/orders"]}>
      <PageReadyProvider>
        <ReadyMain>
          <Routes>
            <Route
              element={
                <OrgAdminRoute area="orders" permission="manage_orders" />
              }
            >
              <Route path="/org/orders" element={<p>Org orders page</p>} />
            </Route>
          </Routes>
        </ReadyMain>
      </PageReadyProvider>
    </MemoryRouter>,
  )
}

describe("OrgAdminRoute without the permission", () => {
  beforeEach(() => {
    state.contractor = undefined
    state.profile = undefined
  })

  it("says so, links to the org page, and the page is ready", async () => {
    setup(role({}))
    renderGuard()
    expect(
      screen.getByRole("heading", {
        name: "You don't have permission to manage this organization's orders",
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Go to Test Org" }),
    ).toHaveAttribute("href", `/contractor/${ORG}`)
    expect(screen.queryByText("Org orders page")).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole("main")).toHaveAttribute("data-ready", "true"),
    )
  })

  it("renders the page when the role has the permission", () => {
    setup(role({ manage_orders: true }))
    renderGuard()
    expect(screen.getByText("Org orders page")).toBeInTheDocument()
  })
})
