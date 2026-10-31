/**
 * The org Settings "Language" (locale) field saved a value nothing on the
 * site used. It's gone; Settings only holds the org's spoken languages.
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"

vi.mock("../OrgLanguageSettings", () => ({
  OrgLanguageSettings: () => <div>supported languages</div>,
}))
vi.mock("../OrgLinkBackSettings", () => ({
  OrgLinkBackSettings: () => <div>link back to us</div>,
}))

import { OrgSettings } from "../OrgSettings"

describe("OrgSettings", () => {
  it("has the spoken languages and no locale field", () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <OrgSettings />
      </ThemeProvider>,
    )
    expect(screen.getByText("supported languages")).toBeTruthy()
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(screen.getByText("link back to us")).toBeTruthy()
  })
})
