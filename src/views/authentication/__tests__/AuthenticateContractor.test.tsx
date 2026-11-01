/**
 * /org/register's "Existing RSI org" tab needs the account's link code
 * (GET /api/profile/auth/ident). A failed request used to leave the tab on
 * its skeleton forever; it now shows the error body (with Try Again).
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { beforeEach, describe, expect, it, vi } from "vitest"

type IdentifierResult = {
  data?: { identifier: string }
  isLoading: boolean
  isError: boolean
  error?: unknown
}

let identifierResult: IdentifierResult

vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetAuthenticatorIdentifier: () => identifierResult,
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useContractorLinkMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { mainTheme } from "../../../hooks/styles/Theme"
import { AuthenticateContractor } from "../AuthenticateContractor"

function renderTab() {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter initialEntries={["/org/register"]}>
        <AuthenticateContractor />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("AuthenticateContractor (org link tab)", () => {
  beforeEach(() => {
    identifierResult = { isLoading: true, isError: false }
  })

  it("shows the skeleton while the link code loads", () => {
    const { container } = renderTab()
    expect(container.querySelector(".MuiSkeleton-root")).not.toBeNull()
    expect(screen.queryByText("Something went wrong")).toBeNull()
  })

  it("shows the error body, not a skeleton, when the link code fails", () => {
    identifierResult = {
      isLoading: false,
      isError: true,
      error: { status: 500, data: { error: { message: "boom" } } },
    }
    const { container } = renderTab()
    expect(screen.getByText("Something went wrong")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Try Again" })).toBeTruthy()
    expect(container.querySelector(".MuiSkeleton-root")).toBeNull()
  })

  it("shows the link form once the code loads", () => {
    identifierResult = {
      data: { identifier: "SCM-TEST-CODE" },
      isLoading: false,
      isError: false,
    }
    const { container } = renderTab()
    // The org URL field (the code itself sits in an i18n <Trans>).
    expect(container.querySelector("input")).not.toBeNull()
    expect(container.querySelector(".MuiSkeleton-root")).toBeNull()
    expect(screen.queryByText("Something went wrong")).toBeNull()
  })
})
