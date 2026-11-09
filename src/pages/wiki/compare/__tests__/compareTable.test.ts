import { describe, expect, it } from "vitest"
import type {
  WikiCompareColumn,
  WikiCompareRow,
} from "../../../../store/api/v2/market"
import {
  MAX_COMPARE,
  bestValues,
  filterOptions,
  filterRows,
  isSortKey,
  parseSelection,
  readCompareState,
  sortRows,
  toggleSelected,
  writeCompareState,
} from "../compareTable"

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`

function row(
  n: number,
  overrides: Partial<WikiCompareRow> = {},
): WikiCompareRow {
  return {
    id: id(n),
    name: `Item ${n}`,
    size: 1,
    grade: "A",
    class: "Military",
    sub_type: null,
    manufacturer: "Behring",
    manufacturer_code: "behr",
    image_url: null,
    thumbnail_path: null,
    stats: {},
    market: null,
    ...overrides,
  }
}

const market = (n: number, lowest: number | null, sellers = 1) => ({
  game_item_id: id(n),
  lowest_price: lowest,
  seller_count: sellers,
  listing_count: sellers,
})

const COLUMNS: WikiCompareColumn[] = [
  { key: "shieldHp", kind: "number", better: "higher", unit: null },
  { key: "downedRegenDelay", kind: "number", better: "lower", unit: "s" },
  { key: "fireModes", kind: "text", better: null, unit: null },
]

describe("sortRows", () => {
  const rows = [
    row(1, { name: "Bravo", stats: { shieldHp: 500 } }),
    row(2, { name: "Alpha", stats: { shieldHp: 900 } }),
    row(3, { name: "Charlie", stats: {} }),
    row(4, { name: "Delta", stats: { shieldHp: 500 } }),
  ]

  it("sorts by a stat both ways, missing values last either way", () => {
    expect(
      sortRows(rows, { key: "shieldHp", dir: "desc" }).map((r) => r.name),
    ).toEqual(["Alpha", "Bravo", "Delta", "Charlie"])
    expect(
      sortRows(rows, { key: "shieldHp", dir: "asc" }).map((r) => r.name),
    ).toEqual(["Bravo", "Delta", "Alpha", "Charlie"])
  })

  it("sorts by name (numeric-aware) and by price, unsold last", () => {
    const named = [row(1, { name: "S10 Gun" }), row(2, { name: "S2 Gun" })]
    expect(
      sortRows(named, { key: "name", dir: "asc" }).map((r) => r.name),
    ).toEqual(["S2 Gun", "S10 Gun"])
    const priced = [
      row(1, { market: market(1, 5000) }),
      row(2),
      row(3, { market: market(3, 1200) }),
      row(4, { market: market(4, null, 2) }),
    ]
    expect(
      sortRows(priced, { key: "price", dir: "asc" }).map((r) => r.id),
    ).toEqual([id(3), id(1), id(2), id(4)])
  })

  it("puts numbers before text in a number column", () => {
    const mixed = [
      row(1, { stats: { range: "3-4" } }),
      row(2, { stats: { range: 100 } }),
    ]
    expect(sortRows(mixed, { key: "range", dir: "desc" })[0].id).toBe(id(2))
  })

  it("only accepts base keys and the table's columns", () => {
    expect(isSortKey("price", COLUMNS)).toBe(true)
    expect(isSortKey("shieldHp", COLUMNS)).toBe(true)
    expect(isSortKey("powerOutput", COLUMNS)).toBe(false)
  })
})

describe("filterRows / filterOptions", () => {
  const rows = [
    row(1, { name: "FR-66", grade: "A", size: 2, class: "Military" }),
    row(2, { name: "Rampart", grade: "C", size: 2, class: "Civilian" }),
    row(3, {
      name: "Palisade",
      grade: "A",
      size: 1,
      class: "Military",
      market: market(3, 9000),
    }),
  ]

  it("combines name, field and sold-only filters", () => {
    const f = (patch: Parameters<typeof filterRows>[1]) =>
      filterRows(rows, patch).map((r) => r.name)
    expect(f({ q: "", values: { grade: "A" }, soldOnly: false })).toEqual([
      "FR-66",
      "Palisade",
    ])
    expect(
      f({ q: "", values: { grade: "A", size: "2" }, soldOnly: false }),
    ).toEqual(["FR-66"])
    expect(f({ q: "ram", values: {}, soldOnly: false })).toEqual(["Rampart"])
    expect(f({ q: "", values: {}, soldOnly: true })).toEqual(["Palisade"])
  })

  it("offers only fields with at least two values", () => {
    const options = filterOptions(rows)
    expect(options.grade).toEqual(["A", "C"])
    expect(options.size).toEqual(["1", "2"])
    expect(options.class).toEqual(["Civilian", "Military"])
    // Every row has the same manufacturer and no sub-type: nothing to filter.
    expect(options.manufacturer).toBeUndefined()
    expect(options.type).toBeUndefined()
  })
})

describe("URL state", () => {
  it("round-trips filters, sort, selection and the compare view", () => {
    const params = new URLSearchParams(
      `q=gun&grade=A&size=2&mfr=Behring&sold=1&sort=shieldHp&dir=desc&compare=${id(1)},${id(2)}&view=compare`,
    )
    const state = readCompareState(params)
    expect(state).toEqual({
      filters: {
        q: "gun",
        values: { grade: "A", size: "2", manufacturer: "Behring" },
        soldOnly: true,
      },
      sort: { key: "shieldHp", dir: "desc" },
      selected: [id(1), id(2)],
      view: true,
    })
    expect(readCompareState(writeCompareState(state))).toEqual(state)
  })

  it("leaves defaults out of the URL", () => {
    expect(
      String(writeCompareState(readCompareState(new URLSearchParams()))),
    ).toBe("")
  })

  it("drops the compare view with fewer than two items", () => {
    const state = readCompareState(
      new URLSearchParams(`compare=${id(1)}&view=compare`),
    )
    expect(writeCompareState(state).has("view")).toBe(false)
  })

  it("keeps only valid, unique ids, at most four", () => {
    expect(
      parseSelection(
        `${id(1)},nope,${id(1).toUpperCase()},${id(2)},${id(3)},${id(4)},${id(5)}`,
      ),
    ).toEqual([id(1), id(2), id(3), id(4)])
  })
})

describe("toggleSelected", () => {
  it("adds, removes and stops at the maximum", () => {
    let s: string[] = []
    for (let n = 1; n <= MAX_COMPARE + 1; n++) s = toggleSelected(s, id(n))
    expect(s).toEqual([id(1), id(2), id(3), id(4)])
    s = toggleSelected(s, id(2))
    expect(s).toEqual([id(1), id(3), id(4)])
  })
})

describe("bestValues", () => {
  it("picks the best of each ranked stat and the lowest price", () => {
    const rows = [
      row(1, {
        stats: { shieldHp: 900, downedRegenDelay: 6, fireModes: "Rapid" },
        market: market(1, 5000),
      }),
      row(2, {
        stats: { shieldHp: 700, downedRegenDelay: 4 },
        market: market(2, 3000),
      }),
    ]
    const best = bestValues(rows, COLUMNS)
    expect(best.get("shieldHp")).toBe(900)
    expect(best.get("downedRegenDelay")).toBe(4)
    expect(best.get("price")).toBe(3000)
    expect(best.has("fireModes")).toBe(false)
  })

  it("highlights nothing for a lone or uniform value", () => {
    const rows = [
      row(1, { stats: { shieldHp: 900, downedRegenDelay: 5 } }),
      row(2, { stats: { downedRegenDelay: 5 } }),
    ]
    const best = bestValues(rows, COLUMNS)
    expect(best.has("shieldHp")).toBe(false)
    expect(best.has("downedRegenDelay")).toBe(false)
  })
})
