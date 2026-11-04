import { vi } from "vitest"
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { DiscordLoginButton } from "../DiscordLoginButton"

// English catalog t() (src/test/mocks/reactI18next).
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

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
    const fakeLocation = { href: "", origin: "http://localhost:3000" }
    vi.stubGlobal("location", fakeLocation)
    Object.defineProperty(fakeLocation, "href", {
      set(v: string) {
        hrefSet(v)
      },
      get() {
        return ""
      },
    })
    return hrefSet
  }

  it("navigates to discord auth URL on click using current path", () => {
    const hrefSet = installHrefSpy()

    render(
      <MemoryRouter initialEntries={["/foo"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in with Discord/i }),
    )

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Ffoo&action=signin&origin=http%3A%2F%2Flocalhost%3A3000",
    )
  })

  it("uses /market when on root path", () => {
    const hrefSet = installHrefSpy()

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole("button", { name: /Sign in with Discord/i }),
    )

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2F&action=signin&origin=http%3A%2F%2Flocalhost%3A3000",
    )
  })
})
