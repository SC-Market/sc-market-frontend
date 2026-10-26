import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import { Contracts } from "../Contracts"

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string) => (typeof def === "string" ? def : key),
    }),
  }
})

vi.mock("../../../components/metadata/Page", () => ({
  Page: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock("../../../components/layout/ContainerGrid", () => ({
  OpenLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useBreakpointDown: () => false,
}))
vi.mock("../../../views/contracts/ContractListings", () => ({
  ContractListings: () => <div data-testid="contract-listings" />,
}))
vi.mock("../../../views/contracts/ContractSidebar", () => ({
  ContractSidebar: () => <div data-testid="contract-sidebar" />,
}))
vi.mock("../../../views/contracts/ContractActions", () => ({
  ContractActions: () => <button>Create Contract</button>,
}))

const theme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
})

describe("Contracts page", () => {
  it("is titled Contracts, keeps Create Contract and the listings, and has no tabs", async () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={["/contracts"]}>
          <Contracts />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contracts")
    expect(await screen.findByRole("button", { name: "Create Contract" })).toBeInTheDocument()
    expect(screen.getByTestId("contract-listings")).toBeInTheDocument()
    expect(screen.queryByRole("tablist")).toBeNull()
    expect(screen.queryByRole("tabpanel")).toBeNull()
  })
})
