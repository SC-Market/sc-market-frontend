/**
 * The branded storefront enquiry form (org settings › Storefront, shop
 * settings) and the "Show in the public storefront directory" card.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { StorefrontDirectoryStatus, StorefrontEnquiry } from "../../../store/api/v2/market"

const h = vi.hoisted(() => ({
  enquiry: null as StorefrontEnquiry | null,
  discord: "pilot#1" as string | null,
  create: vi.fn(),
}))

vi.mock("../../../store/api/v2/market", () => ({
  useGetStorefrontEnquiryQuery: () => ({ data: { enquiry: h.enquiry }, isLoading: false, isError: false }),
  useCreateStorefrontEnquiryMutation: () => [
    (arg: unknown) => ({ unwrap: () => Promise.resolve(h.create(arg)) }),
    { isLoading: false, isError: false },
  ],
}))
vi.mock("../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: { discord_username: h.discord } }),
}))

import { StorefrontEnquiryCard } from "../components/StorefrontEnquiryCard"
import { StorefrontDirectoryCard } from "../components/StorefrontDirectoryCard"
import { subdomainProblem, suggestedSubdomain } from "../enquiry"

const wrap = (ui: React.ReactElement) => render(<ThemeProvider theme={mainTheme}>{ui}</ThemeProvider>)

beforeEach(() => {
  h.enquiry = null
  h.discord = "pilot#1"
  h.create.mockReset()
})

describe("subdomain rules (same as the backend)", () => {
  it("suggests the spectrum ID or slug when it can be a subdomain", () => {
    expect(suggestedSubdomain("MEDRUNNER")).toBe("medrunner")
    expect(suggestedSubdomain("my_shop")).toBe("my-shop")
    expect(suggestedSubdomain("~TESTSTOREFRONT")).toBe("")
  })
  it("flags bad and reserved names", () => {
    expect(subdomainProblem("a")).toBe("length")
    expect(subdomainProblem("bad.name")).toBe("chars")
    expect(subdomainProblem("-x")).toBe("chars")
    expect(subdomainProblem("www")).toBe("reserved")
    expect(subdomainProblem("medrunner.sc-market.space")).toBeNull()
  })
})

describe("StorefrontEnquiryCard", () => {
  it("sends the subdomain, message and contact choice for the org", async () => {
    wrap(<StorefrontEnquiryCard targetType="org" targetId="BWINCORP" handle="BWINCORP" />)
    expect(screen.getByTestId("enquiry-subdomain")).toHaveValue("bwincorp")
    fireEvent.change(screen.getByTestId("enquiry-message"), { target: { value: "Our members-only shop" } })
    fireEvent.click(screen.getByTestId("enquiry-submit"))
    await Promise.resolve()
    expect(h.create).toHaveBeenCalledWith({
      createStorefrontEnquiryRequest: {
        target_type: "org",
        target_id: "BWINCORP",
        requested_subdomain: "bwincorp",
        message: "Our members-only shop",
        contact_method: "discord",
      },
    })
  })

  it("won't send a reserved subdomain; without Discord it defaults to a site message", () => {
    h.discord = null
    wrap(<StorefrontEnquiryCard targetType="shop" targetId="s1" handle="api" />)
    expect(screen.getByLabelText(/A message on SC Market/)).toBeChecked()
    fireEvent.change(screen.getByTestId("enquiry-subdomain"), { target: { value: "api" } })
    fireEvent.click(screen.getByTestId("enquiry-submit"))
    expect(h.create).not.toHaveBeenCalled()
    expect(screen.getByText("That subdomain is reserved")).toBeInTheDocument()
  })

  it("shows the open enquiry's status instead of the form", () => {
    h.enquiry = {
      enquiry_id: "e1",
      target_type: "org",
      target: "BWINCORP",
      requested_subdomain: "bwincorp",
      message: "",
      contact_method: "site_message",
      status: "in_progress",
      submitted_by_username: "owner",
      created_at: "2026-11-01T00:00:00.000Z",
      updated_at: "2026-11-01T00:00:00.000Z",
    }
    wrap(<StorefrontEnquiryCard targetType="org" targetId="BWINCORP" handle="BWINCORP" />)
    expect(screen.getByTestId("storefront-enquiry-status")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
    expect(screen.queryByTestId("enquiry-submit")).toBeNull()
  })
})

describe("StorefrontDirectoryCard", () => {
  const status = (over: Partial<StorefrontDirectoryStatus>): StorefrontDirectoryStatus => ({
    show_in_directory: true,
    can_change: true,
    listed: true,
    reason: "listed",
    members_only: false,
    public_listings: 2,
    private_listings: 0,
    active_services: 0,
    ...over,
  })

  it("is forced off for members-only storefronts", () => {
    wrap(
      <StorefrontDirectoryCard
        kind="org"
        status={status({ show_in_directory: false, can_change: false, listed: false, reason: "members_only", members_only: true })}
        saving={false}
        onChange={() => {}}
      />,
    )
    const toggle = screen.getByRole("checkbox")
    expect(toggle).not.toBeChecked()
    expect(toggle).toBeDisabled()
    expect(screen.getByText(/Members-only storefronts are never listed publicly/)).toBeInTheDocument()
  })

  it("turns the setting off", () => {
    const onChange = vi.fn()
    wrap(<StorefrontDirectoryCard kind="org" status={status({})} saving={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole("checkbox"))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
