/**
 * The comparison page: filters and sort from the URL, picking items writes
 * the selection to the URL, a shared compare link opens the side-by-side
 * view with the best values highlighted. Rendered with the mobile card
 * layout (the DataGrid's own sorting and paging are MUI's).
 */
import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../../store/api/v2/market"
import type { WikiCompareResponse } from "../../../../store/api/v2/market"
import { querySuccess } from "../../../../__tests__/rtkQueryMocks"
import { mainTheme } from "../../../../hooks/styles/Theme"
import { WikiComparePage } from "../WikiComparePage"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock("../../../../hooks/layout/useBreakpoint", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useIsMobile: () => true,
}))

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`

const doc: WikiCompareResponse = {
  category: "shield",
  group: "ship",
  as_of: "2026-11-09T00:00:00.000Z",
  columns: [
    { key: "shieldHp", kind: "number", better: "higher", unit: null },
    { key: "downedRegenDelay", kind: "number", better: "lower", unit: "s" },
  ],
  items: [
    ["FR-66", "A", 2, "Military", 21000, 6, 90000],
    ["Rampart", "C", 2, "Civilian", 9000, 4, null],
    ["Palisade", "A", 1, "Military", 13200, 5, 40000],
  ].map(([name, grade, size, cls, hp, delay, lowest], i) => ({
    id: id(i + 1),
    name: name as string,
    grade: grade as string,
    size: size as number,
    class: cls as string,
    sub_type: null,
    manufacturer: "Gorgon",
    manufacturer_code: "gorg",
    image_url: null,
    thumbnail_path: null,
    stats: { shieldHp: hp as number, downedRegenDelay: delay as number },
    market:
      lowest === null
        ? null
        : {
            game_item_id: id(i + 1),
            lowest_price: lowest as number,
            seller_count: 2,
            listing_count: 3,
          },
  })),
}

let currentSearch = ""
function LocationSpy() {
  currentSearch = useLocation().search
  return null
}

function renderAt(url: string) {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route
            path="/wiki/compare/:category"
            element={
              <>
                <WikiComparePage />
                <LocationSpy />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const cardNames = () =>
  screen
    .getAllByTestId("compare-card")
    .map((c) => within(c).getAllByRole("link")[0].textContent)

beforeEach(() => {
  vi.spyOn(marketApi, "useGetCompareTableQuery").mockReturnValue(
    querySuccess<typeof marketApi.marketV2Api.endpoints.getCompareTable>(doc),
  )
})
afterEach(() => vi.restoreAllMocks())

describe("WikiComparePage", () => {
  it("lists the category's items by name with their stats and prices", () => {
    renderAt("/wiki/compare/shield")
    expect(cardNames()).toEqual(["FR-66", "Palisade", "Rampart"])
    expect(screen.getAllByText("Shield HP").length).toBeGreaterThan(0)
    expect(screen.getByText("21,000")).toBeInTheDocument()
    expect(screen.getByText("90,000 aUEC · 2 sellers")).toBeInTheDocument()
  })

  it("sorts and filters from the URL", () => {
    renderAt("/wiki/compare/shield?sort=shieldHp&dir=desc")
    expect(cardNames()).toEqual(["FR-66", "Palisade", "Rampart"])
    screenCleanup()
    renderAt("/wiki/compare/shield?sort=downedRegenDelay&dir=asc")
    expect(cardNames()).toEqual(["Rampart", "Palisade", "FR-66"])
    screenCleanup()
    renderAt("/wiki/compare/shield?grade=A&size=1")
    expect(cardNames()).toEqual(["Palisade"])
    screenCleanup()
    renderAt("/wiki/compare/shield?sold=1&sort=price&dir=asc")
    expect(cardNames()).toEqual(["Palisade", "FR-66"])
  })

  it("flips the sort direction into the URL", () => {
    renderAt("/wiki/compare/shield?sort=shieldHp&dir=desc")
    fireEvent.click(screen.getByRole("button", { name: "Descending" }))
    expect(new URLSearchParams(currentSearch).get("dir")).toBe("asc")
    expect(cardNames()).toEqual(["Rampart", "Palisade", "FR-66"])
  })

  it("writes picked items to the URL and opens the comparison", () => {
    renderAt("/wiki/compare/shield")
    const compare = screen.getByRole("button", { name: /^Compare \(/ })
    expect(compare).toBeDisabled()
    const boxes = screen.getAllByRole("checkbox", { name: "Compare" })
    fireEvent.click(boxes[0])
    fireEvent.click(boxes[2])
    expect(new URLSearchParams(currentSearch).get("compare")).toBe(
      `${id(1)},${id(2)}`,
    )
    expect(screen.getByText("2 of 4 selected")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Compare (2)" }))
    expect(new URLSearchParams(currentSearch).get("view")).toBe("compare")
    expect(screen.getByTestId("compare-side-by-side")).toBeInTheDocument()
  })

  it("opens a shared comparison link with the best values highlighted", () => {
    renderAt(
      `/wiki/compare/shield?compare=${id(1)},${id(2)},${id(3)}&view=compare`,
    )
    const table = screen.getByTestId("compare-side-by-side")
    const best = Array.from(table.querySelectorAll('[data-best="true"]')).map(
      (cell) => cell.textContent,
    )
    // Highest shield HP, shortest downed delay, lowest price, each marked
    // "Best" (the trophy icon's title) for screen readers too.
    expect(best).toEqual([
      "21,000Best",
      "4 sBest",
      "40,000 aUEC · 2 sellersBest",
    ])
    // Columns follow the pick order.
    const headers = within(table).getAllByRole("columnheader")
    expect(headers.slice(1).map((h) => h.textContent)).toEqual([
      "FR-66",
      "Rampart",
      "Palisade",
    ])
  })

  it("stops at four picks", () => {
    const five = [1, 2, 3, 4, 5].map(id).join(",")
    renderAt(`/wiki/compare/shield?compare=${five}`)
    // Only three exist in the table; the URL kept at most four ids.
    expect(screen.getByText("3 of 4 selected")).toBeInTheDocument()
  })

  it("explains an unknown category", () => {
    renderAt("/wiki/compare/nope")
    expect(
      screen.getByText("Unknown comparison category. Pick one above."),
    ).toBeInTheDocument()
  })
})

function screenCleanup() {
  document.body.innerHTML = ""
}
