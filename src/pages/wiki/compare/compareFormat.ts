/**
 * Labels and display values of the comparison tables' columns.
 */
import type { TFunction } from "i18next"
import type {
  WikiCompareCategory,
  WikiCompareColumn,
} from "../../../store/api/v2/market"
import type { useFormatters } from "../../../util/format"
import type { FilterField } from "./compareTable"

type Formatters = ReturnType<typeof useFormatters>

/** A category's name ("Quantum drives"). */
export function categoryLabel(
  t: TFunction,
  category: WikiCompareCategory,
): string {
  return t(`wikiCompare.category.${category}`)
}

/** A stat column's header; the key itself when there's no label yet. */
export function statLabel(t: TFunction, key: string): string {
  return t(`wikiCompare.stat.${key}`, { defaultValue: key })
}

/** A filter field's label. */
export function filterLabel(t: TFunction, field: FilterField): string {
  return t(`wikiCompare.filter.${field}`)
}

/** A stat value with its unit: "1,320 m/s", "40%", "Rapid, Burst". */
export function formatStat(
  value: number | string | undefined | null,
  column: Pick<WikiCompareColumn, "unit">,
  fmt: Formatters,
): string {
  if (value === undefined || value === null || value === "") return "—"
  if (typeof value === "string") return value
  const n = fmt.number(value, { maximumFractionDigits: 2 })
  if (!column.unit) return n
  return column.unit === "%" ? `${n}%` : `${n} ${column.unit}`
}

/** A grade or size cell: "A", "S2", or a dash. */
export function formatSize(size: number | null): string {
  return size === null ? "—" : `S${size}`
}
