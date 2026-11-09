/**
 * Comparison tables (/wiki/compare/:category): the pure parts. URL state
 * (filters, sort, the 2-4 items picked for the side-by-side view), filtering,
 * sorting and the best value of each stat.
 *
 * Everything lives in the URL so a table, a filtered view or a comparison
 * can be shared as a link:
 *   /wiki/compare/shield?grade=A&size=2&sort=shieldHp&dir=desc
 *   /wiki/compare/shield?compare=<uuid>,<uuid>&view=compare
 */
import type {
  WikiCompareCategory,
  WikiCompareColumn,
  WikiCompareRow,
} from "../../../store/api/v2/market"

/** Most items in a side-by-side comparison. */
export const MAX_COMPARE = 4
/** Fewest items a comparison needs. */
export const MIN_COMPARE = 2

/** The categories, in hub order, by group (labels: wiki.compare.category.*). */
export const COMPARE_GROUPS: readonly {
  group: "ship" | "fps"
  categories: readonly WikiCompareCategory[]
}[] = [
  {
    group: "ship",
    categories: [
      "quantum-drive",
      "shield",
      "power-plant",
      "cooler",
      "radar",
      "jump-drive",
      "ship-weapon",
      "missile",
      "countermeasure",
      "mining-head",
    ],
  },
  {
    group: "fps",
    categories: [
      "fps-weapon",
      "helmet",
      "torso",
      "arms",
      "legs",
      "undersuit",
      "backpack",
    ],
  },
]

export const COMPARE_CATEGORIES: readonly WikiCompareCategory[] =
  COMPARE_GROUPS.flatMap((g) => g.categories)

export const DEFAULT_COMPARE_CATEGORY: WikiCompareCategory = "quantum-drive"

export function isCompareCategory(
  value: string | undefined,
): value is WikiCompareCategory {
  return (
    value !== undefined &&
    (COMPARE_CATEGORIES as readonly string[]).includes(value)
  )
}

/** The fields rows can be filtered on (each a single choice). */
export const FILTER_FIELDS = [
  "class",
  "grade",
  "size",
  "type",
  "manufacturer",
] as const
export type FilterField = (typeof FILTER_FIELDS)[number]

export interface CompareFilters {
  /** Name contains (case-insensitive) */
  q: string
  /** Selected value per field; absent = any */
  values: Partial<Record<FilterField, string>>
  /** Only items somebody sells on SC Market */
  soldOnly: boolean
}

/** Built-in sort keys; any other key is a stat column key. */
export const BASE_SORT_KEYS = [
  "name",
  "class",
  "grade",
  "size",
  "manufacturer",
  "price",
] as const

export interface CompareSort {
  key: string
  dir: "asc" | "desc"
}

export interface CompareUrlState {
  filters: CompareFilters
  sort: CompareSort
  /** Items picked for the comparison (ids, in pick order, at most MAX_COMPARE) */
  selected: string[]
  /** The side-by-side view is open */
  view: boolean
}

const DEFAULT_SORT: CompareSort = { key: "name", dir: "asc" }

/** URL parameter of each filter field. */
const FILTER_PARAM: Record<FilterField, string> = {
  class: "class",
  grade: "grade",
  size: "size",
  type: "type",
  manufacturer: "mfr",
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The selection from `compare=`: valid ids, unique, at most MAX_COMPARE. */
export function parseSelection(value: string | null): string[] {
  if (!value) return []
  const ids = value
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter((id) => UUID.test(id))
  return [...new Set(ids)].slice(0, MAX_COMPARE)
}

export function readCompareState(params: URLSearchParams): CompareUrlState {
  const values: CompareFilters["values"] = {}
  for (const field of FILTER_FIELDS) {
    const v = params.get(FILTER_PARAM[field])
    if (v) values[field] = v
  }
  const sortKey = params.get("sort")
  const dir = params.get("dir") === "desc" ? "desc" : "asc"
  return {
    filters: {
      q: params.get("q") ?? "",
      values,
      soldOnly: params.get("sold") === "1",
    },
    sort: sortKey ? { key: sortKey, dir } : DEFAULT_SORT,
    selected: parseSelection(params.get("compare")),
    view: params.get("view") === "compare",
  }
}

/**
 * The URL parameters for a state. Defaults are left out, so a plain table is
 * a plain URL.
 */
export function writeCompareState(state: CompareUrlState): URLSearchParams {
  const p = new URLSearchParams()
  if (state.filters.q.trim()) p.set("q", state.filters.q)
  for (const field of FILTER_FIELDS) {
    const v = state.filters.values[field]
    if (v) p.set(FILTER_PARAM[field], v)
  }
  if (state.filters.soldOnly) p.set("sold", "1")
  if (
    state.sort.key !== DEFAULT_SORT.key ||
    state.sort.dir !== DEFAULT_SORT.dir
  ) {
    p.set("sort", state.sort.key)
    p.set("dir", state.sort.dir)
  }
  const selected = state.selected.slice(0, MAX_COMPARE)
  if (selected.length) p.set("compare", selected.join(","))
  if (state.view && selected.length >= MIN_COMPARE) p.set("view", "compare")
  return p
}

/** A row's value of a filter field, as the filter compares it. */
export function filterValue(
  row: WikiCompareRow,
  field: FilterField,
): string | null {
  switch (field) {
    case "class":
      return row.class
    case "grade":
      return row.grade
    case "size":
      return row.size === null ? null : String(row.size)
    case "type":
      return row.sub_type
    case "manufacturer":
      return row.manufacturer
  }
}

export function filterRows(
  rows: readonly WikiCompareRow[],
  filters: CompareFilters,
): WikiCompareRow[] {
  const q = filters.q.trim().toLowerCase()
  return rows.filter((row) => {
    if (q && !row.name.toLowerCase().includes(q)) return false
    if (filters.soldOnly && !(row.market && row.market.seller_count > 0))
      return false
    for (const field of FILTER_FIELDS) {
      const want = filters.values[field]
      if (want !== undefined && filterValue(row, field) !== want) return false
    }
    return true
  })
}

const SIZE_COLLATOR = new Intl.Collator("en", { numeric: true })

/**
 * The options of each filter: the values the rows have, sorted. A field
 * with fewer than two values has nothing to filter and is left out.
 */
export function filterOptions(
  rows: readonly WikiCompareRow[],
): Partial<Record<FilterField, string[]>> {
  const out: Partial<Record<FilterField, string[]>> = {}
  for (const field of FILTER_FIELDS) {
    const values = new Set<string>()
    for (const row of rows) {
      const v = filterValue(row, field)
      if (v !== null && v !== "") values.add(v)
    }
    if (values.size >= 2) {
      out[field] = [...values].sort(SIZE_COLLATOR.compare)
    }
  }
  return out
}

/** A row's value for a sort key: number, text, or null (missing). */
export function sortValue(
  row: WikiCompareRow,
  key: string,
): number | string | null {
  switch (key) {
    case "name":
      return row.name
    case "class":
      return row.class
    case "grade":
      return row.grade
    case "size":
      return row.size
    case "manufacturer":
      return row.manufacturer
    case "price":
      return row.market && row.market.seller_count > 0
        ? row.market.lowest_price
        : null
    default:
      return row.stats[key] ?? null
  }
}

const NAME_COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
})

/**
 * Rows sorted by a key. Missing values go last in either direction (an
 * unknown stat is never "the best"), numbers before text; ties by name.
 */
export function sortRows(
  rows: readonly WikiCompareRow[],
  sort: CompareSort,
): WikiCompareRow[] {
  const sign = sort.dir === "desc" ? -1 : 1
  return [...rows].sort((a, b) => {
    const va = sortValue(a, sort.key)
    const vb = sortValue(b, sort.key)
    if (va === null || vb === null) {
      if (va !== vb) return va === null ? 1 : -1
    } else if (typeof va === "number" && typeof vb === "number") {
      if (va !== vb) return (va - vb) * sign
    } else if (typeof va === "number" || typeof vb === "number") {
      return typeof va === "number" ? -1 : 1
    } else {
      const c = NAME_COLLATOR.compare(va, vb)
      if (c !== 0) return c * sign
    }
    return NAME_COLLATOR.compare(a.name, b.name) || a.id.localeCompare(b.id)
  })
}

/** Whether a sort key is valid for a table (a base key or one of its columns). */
export function isSortKey(
  key: string,
  columns: readonly WikiCompareColumn[],
): boolean {
  return (
    (BASE_SORT_KEYS as readonly string[]).includes(key) ||
    columns.some((c) => c.key === key)
  )
}

/**
 * Pick or unpick an item. Picking a fifth item does nothing (the caller
 * says why); unpicking keeps the others' order.
 */
export function toggleSelected(
  selected: readonly string[],
  id: string,
): string[] {
  const key = id.toLowerCase()
  if (selected.includes(key)) return selected.filter((s) => s !== key)
  if (selected.length >= MAX_COMPARE) return [...selected]
  return [...selected, key]
}

/** The comparison's price row: lower is better. */
export const PRICE_KEY = "price"

/**
 * The best value of each ranked stat among the compared rows (and of the
 * price, lowest). A stat gets one only when at least two rows have a number
 * for it and they are not all equal, so a lone or uniform value is never
 * highlighted.
 */
export function bestValues(
  rows: readonly WikiCompareRow[],
  columns: readonly WikiCompareColumn[],
): Map<string, number> {
  const ranked: { key: string; better: "higher" | "lower" }[] = [
    ...columns.flatMap((c) =>
      c.kind === "number" && c.better ? [{ key: c.key, better: c.better }] : [],
    ),
    { key: PRICE_KEY, better: "lower" },
  ]
  const out = new Map<string, number>()
  for (const { key, better } of ranked) {
    const nums = rows
      .map((r) => sortValue(r, key))
      .filter((v): v is number => typeof v === "number")
    if (nums.length < 2) continue
    const best = better === "higher" ? Math.max(...nums) : Math.min(...nums)
    if (nums.every((n) => n === best)) continue
    out.set(key, best)
  }
  return out
}
