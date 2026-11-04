import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

let spectrumId = "TESTORG"
vi.mock("../../../hooks/login/CurrentOrg", () => ({
  useCurrentOrg: () => [{ spectrum_id: spectrumId }],
}))
vi.mock("../../../components/authentication/OrgLinkBackLine", () => ({
  OrgLinkBackLine: (props: { spectrumId: string }) => (
    <div>line for {props.spectrumId}</div>
  ),
}))
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

import { OrgLinkBackSettings } from "../OrgLinkBackSettings"

function renderIt() {
  return render(
    <ThemeProvider theme={mainTheme}>
      <OrgLinkBackSettings />
    </ThemeProvider>,
  )
}

describe("OrgLinkBackSettings", () => {
  it("offers the line to orgs verified against an RSI org", () => {
    spectrumId = "TESTORG"
    renderIt()
    expect(screen.getByText("Link back to us")).toBeTruthy()
    expect(screen.getByText("line for TESTORG")).toBeTruthy()
  })

  it("hides it for SC Market-only (~) orgs with no RSI page", () => {
    spectrumId = "~MYCREW"
    const { container } = renderIt()
    expect(container.textContent).toBe("")
  })
})
