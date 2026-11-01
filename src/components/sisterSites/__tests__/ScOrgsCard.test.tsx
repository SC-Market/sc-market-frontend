import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

const query = vi.hoisted(() => vi.fn())
vi.mock("../../../store/api/v2/market", () => ({
  useGetContractorSisterLinksQuery: query,
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: string | { defaultValue?: string; name?: string }) => {
      const text = typeof opts === "string" ? opts : (opts?.defaultValue ?? key)
      return typeof opts === "object" && opts.name ? text.replace("{{name}}", opts.name) : text
    },
  }),
}))

const { OrgScOrgsCard } = await import("../ScOrgsCard")

describe("OrgScOrgsCard", () => {
  beforeEach(() => query.mockReset())

  it("links the org's SC Orgs community page (a followed link)", () => {
    query.mockReturnValue({ data: { sc_orgs_url: "https://sc-orgs.space/communities/BIRDINC" } })
    render(<OrgScOrgsCard spectrumId="BIRDINC" name="Bird INC" />)
    expect(query).toHaveBeenCalledWith({ spectrumId: "BIRDINC" })
    const link = screen.getByRole("link", { name: /Open on SC Orgs/ })
    expect(link.getAttribute("href")).toBe("https://sc-orgs.space/communities/BIRDINC")
    expect(link.getAttribute("rel")).toBe("noopener")
    expect(screen.getByText(/Bird INC has a community page on SC Orgs/)).toBeTruthy()
  })

  it("shows nothing when SC Orgs doesn't have the org, while loading or on error", () => {
    for (const result of [{ data: { sc_orgs_url: null } }, { data: undefined }, { error: {} }]) {
      query.mockReturnValue(result)
      const { container, unmount } = render(<OrgScOrgsCard spectrumId="X" name="X" />)
      expect(container.innerHTML).toBe("")
      unmount()
    }
  })

  it("never links anywhere but SC Orgs", () => {
    query.mockReturnValue({ data: { sc_orgs_url: "https://evil.example/communities/X" } })
    const { container } = render(<OrgScOrgsCard spectrumId="X" name="X" />)
    expect(container.innerHTML).toBe("")
  })
})
