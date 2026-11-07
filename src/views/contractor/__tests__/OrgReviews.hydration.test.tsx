/**
 * An org's reviews (the About page of /contractor/:id) server-rendered in UTC
 * hydrate in a browser west of UTC without a mismatch. A review written at
 * 07:32 UTC on 3 November is still 2 November in the Americas: the review
 * dates used to be formatted in the machine's zone, so the hydrating render
 * printed a different day than the server HTML (React #418, "text").
 */
import React from "react"
import { act } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { I18nextProvider } from "react-i18next"
import { createInstance } from "i18next"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { serviceApi } from "../../../store/service"
import type { contractorsApi } from "../../../features/contractor/api/contractorApi"
import type { OrderReview } from "../../../features/orders/domain/types"
import type { MinimalContractor } from "../../../features/contractor/domain/types"
import {
  querySuccess,
  type QueryResultOf,
} from "../../../__tests__/rtkQueryMocks"
import en from "../../../locales/en/english.json"
import { RenderTimeProvider } from "../../../util/format"
import { OrgReviews } from "../OrgReviews"

const testTheme = createTheme({
  layoutSpacing: { layout: 2, component: 1, text: 1, compact: 0.5 },
  borderRadius: {
    topLevel: 0.375,
    image: 0.375,
    button: 1,
    input: 0.5,
    chip: 0.5,
    minimal: 0,
  },
  palette: { outline: { main: "#e0e0e0" } },
})

const org: MinimalContractor = {
  avatar: "",
  name: "SC Market",
  spectrum_id: "SCMARKET",
  rating: { avg_rating: 3.6, rating_count: 2, total_rating: 7, streak: 0 },
}

function review(id: string, iso: string, content: string): OrderReview {
  return {
    user_author: null,
    contractor_author: org,
    content,
    timestamp: Date.parse(iso),
    review_id: id,
    order_id: `order-${id}`,
    rating: 4,
    role: "customer",
    revision_requested: false,
    revision_requested_at: null,
    last_modified_at: iso,
    revision_message: null,
  }
}

// The production reviews that mismatched: early-morning UTC timestamps.
const reviews = [
  review("r1", "2025-11-03T07:32:33.497Z", "Test review"),
  review("r2", "2025-10-24T04:06:59.066Z", "Another review"),
]

type ReviewsEndpoint = typeof contractorsApi.endpoints.getContractorReviews
// Read when OrgReviews renders (after beforeEach), not when the mock is made.
let mockReviewsResult: QueryResultOf<ReviewsEndpoint>
vi.mock("../../../features/contractor/api/contractorApi", async () => ({
  ...(await vi.importActual<Record<string, unknown>>(
    "../../../features/contractor/api/contractorApi",
  )),
  useGetContractorReviewsQuery: () => mockReviewsResult,
}))

function englishI18n() {
  const instance = createInstance()
  void instance.init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
    initAsync: false,
    showSupportNotice: false,
  })
  return instance
}

function page() {
  const store = configureStore({
    reducer: { [serviceApi.reducerPath]: serviceApi.reducer },
    middleware: (gdm) => gdm().concat(serviceApi.middleware),
  })
  return (
    <Provider store={store}>
      <RenderTimeProvider now={Date.parse("2026-11-07T00:00:00Z")}>
        <I18nextProvider i18n={englishI18n()}>
          <ThemeProvider theme={testTheme}>
            <MemoryRouter>
              <OrgReviews contractor={org} />
            </MemoryRouter>
          </ThemeProvider>
        </I18nextProvider>
      </RenderTimeProvider>
    </Provider>
  )
}

describe("OrgReviews server render and hydration", () => {
  const originalTZ = process.env.TZ
  beforeEach(() => {
    mockReviewsResult = querySuccess<ReviewsEndpoint>(reviews)
    // The server (Cloudflare) renders in UTC.
    process.env.TZ = "UTC"
  })
  afterEach(() => {
    process.env.TZ = originalTZ
    vi.restoreAllMocks()
  })

  it("prints the review dates in UTC on the server", () => {
    const html = renderToString(page())
    expect(html).toContain("November 3, 2025")
    expect(html).toContain("October 24, 2025")
  })

  it("hydrates in Los Angeles with zero mismatches, then shows the visitor's own dates", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(page())
    document.body.appendChild(container)
    // The visitor's machine: UTC-8, where both reviews fall on the day before.
    process.env.TZ = "America/Los_Angeles"

    const errors: unknown[] = []
    const consoleErrors: string[] = []
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        consoleErrors.push(args.map(String).join(" "))
      })
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, page(), {
        onRecoverableError: (error) => errors.push(error),
      })
    })

    expect(errors).toEqual([])
    expect(
      consoleErrors.filter((m) => /hydrat|did not match/i.test(m)),
    ).toEqual([])
    // Once hydrated, the dates are in the visitor's zone.
    expect(container.textContent).toContain("November 2, 2025")
    expect(container.textContent).toContain("October 23, 2025")
    consoleSpy.mockRestore()
    act(() => root!.unmount())
    container.remove()
  })
})
