/**
 * The listing page server-rendered in German (the SSR Function's `locale`
 * variant) hydrates in a German browser without a mismatch: prices,
 * quantities and relative times come from util/format in the page's
 * language, the render's time (useNow) and UTC, not from the machine's
 * locale, clock or time zone.
 */
import "./setup"
import React from "react"
import { act } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { I18nextProvider } from "react-i18next"
import { createInstance } from "i18next"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../../store/api/v2/market"
import { serviceApi } from "../../../../store/service"
import type { GetListingDetailApiResponse } from "../../../../store/api/v2/market"
import { querySuccess } from "../../../../__tests__/rtkQueryMocks"
import type { StandardPageLayoutProps } from "../../../../components/layout/StandardPageLayout"
import en from "../../../../locales/en/english.json"
import de from "../../../../locales/de/de.json"
import { RenderTimeProvider } from "../../../../util/format"
import { ListingDetailV2 } from "../ListingDetailV2"

const testTheme = createTheme({
  layoutSpacing: { layout: 2, component: 1, text: 1, compact: 0.5 },
  borderRadius: { topLevel: 0.375, image: 0.375, button: 1, input: 0.5, chip: 0.5, minimal: 0 },
  palette: { outline: { main: "#e0e0e0" } },
})

vi.mock("../../../../hooks/alert/AlertHook", () => ({ useAlertHook: () => vi.fn() }))
vi.mock("@mui/x-charts", () => ({ LineChart: () => null, BarChart: () => null, PieChart: () => null }))
vi.mock("@mui/x-charts/LineChart", () => ({ LineChart: () => null }))
vi.mock("@mui/x-charts/BarChart", () => ({ BarChart: () => null }))
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router-dom")),
  useParams: () => ({ id: "test-listing-id" }),
}))
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children, title }: StandardPageLayoutProps) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))
vi.mock("../../../../components/markdown/Markdown.lazy", () => ({
  MarkdownRender: ({ text }: { text: string }) => <div>{text}</div>,
  MarkdownEditor: () => <div />,
}))
vi.mock("@unhead/react/helmet", () => ({ Helmet: () => null }))

const listing: GetListingDetailApiResponse = {
  listing: {
    listing_id: "test-listing-id",
    shop_id: "shop-123",
    title: "Gladius-Schild",
    description: "Beschreibung",
    status: "active",
    visibility: "public",
    sale_type: "fixed",
    listing_type: "single",
    quantity_unit: "unit",
    created_at: "2026-10-30T06:00:00Z",
    updated_at: "2026-11-01T23:30:00Z",
    expires_at: "2026-12-01T00:00:00Z",
  },
  seller: { shop_id: "shop-123", name: "Test Seller", slug: "test-seller", rating: 4.5, languages: ["de"] },
  items: [
    {
      item_id: "item-123",
      game_item: { id: "game-item-123", name: "FR-66", type: "Shield" },
      pricing_mode: "per_variant",
      variants: [
        {
          variant_id: "variant-1",
          display_name: "Tier 5",
          short_name: "T5",
          attributes: { quality_tier: 5, quality_value: 95.5 },
          quantity: 12500,
          price: 1_500_000,
          locations: ["Area 18"],
        },
        {
          variant_id: "variant-2",
          display_name: "Tier 3",
          short_name: "T3",
          attributes: { quality_tier: 3, quality_value: 65 },
          quantity: 5,
          price: 45_000,
          locations: ["Area 18"],
        },
      ],
    },
  ],
}

/** When the server rendered the page: days before the browser hydrates it (a cached page). */
const RENDERED_AT = Date.parse("2026-11-02T08:00:00Z")

function germanI18n() {
  const instance = createInstance()
  void instance.init({
    lng: "de",
    fallbackLng: "en",
    resources: { en: { translation: en }, de: { translation: de } },
    interpolation: { escapeValue: false },
    initAsync: false,
    showSupportNotice: false,
  })
  return instance
}

function page() {
  const store = configureStore({
    reducer: {
      [marketApi.marketV2Api.reducerPath]: marketApi.marketV2Api.reducer,
      [serviceApi.reducerPath]: serviceApi.reducer,
    },
    middleware: (gdm) => gdm().concat(marketApi.marketV2Api.middleware, serviceApi.middleware),
  })
  return (
    <Provider store={store}>
      <RenderTimeProvider now={RENDERED_AT}>
        <I18nextProvider i18n={germanI18n()}>
          <ThemeProvider theme={testTheme}>
            <MemoryRouter initialEntries={["/market/test-listing-id"]}>
              <Routes>
                <Route path="/market/:id" element={<ListingDetailV2 />} />
              </Routes>
            </MemoryRouter>
          </ThemeProvider>
        </I18nextProvider>
      </RenderTimeProvider>
    </Provider>
  )
}

describe("ListingDetailV2 server render in German", () => {
  const originalTZ = process.env.TZ
  beforeEach(() => {
    vi.spyOn(marketApi, "useGetListingDetailQuery").mockReturnValue(
      querySuccess<typeof marketApi.marketV2Api.endpoints.getListingDetail>(listing),
    )
  })
  afterEach(() => {
    process.env.TZ = originalTZ
    vi.restoreAllMocks()
  })

  // Intl puts no-break spaces in "1,5 Mio."; compare with plain spaces.
  const plain = (s: string | null) => (s ?? "").replace(/[\u00a0\u202f]/g, " ")

  it("formats prices, quantities and relative times in German", () => {
    const html = plain(renderToString(page()))
    expect(html).toContain("1,5 Mio. aUEC")
    expect(html).toContain("45.000 aUEC")
    expect(html).toContain("12.500")
    // Relative to the render's time, not the test machine's clock.
    expect(html).toContain("vor 3 Tagen")
    expect(html).not.toContain("1,500,000")
  })

  it("hydrates in a German browser in another time zone, days later, with zero mismatches", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(page())
    document.body.appendChild(container)
    // The visitor's machine: a different zone than the server's (UTC).
    process.env.TZ = "Asia/Tokyo"
    Object.defineProperty(navigator, "language", { value: "de-DE", configurable: true })

    const errors: unknown[] = []
    const consoleErrors: unknown[] = []
    const consoleSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      consoleErrors.push(args.map(String).join(" "))
    })
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, page(), {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(consoleErrors.filter((m) => /hydrat|did not match/i.test(String(m)))).toEqual([])
    // After hydration: still German, now relative to the browser's clock.
    expect(plain(container.textContent)).toContain("1,5 Mio. aUEC")
    expect(container.textContent).not.toContain("vor 3 Tagen")
    consoleSpy.mockRestore()
    act(() => root!.unmount())
    container.remove()
  })
})
