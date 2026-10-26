/**
 * HelpLink: a small "Learn how" link to a guide that opens in a new tab, on
 * sc-market.space even from a white-label org domain.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

const site = vi.hoisted(() => ({ official: true }))
vi.mock("../../links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../links")>()),
  isOfficialSite: () => site.official,
}))

import { HelpLink } from "../HelpLink"

describe("HelpLink", () => {
  beforeEach(() => {
    site.official = true
  })

  it("links to the guide and opens it in a new tab", () => {
    render(<HelpLink guide="orgRoles" />)
    const link = screen.getByRole("link")
    expect(link.getAttribute("href")).toBe("/guides/orgs/roles-and-permissions")
    expect(link.getAttribute("target")).toBe("_blank")
    expect(link.textContent).toMatch(/Learn how|help.learnHow/)
  })

  it("opens sc-market.space on a white-label domain", () => {
    site.official = false
    render(<HelpLink guide="webhooks">Webhook guide</HelpLink>)
    const link = screen.getByRole("link", { name: /Webhook guide/ })
    expect(link.getAttribute("href")).toBe("https://sc-market.space/guides/discord/webhooks")
  })
})
