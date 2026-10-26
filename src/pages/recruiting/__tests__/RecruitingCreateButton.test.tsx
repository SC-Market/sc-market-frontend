/**
 * The Recruiting page showed "Create Post" to any member of the selected org,
 * though creating one needs Manage Recruiting (and the create page then
 * refused them). The button now follows that permission.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

const state = vi.hoisted(() => ({ manageRecruiting: false }))

vi.mock("../../../hooks/login/useSelectedOrg", () => ({
  useSelectedOrg: () => ({
    org: {
      spectrum_id: "TESTORG",
      roles: [{ role_id: "r1", position: 5, manage_recruiting: state.manageRecruiting }],
    },
    isLoading: false,
  }),
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: { username: "me", contractors: [{ spectrum_id: "TESTORG", roles: ["r1"] }] },
  }),
}))
vi.mock("../../../features/recruiting/hooks/usePageRecruiting", () => ({
  usePageRecruiting: () => ({
    data: { posts: { items: [], total: 0 }, myPost: undefined, alreadyPosted: false },
    isLoading: false,
    isFetching: false,
  }),
}))
vi.mock("../../../components/layout/SidebarPageLayout", () => ({
  SidebarPageLayout: (props: { headerActions?: React.ReactNode }) => (
    <div>{props.headerActions}</div>
  ),
}))

import { Recruiting } from "../Recruiting"

function renderPage() {
  render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>
        <Recruiting />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("Recruiting › Create Post", () => {
  beforeEach(() => {
    state.manageRecruiting = false
  })

  it("is hidden from members without Manage Recruiting", () => {
    renderPage()
    expect(screen.queryByRole("button", { name: /create_post|create post/i })).toBeNull()
  })

  it("shows with Manage Recruiting in the selected org", () => {
    state.manageRecruiting = true
    renderPage()
    expect(screen.getByRole("button", { name: /create_post|create post/i })).toBeTruthy()
  })
})
