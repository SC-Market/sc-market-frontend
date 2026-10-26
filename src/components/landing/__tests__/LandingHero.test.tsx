/**
 * The hero's loading state has the loaded layout: the brand is always real,
 * and the sign-in card is held by a same-size placeholder while the session
 * is unknown (it used to be a one-column skeleton without the card, so the
 * logged-out hero jumped to two columns: CLS 0.06 desktop, 0.19 on phones).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { Session } from "../../../hooks/login/useSession"

const h = vi.hoisted(() => ({ session: { status: "unknown" } as Session }))
vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => h.session,
}))
vi.mock("../../../views/authentication/LoginArea", () => ({
  LoginArea: () => <div data-testid="login-area">Sign in to SC Market</div>,
}))

const { LandingHero } = await import("../LandingHero")
const { LandingHeroSkeleton } = await import("../LandingHero.skeleton")

function renderWith(node: React.ReactNode) {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>{node}</MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  h.session = { status: "unknown", profile: undefined }
})

describe("LandingHero", () => {
  it("unknown session: real brand, and the sign-in card laid out invisibly under a placeholder", () => {
    renderWith(<LandingHero />)
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId("landing-signin-placeholder")).toBeInTheDocument()
    const card = screen.getByTestId("login-area")
    const hidden = card.closest("[aria-hidden='true']")
    expect(hidden).not.toBeNull()
    expect(hidden).toHaveAttribute("inert")
  })

  it("anonymous: the real, interactive sign-in card", () => {
    h.session = { status: "anonymous", profile: undefined }
    renderWith(<LandingHero />)
    expect(screen.queryByTestId("landing-signin-placeholder")).toBeNull()
    expect(screen.getByTestId("login-area").closest("[aria-hidden='true']")).toBeNull()
  })

  it("signed in: no sign-in card at all", () => {
    h.session = { status: "authenticated", profile: {} as never }
    renderWith(<LandingHero />)
    expect(screen.queryByTestId("login-area")).toBeNull()
  })

  it("the route skeleton is the same layout", () => {
    renderWith(<LandingHeroSkeleton />)
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId("landing-signin-placeholder")).toBeInTheDocument()
  })
})
