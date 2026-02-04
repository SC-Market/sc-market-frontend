import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

// Type declaration for require in Jest tests
declare const require: (module: string) => unknown

// Mock i18n hook to return the key fallback
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

// Mock constants to avoid import.meta.env in tests
jest.mock("../../../util/constants", () => ({
  BACKEND_URL: "http://backend",
}))

// Mock icon to avoid MUI SvgIcon rendering complexity
jest.mock("../../icon/DiscordIcon", () => ({
  Discord: () => <span data-testid="discord-icon" />,
}))

describe("DiscordLoginButton", () => {
  const installHrefSpy = () => {
    const hrefSet = jest.fn()
    Object.defineProperty(window, "location", {
      value: {
        set href(v: string) {
          hrefSet(v)
        },
        get href() {
          return ""
        },
      },
      writable: true,
    })
    return hrefSet
  }

  it("navigates to discord auth URL on click using current path", () => {
    const hrefSet = installHrefSpy()
    const { DiscordLoginButton } = require("../DiscordLoginButton")

    render(
      <MemoryRouter initialEntries={["/foo"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Login with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Ffoo",
    )
  })

  it("uses /market when on root path", () => {
    const hrefSet = installHrefSpy()
    const { DiscordLoginButton } = require("../DiscordLoginButton")

    render(
      <MemoryRouter initialEntries={["/"]}>
        <DiscordLoginButton />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Login with Discord/i }))

    expect(hrefSet).toHaveBeenCalledWith(
      "http://backend/auth/discord?path=%2Fmarket",
    )
  })
})
