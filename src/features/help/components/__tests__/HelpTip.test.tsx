import "../../../../util/i18n"
import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { describe, expect, it } from "vitest"
import { mainTheme } from "../../../../hooks/styles/Theme"
import { HelpTip } from "../HelpTip"
import { EmptyState } from "../../../../components/empty-states/EmptyState"
import { GUIDE_LINKS } from "../../guideLinks"

function renderTip() {
  render(
    <ThemeProvider theme={mainTheme}>
      <HelpTip
        label="Allocation mode"
        title="How orders take stock from your lots."
      />
      <button>elsewhere</button>
    </ThemeProvider>,
  )
  return screen.getByRole("button", { name: "Help: Allocation mode" })
}

describe("HelpTip", () => {
  it("toggles its explanation on click or tap", async () => {
    const button = renderTip()
    expect(screen.queryByRole("tooltip")).toBeNull()
    fireEvent.click(button)
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "How orders take stock from your lots.",
    )
    fireEvent.click(button)
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
  })

  it("describes the button with the explanation for screen readers", async () => {
    const button = renderTip()
    fireEvent.click(button)
    const tip = await screen.findByRole("tooltip")
    expect(button.getAttribute("aria-describedby")).toBe(tip.id)
  })

  it("closes on Escape", async () => {
    const button = renderTip()
    fireEvent.click(button)
    await screen.findByRole("tooltip")
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      })
    })
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
  })

  it("closes on a tap elsewhere", async () => {
    const button = renderTip()
    fireEvent.click(button)
    await screen.findByRole("tooltip")
    fireEvent.click(screen.getByRole("button", { name: "elsewhere" }))
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull())
  })
})

describe("EmptyState guide", () => {
  it("teaches with a Learn more link to the feature's guide", () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <EmptyState
          title="No stock lots yet"
          description="Lots hold what your listings sell."
          guide="stockLots"
          action={{ label: "Add Lot", onClick: () => {} }}
        />
      </ThemeProvider>,
    )
    expect(screen.getByRole("link", { name: /Learn more/ })).toHaveAttribute(
      "href",
      GUIDE_LINKS.stockLots,
    )
    expect(screen.getByRole("button", { name: "Add Lot" })).toBeInTheDocument()
  })
})
