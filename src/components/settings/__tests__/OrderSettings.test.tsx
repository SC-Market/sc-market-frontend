/**
 * Allocation mode is a shop setting (Shop Settings › Orders); the backend
 * reads only the shop's value. The org/user Order Settings form must not offer
 * its own allocation-mode choice, which orders would ignore.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}))

vi.mock("../../paper/Section", () => ({
  FlatSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("../../../features/orders/hooks/useOrderSettings", () => ({
  useOrderSettings: () => ({
    isLoading: false,
    userError: undefined,
    contractorError: undefined,
    offerMessage: "", setOfferMessage: vi.fn(), offerEnabled: true, setOfferEnabled: vi.fn(),
    orderMessage: "", setOrderMessage: vi.fn(), orderEnabled: true, setOrderEnabled: vi.fn(),
    requireAvailabilityEnabled: false, setRequireAvailabilityEnabled: vi.fn(),
    stockSubtractionTiming: "on_accepted", setStockSubtractionTiming: vi.fn(),
    minOrderSize: "", setMinOrderSize: vi.fn(), minOrderSizeEnabled: false, setMinOrderSizeEnabled: vi.fn(),
    maxOrderSize: "", setMaxOrderSize: vi.fn(), maxOrderSizeEnabled: false, setMaxOrderSizeEnabled: vi.fn(),
    minOrderValue: "", setMinOrderValue: vi.fn(), minOrderValueEnabled: false, setMinOrderValueEnabled: vi.fn(),
    maxOrderValue: "", setMaxOrderValue: vi.fn(), maxOrderValueEnabled: false, setMaxOrderValueEnabled: vi.fn(),
    saving: false, error: null, success: false,
    handleSave: vi.fn(), handleDelete: vi.fn(),
    offerSettingId: null, orderSettingId: null,
    minOrderSizeSettingId: null, maxOrderSizeSettingId: null,
    minOrderValueSettingId: null, maxOrderValueSettingId: null,
  }),
}))

import { OrderSettings } from "../OrderSettings"

describe("OrderSettings", () => {
  it("points to the shop for allocation mode instead of offering an org-level choice", () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <MemoryRouter>
          <OrderSettings entityType="contractor" entityId="SCMARKET" />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText(/Stock allocation mode is set per shop/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Your shops" })).toHaveAttribute("href", "/dashboard/shops")
    expect(screen.queryByText("Automatic (Recommended)")).not.toBeInTheDocument()
    expect(screen.queryByText("None (Legacy)")).not.toBeInTheDocument()
  })
})
