/**
 * The footer's links sit in labelled groups (one nav landmark per column,
 * each with a heading), not one long separated row.
 */
import React from "react"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { CookiesProvider } from "react-cookie"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Footer } from "../Footer"
import { DEVELOPER_LINKS } from "../developerLinks"

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

  it("drops the pipe separators", () => {
    renderFooter()
    for (const nav of screen.getAllByRole("navigation")) {
      expect(nav.textContent).not.toContain("|")
    }
  })
})
