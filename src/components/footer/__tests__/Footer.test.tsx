/**
 * The footer is an anchored band: the brand and tagline, the links in
 * labelled groups (one nav landmark per column, each with a heading), and
 * the notices in a bar underneath.
 */
import React from "react"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { CookiesProvider } from "react-cookie"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Footer } from "../Footer"
import { DEVELOPER_LINKS } from "../developerLinks"
import { CustomDomainContext } from "../../../hooks/contractor/CustomDomain"

vi.mock("../../button/ReportButton", () => ({
  ReportButton: () => <button type="button">Report</button>,
}))
vi.mock("@unhead/react/helmet", () => ({
  Helmet: () => null,
}))

const theme = createTheme({
  layoutSpacing: { component: 2, layout: 3 },
} as never)

function renderFooter() {
  return render(
    <ThemeProvider theme={theme}>
      <CookiesProvider>
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      </CookiesProvider>
    </ThemeProvider>,
  )
}

function renderWhiteLabelFooter() {
  return render(
    <ThemeProvider theme={theme}>
      <CookiesProvider>
        <CustomDomainContext.Provider
          value={{ isCustomDomain: true, customOrg: "MEDRUNNER" }}
        >
          <MemoryRouter>
            <Footer />
          </MemoryRouter>
        </CustomDomainContext.Provider>
      </CookiesProvider>
    </ThemeProvider>,
  )
}

const FANSITE = /This is an unofficial Star Citizen fansite/

function group(name: string) {
  return within(screen.getByRole("navigation", { name }))
}

describe("Footer groups", () => {
  it("renders one labelled nav per group, each with a heading", () => {
    renderFooter()
    const names = ["Help", "Project", "Developers", "SC Orgs", "Legal"]
    for (const name of names) {
      expect(group(name).getByRole("heading", { name })).toBeTruthy()
    }
    expect(screen.getAllByRole("navigation")).toHaveLength(names.length)
  })

  it("puts each link in its group", () => {
    renderFooter()
    const help = group("Help")
    for (const name of ["Support", "Help & Guides", "Discord", "Discord Bot"]) {
      expect(help.getByRole("link", { name })).toBeTruthy()
    }
    expect(help.getByRole("button", { name: "Report" })).toBeTruthy()

    const project = group("Project")
    for (const name of ["About", "Changelog", "Donate", "Github"]) {
      expect(project.getByRole("link", { name })).toBeTruthy()
    }

    const developers = group("Developers")
    expect(developers.getByRole("link", { name: "API Docs" })).toBeTruthy()
    for (const link of DEVELOPER_LINKS) {
      expect(developers.getByRole("link", { name: link.label })).toBeTruthy()
    }

    const orgs = group("SC Orgs")
    expect(
      orgs.getByRole("link", { name: "Visit SC Orgs" }).getAttribute("href"),
    ).toBe("https://sc-orgs.space")
    expect(orgs.getAllByRole("link")).toHaveLength(6)

    const legal = group("Legal")
    expect(legal.getByRole("link", { name: "Privacy Policy" })).toBeTruthy()
    expect(legal.getByRole("link", { name: "Terms of Service" })).toBeTruthy()
    expect(
      legal.getByRole("button", { name: "Cookie preferences" }),
    ).toBeTruthy()
  })

  it("leads with the brand and tagline, linking home", () => {
    renderFooter()
    expect(
      screen.getByRole("link", { name: "SC Market" }).getAttribute("href"),
    ).toBe("/")
    expect(
      screen.getByText("Star Citizen Marketplace (SC Market)"),
    ).toBeTruthy()
  })

  it("shows the notices: fansite, official site, the logo credit and the referral code", () => {
    renderFooter()
    expect(screen.getByText(FANSITE)).toBeTruthy()
    expect(
      screen
        .getByRole("link", { name: "robertsspaceindustries.com" })
        .getAttribute("href"),
    ).toBe("https://robertsspaceindustries.com")
    expect(
      screen.getByRole("link", { name: "LadyFleur" }).getAttribute("href"),
    ).toBe("https://www.youtube.com/@robinerino")
    expect(screen.getByText(/STAR-GSFY-MQW9/)).toBeTruthy()
  })

  it("drops the pipe separators", () => {
    renderFooter()
    for (const nav of screen.getAllByRole("navigation")) {
      expect(nav.textContent).not.toContain("|")
    }
  })

  it("credits only LadyFleur, for the logo", () => {
    renderFooter()
    const credit = screen.getByRole("link", { name: "LadyFleur" })
    expect(credit.closest("p")?.textContent).toBe(
      "Special thanks to LadyFleur for the logo.",
    )
    for (const name of ["StarCitizen-API", "NEXD", "Star Citizen Wiki"]) {
      expect(screen.queryByRole("link", { name })).toBeNull()
    }
  })
})

describe("Footer on an org's white-label domain", () => {
  it("keeps only help and legal: no SC Market project, developer or SC Orgs links", () => {
    renderWhiteLabelFooter()
    expect(
      screen
        .getAllByRole("navigation")
        .map((n) => within(n).getByRole("heading").textContent),
    ).toEqual(["Help", "Legal"])
    const help = group("Help")
    expect(help.getByRole("link", { name: "Support" })).toBeTruthy()
    expect(help.getByRole("link", { name: "Help & Guides" })).toBeTruthy()
    expect(help.queryByRole("link", { name: "Discord Bot" })).toBeNull()
    expect(screen.queryByRole("link", { name: "Donate" })).toBeNull()
    expect(
      group("Legal").getByRole("link", { name: "Privacy Policy" }),
    ).toBeTruthy()
  })

  it("keeps the notices but drops the brand, credit and referral code", () => {
    renderWhiteLabelFooter()
    expect(screen.getByText(FANSITE)).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "robertsspaceindustries.com" }),
    ).toBeTruthy()
    expect(screen.queryByRole("link", { name: "SC Market" })).toBeNull()
    expect(
      screen.queryByText("Star Citizen Marketplace (SC Market)"),
    ).toBeNull()
    expect(screen.queryByRole("link", { name: "LadyFleur" })).toBeNull()
    expect(screen.queryByText(/STAR-GSFY-MQW9/)).toBeNull()
  })
})
