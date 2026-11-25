/**
 * The service type was labelled "Type (Optional)", but the API rejects a
 * service without one (it sets the icon, the type filter and the type of
 * orders placed from the service). The field is now marked required and says
 * so once the user tries to save without it.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../../../hooks/styles/Theme"
import {
  ServiceFormContext,
  type ServiceFormContextType,
} from "../ServiceFormContext"
import { OrderDetailsSection } from "../OrderDetailsSection"

// Tests render translation keys (no i18n resources are loaded here).

function renderSection(type: string, submitAttempted: boolean) {
  const ctx = {
    state: { title: "", type, description: "", rush: false },
    setState: vi.fn(),
    submitAttempted,
  } as unknown as ServiceFormContextType
  render(
    <ThemeProvider theme={mainTheme}>
      <ServiceFormContext.Provider value={ctx}>
        <OrderDetailsSection />
      </ServiceFormContext.Provider>
    </ThemeProvider>,
  )
}

describe("OrderDetailsSection type field", () => {
  it("is marked required, not optional", () => {
    renderSection("", false)
    expect(screen.queryByText(/optional/i)).toBeNull()
    expect(
      screen.getAllByText("CreateServiceForm.type*").length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText("CreateServiceForm.typeRequired")).toBeNull()
  })

  it("explains the missing type after a save attempt", () => {
    renderSection("", true)
    expect(
      screen.getByText("CreateServiceForm.typeRequired"),
    ).toBeInTheDocument()
  })

  it("shows no error once a type is picked", () => {
    renderSection("Transport", true)
    expect(screen.queryByText("CreateServiceForm.typeRequired")).toBeNull()
  })
})
