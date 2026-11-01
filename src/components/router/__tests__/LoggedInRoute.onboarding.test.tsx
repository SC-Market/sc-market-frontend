/**
 * LoggedInRoute redirects: users who haven't verified RSI go to /settings,
 * users who haven't finished onboarding go to /onboarding, except:
 * - email links (verify an address, unsubscribe), which arrive while the user
 *   is still in the onboarding stepper and must use their token at once;
 * - /org/register, which onboarding's Organization step links to.
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

const { state } = vi.hoisted(() => ({
  state: {
    profile: { rsi_confirmed: true, onboarding_completed_at: null } as Record<
      string,
      unknown
    >,
  },
}))

vi.mock("../../../hooks/login/useSession", () => ({
  useSession: () => ({ status: "authenticated", profile: state.profile }),
}))

import { LoggedInRoute, isEmailLinkPath } from "../LoggedInRoute"

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<LoggedInRoute />}>
          <Route path="/email/verify/:token" element={<div>verify page</div>} />
          <Route path="/email/verify" element={<div>verify page</div>} />
          <Route
            path="/email/unsubscribe/:token"
            element={<div>unsubscribe page</div>}
          />
          <Route path="/org/register" element={<div>register org page</div>} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Route>
        <Route path="/onboarding" element={<div>onboarding page</div>} />
        <Route path="/settings" element={<div>settings page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("LoggedInRoute onboarding redirect", () => {
  it("other pages still go to /onboarding until it's done", () => {
    state.profile = { rsi_confirmed: true, onboarding_completed_at: null }
    renderAt("/dashboard")
    expect(screen.getByText("onboarding page")).toBeTruthy()
  })

  it("the email verification link opens during onboarding", () => {
    state.profile = { rsi_confirmed: true, onboarding_completed_at: null }
    renderAt("/email/verify/abc123")
    expect(screen.getByText("verify page")).toBeTruthy()
  })

  it("unsubscribe links open during onboarding and before RSI verification", () => {
    state.profile = { rsi_confirmed: false, onboarding_completed_at: null }
    renderAt("/email/unsubscribe/tok")
    expect(screen.getByText("unsubscribe page")).toBeTruthy()
  })

  it("the email verification link opens before RSI verification", () => {
    state.profile = { rsi_confirmed: false, onboarding_completed_at: null }
    renderAt("/email/verify?success=true")
    expect(screen.getByText("verify page")).toBeTruthy()
  })

  it("onboarding's Register Organization link opens /org/register", () => {
    state.profile = { rsi_confirmed: true, onboarding_completed_at: null }
    renderAt("/org/register")
    expect(screen.getByText("register org page")).toBeTruthy()
  })

  it("/org/register still needs RSI verification", () => {
    state.profile = { rsi_confirmed: false, onboarding_completed_at: null }
    renderAt("/org/register")
    expect(screen.getByText("settings page")).toBeTruthy()
  })

  it("isEmailLinkPath matches only the email link pages", () => {
    expect(isEmailLinkPath("/email/verify")).toBe(true)
    expect(isEmailLinkPath("/email/verify/x")).toBe(true)
    expect(isEmailLinkPath("/email/unsubscribe")).toBe(true)
    expect(isEmailLinkPath("/email/verifyx")).toBe(false)
    expect(isEmailLinkPath("/settings/email/verify")).toBe(false)
  })
})
