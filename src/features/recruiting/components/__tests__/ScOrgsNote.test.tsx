import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

const { ScOrgsNote } = await import("../ScOrgsNote")

function link() {
  const a = screen.getByRole("link")
  return { a, href: a.getAttribute("href") }
}

describe("ScOrgsNote", () => {
  it("recruiting (default): SC Orgs home", () => {
    render(<ScOrgsNote />)
    expect(link().href).toBe("https://sc-orgs.space")
    expect(screen.getByText(/^Recruiting\?/)).toBeTruthy()
  })

  it("directory (/contractors): SC Orgs' org directory", () => {
    render(<ScOrgsNote topic="directory" />)
    const { a, href } = link()
    expect(href).toBe("https://sc-orgs.space/communities")
    expect(a.getAttribute("target")).toBe("_blank")
    expect(a.getAttribute("rel")).toBe("noopener")
    expect(screen.getByText(/Browse the org directory on SC Orgs/)).toBeTruthy()
  })

  it("register (/org/register): SC Orgs' register-your-org guide", () => {
    render(<ScOrgsNote topic="register" />)
    const { a, href } = link()
    expect(href).toBe("https://sc-orgs.space/guides/register-your-org")
    expect(a.getAttribute("rel")).toBe("noopener")
    expect(screen.getByText(/run your org on SC Orgs/)).toBeTruthy()
  })
})
