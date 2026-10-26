import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { GuidesDirectory, GuidesDirectoryToggle } from "../components/GuidesDirectory"
import { helpIndex } from "../content"

const [first, ...rest] = helpIndex.guides
const other = rest.find((g) => g.category !== first.category)!

function renderAt(path: string, ui: React.ReactElement = <GuidesDirectory />) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
}

describe("GuidesDirectory", () => {
  it("links the hub, every category, every guide and About as real anchors", () => {
    renderAt("/guides")
    const nav = screen.getByRole("navigation", { name: "All guides" })
    const hrefs = within(nav)
      .getAllByRole("link", { hidden: true })
      .map((a) => a.getAttribute("href"))
    expect(hrefs).toContain("/guides")
    expect(hrefs).toContain("/about")
    for (const c of helpIndex.categories) expect(hrefs).toContain(`/guides/${c.id}`)
    // Collapsed categories keep their links in the DOM (crawlable).
    for (const g of helpIndex.guides) expect(hrefs).toContain(`/guides/${g.category}/${g.slug}`)
  })

  it("highlights the current guide and expands only its category", () => {
    renderAt(`/guides/${first.category}/${first.slug}`)
    const current = screen.getByRole("link", { name: first.title })
    expect(current).toHaveAttribute("aria-current", "page")
    expect(current).toHaveClass("Mui-selected")
    const categoryTitle = helpIndex.categories.find((c) => c.id === first.category)!.title
    const otherTitle = helpIndex.categories.find((c) => c.id === other.category)!.title
    expect(screen.getByRole("button", { name: `Collapse ${categoryTitle}` })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: `Expand ${otherTitle}` })).toHaveAttribute("aria-expanded", "false")
  })

  it("expands and collapses a category", async () => {
    renderAt("/guides")
    const otherTitle = helpIndex.categories.find((c) => c.id === other.category)!.title
    await userEvent.click(screen.getByRole("button", { name: `Expand ${otherTitle}` }))
    expect(screen.getByRole("button", { name: `Collapse ${otherTitle}` })).toHaveAttribute("aria-expanded", "true")
  })

  it("has an 'All guides' toggle for small screens", async () => {
    renderAt("/guides", <GuidesDirectoryToggle />)
    const toggle = screen.getByRole("button", { name: "All guides" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Help & Guides" })).toHaveAttribute("href", "/guides")
  })
})
