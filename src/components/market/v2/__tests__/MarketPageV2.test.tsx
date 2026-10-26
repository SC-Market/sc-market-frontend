import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import { MarketPageV2 } from "../MarketPageV2"

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, def?: string) => (typeof def === "string" ? def : key),
    }),
  }
})

// Records the document (tab) title the page asks for
vi.mock("../../../../components/metadata/Page", () => ({
  Page: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="page" data-page-title={title}>
      {children}
    </div>
  ),
}))
vi.mock("../../../../components/layout/ContainerGrid", () => ({
  OpenLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))
vi.mock("../../../../hooks/layout/useBreakpoint", () => ({
  useBreakpointDown: () => false,
  useIsMobile: () => false,
}))
vi.mock("../../../../features/market/components/MarketActions", () => ({
  MarketActions: () => <button>Create Listing</button>,
  BuyOrderActions: () => <button>Create Buy Order</button>,
}))
vi.mock("../../../../features/market/v2/MarketV2Routes", () => ({
  MarketV2Routes: () => <div data-testid="items-content" />,
}))
vi.mock("../../../../views/services/ServiceMarketView", () => ({
  ServiceMarketView: () => <div data-testid="services-content" />,
}))
vi.mock("../../../../views/services/ServiceActions", () => ({
  ServiceActions: () => <button>Create Service</button>,
}))

const theme = createTheme({
  layoutSpacing: { layout: 1, component: 1.5, text: 1, compact: 0.5 },
  // Read by the services body skeleton (the Suspense fallback)
  borderRadius: { topLevel: 1, image: 1 },
})

function renderAt(path: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <MarketPageV2 />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("MarketPageV2", () => {
  it.each([
    ["/market", "Market", "Create Listing", "items-content"],
    ["/market/category/Helmet", "Market", "Create Listing", "items-content"],
    ["/buyorders", "Buy Orders", "Create Buy Order", "items-content"],
    ["/market/services", "Services", "Create Service", "services-content"],
  ])("%s: titled %s, shows its action and content, no tabs", async (path, title, action, content) => {
    renderAt(path)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(title)
    // Tab title matches the page ("Buy Orders - SC Market", not "Market")
    expect(screen.getByTestId("page")).toHaveAttribute("data-page-title", title)
    expect(await screen.findByRole("button", { name: action })).toBeInTheDocument()
    expect(await screen.findByTestId(content)).toBeInTheDocument()
    expect(screen.queryByRole("tablist")).toBeNull()
    expect(screen.queryByRole("tab")).toBeNull()
    expect(screen.queryByRole("tabpanel")).toBeNull()
  })
})
