import { vi } from "vitest"
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { DiscordLoginButton } from "../DiscordLoginButton"

// Mock i18n hook to return the key fallback
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

// Mock constants to avoid import.meta.env in tests
vi.mock("../../../util/constants", () => ({
  BACKEND_URL: "http://backend",
}))

// Mock icon to avoid MUI SvgIcon rendering complexity
vi.mock("../../icon/DiscordIcon", () => ({
  Discord: () => <span data-testid="discord-icon" />,
}))

describe("DiscordLoginButton", () => {
  const installHrefSpy = () => {
    const hrefSet = vi.fn()
    delete (window as any).location
    window.location = {
      href: "",
      set href(v: string) {
        hrefSet(v)
      },
      get href() {
        return ""
      },
    } as any
    return hrefSet
  }

  it("navigates to discord auth URL on click using current path", () => {
    const hrefSet = installHrefSpy()

    render(
      <MemoryRouter initialEntries={["/foo"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Sign in with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Ffoo&action=signin",
    )
  })

  it("uses /market when on root path", () => {
    const hrefSet = installHrefSpy()

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Sign in with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2F&action=signin",
    )
  })
})
