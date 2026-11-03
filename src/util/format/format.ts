/**
 * Numbers, aUEC prices, quantities, percentages, dates, times, relative
 * times and durations, in an explicit locale.
 *
 * Every formatter takes the locale to format in: a server render and the
 * browser hydrating it must produce the same text, so nothing here reads
 * the machine's locale, time zone or clock. Components use useFormatters()
 * (the page's language, and UTC until hydrated) and useNow(); code outside
 * React passes `pageLocale()` (./pageLocale.ts) or a fixed "en" for
 * English-only text (crawler summaries, SEO strings). Pure (tested).
 */

/** A shipped locale code ("en", "de", "zh-CN", ...) or any BCP-47 tag. */
export type FormatLocale = string

/** A date as the API sends it (ISO string), a Date, or ms since the epoch. */
export type DateInput = Date | string | number

const numberFormats = new Map<string, Intl.NumberFormat>()
const dateFormats = new Map<string, Intl.DateTimeFormat>()
const relativeFormats = new Map<string, Intl.RelativeTimeFormat>()

function cacheKey(locale: string, options: object | undefined): string {
  return options ? `${locale}|${JSON.stringify(options)}` : locale
}

function numberFormat(
  locale: FormatLocale,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = cacheKey(locale, options)
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(locale, options)
    numberFormats.set(key, format)
  }
  return format
}

function dateFormat(
  locale: FormatLocale,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = cacheKey(locale, options)
  let format = dateFormats.get(key)
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options)
    dateFormats.set(key, format)
  }
  return format
}

function relativeFormat(
  locale: FormatLocale,
  options: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  const key = cacheKey(locale, options)
  let format = relativeFormats.get(key)
  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, options)
    relativeFormats.set(key, format)
  }
  return format
}

/** `value` as a number: the v2 API sends some amounts as numeric strings. */
function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return NaN
  return typeof value === "number" ? value : Number(value)
}

// ── Numbers ────────────────────────────────────────────────────────────────

/**
 * A number with the locale's digits and grouping ("1,500", "1.500",
 * "1 500"). Same defaults as Number#toLocaleString (up to 3 decimals).
 * Numeric strings are accepted; anything else that isn't a finite number
 * gives "" (never "NaN").
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale: FormatLocale,
  options?: Intl.NumberFormatOptions,
): string {
  const n = toNumber(value)
  if (!Number.isFinite(n)) return ""
  return numberFormat(locale, options).format(n)
}

/** A whole number (rounded): counts, aUEC amounts, ranks. */
export function formatInteger(
  value: number | string | null | undefined,
  locale: FormatLocale,
): string {
  return formatNumber(value, locale, { maximumFractionDigits: 0 })
}

/**
 * A large number in the locale's short form: "1.5M", "1,5 Mio.", "150万".
 * `display: "long"` spells it ("1.5 million"). Rounds toward zero, so a stat
 * never claims more than the real number; under 1,000 it is printed in full.
 */
export function formatCompact(
  value: number | string | null | undefined,
  locale: FormatLocale,
  { display = "short" }: { display?: "short" | "long" } = {},
): string {
  return formatNumber(value, locale, {
    notation: "compact",
    compactDisplay: display,
    maximumFractionDigits: 1,
    roundingMode: "trunc",
  } as Intl.NumberFormatOptions)
}

/**
 * A ratio as a percentage: 0.456 → "46%" ("46 %" in de/fr). Use
 * `maximumFractionDigits` for "45.6%". For a value that is already a
 * percentage (45.6), divide by 100 first.
 */
export function formatPercent(
  ratio: number | string | null | undefined,
  locale: FormatLocale,
  { maximumFractionDigits = 0 }: { maximumFractionDigits?: number } = {},
): string {
  return formatNumber(ratio, locale, {
    style: "percent",
    maximumFractionDigits,
  })
}

// ── aUEC ───────────────────────────────────────────────────────────────────

/** The game currency's symbol: never translated. */
export const AUEC = "aUEC"

/** What a missing or zero price shows. */
export const NO_PRICE = `— ${AUEC}`

/**
 * An aUEC price for display, abbreviated from 100,000 up in the locale's
 * short form: "1,500 aUEC", "150K aUEC", "1.5M aUEC", "15B aUEC" (en);
 * "1.500 aUEC", "1,5 Mio. aUEC" (de); "15万 aUEC" (ja). Missing or zero
 * shows "— aUEC". Under 100,000 it is exact (up to 2 decimals: per-unit
 * prices of commodities can be fractional).
 */
export function formatPrice(
  amount: number | string | null | undefined,
  locale: FormatLocale,
): string {
  const value = toNumber(amount)
  if (!Number.isFinite(value) || value === 0) return NO_PRICE
  const abs = Math.abs(value)
  if (abs < 100_000) {
    return `${formatNumber(value, locale, { maximumFractionDigits: 2 })} ${AUEC}`
  }
  const compact = formatNumber(value, locale, {
    notation: "compact",
    // 151K, but 1.5M and 15.3B: as precise as the old K/M/B abbreviations.
    maximumFractionDigits: abs < 1_000_000 ? 0 : 1,
  })
  return `${compact} ${AUEC}`
}

/**
 * The exact price, rounded to whole aUEC: "50,000,000 aUEC". The hover
 * title of an abbreviated price. Undefined for a missing or zero price.
 */
export function formatExactPrice(
  amount: number | string | null | undefined,
  locale: FormatLocale,
): string | undefined {
  const value = toNumber(amount)
  if (!Number.isFinite(value) || value === 0) return undefined
  return `${formatInteger(value, locale)} ${AUEC}`
}

/** An aUEC amount, exact and rounded, whatever its size (0 → "0 aUEC"). */
export function formatAuec(
  amount: number | string | null | undefined,
  locale: FormatLocale,
): string {
  const value = toNumber(amount)
  if (!Number.isFinite(value)) return NO_PRICE
  return `${formatInteger(value, locale)} ${AUEC}`
}

/** A price range, "1,000 – 1,500 aUEC", abbreviated like formatPrice. */
export function formatPriceRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  locale: FormatLocale,
): string {
  const lo = toNumber(min)
  const hi = toNumber(max)
  if (!Number.isFinite(hi) || hi === 0 || lo === hi) {
    return formatPrice(min, locale)
  }
  const low = formatPrice(lo, locale)
  return `${low.endsWith(` ${AUEC}`) ? low.slice(0, -AUEC.length - 1) : low} – ${formatPrice(hi, locale)}`
}

// ── Quantities ─────────────────────────────────────────────────────────────

/**
 * A stock quantity with its unit. SCU items are stored in cSCU (1 SCU =
 * 100 cSCU) and shown in the more readable unit: 250 → "2.50 SCU" (whole
 * SCU without decimals: "3 SCU"), 50 → "50 cSCU". Discrete items are just
 * the number ("1,500").
 */
export function formatQuantity(
  value: number | string | null | undefined,
  unit: "unit" | "scu" | string = "unit",
  locale: FormatLocale,
): string {
  const n = toNumber(value)
  if (!Number.isFinite(n)) return ""
  if (unit === "scu") {
    if (n >= 100) {
      const scu = n / 100
      const digits = scu % 1 === 0 ? 0 : 2
      return `${formatNumber(scu, locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })} SCU`
    }
    return `${formatNumber(n, locale)} cSCU`
  }
  return formatNumber(n, locale)
}

// ── Dates and times ────────────────────────────────────────────────────────

/** Formatting options plus the time zone (undefined: the machine's own). */
export type DateFormatOptions = Intl.DateTimeFormatOptions

function toDate(value: DateInput | null | undefined): Date | null {
  if (value == null || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const hasTimeFields = (o: Intl.DateTimeFormatOptions) =>
  o.timeStyle !== undefined ||
  o.hour !== undefined ||
  o.minute !== undefined ||
  o.second !== undefined

/**
 * Times rendered in UTC (a server render: it knows no visitor time zone)
 * say so, "14:00 UTC", so the text is true before the browser switches to
 * the visitor's zone.
 */
function labelUtc(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  if (
    options.timeZone === "UTC" &&
    options.timeZoneName === undefined &&
    options.timeStyle === undefined &&
    hasTimeFields(options)
  ) {
    return { ...options, timeZoneName: "short" }
  }
  return options
}

function formatDateWith(
  value: DateInput | null | undefined,
  locale: FormatLocale,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(value)
  if (!date) return ""
  return dateFormat(locale, labelUtc(options)).format(date)
}

/** Which fields are set, so a caller's `{ timeZone }` keeps the defaults. */
const hasDateFields = (o: Intl.DateTimeFormatOptions) =>
  o.dateStyle !== undefined ||
  o.year !== undefined ||
  o.month !== undefined ||
  o.day !== undefined ||
  o.weekday !== undefined ||
  o.era !== undefined

/**
 * A date ("11/3/2026", "3.11.2026", "2026/11/3"): Date#toLocaleDateString's
 * default fields unless `options` names its own. An invalid or missing date
 * gives "".
 */
export function formatDate(
  value: DateInput | null | undefined,
  locale: FormatLocale,
  options: DateFormatOptions = {},
): string {
  return formatDateWith(
    value,
    locale,
    hasDateFields(options) || hasTimeFields(options)
      ? options
      : { year: "numeric", month: "numeric", day: "numeric", ...options },
  )
}

/** A time of day ("2:05:09 PM"): Date#toLocaleTimeString's default fields unless `options` names its own. */
export function formatTime(
  value: DateInput | null | undefined,
  locale: FormatLocale,
  options: DateFormatOptions = {},
): string {
  return formatDateWith(
    value,
    locale,
    hasDateFields(options) || hasTimeFields(options)
      ? options
      : { hour: "numeric", minute: "2-digit", second: "2-digit", ...options },
  )
}

/** A date and time: Date#toLocaleString's default fields unless `options` names its own. */
export function formatDateTime(
  value: DateInput | null | undefined,
  locale: FormatLocale,
  options: DateFormatOptions = {},
): string {
  return formatDateWith(
    value,
    locale,
    hasDateFields(options) || hasTimeFields(options)
      ? options
      : {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          ...options,
        },
  )
}

// ── Relative times and durations ───────────────────────────────────────────

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", (365 * 24 * 60 * 60 * 1000) / 12],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
  ["second", 1000],
]

/**
 * `value` relative to `now`, in its largest whole unit: "3 days ago",
 * "in 2 hours", "yesterday" (`numeric: "auto"`, the default). `now` is
 * explicit (useNow() in components) so a server render and the hydrating
 * browser agree.
 */
export function formatRelative(
  value: DateInput | null | undefined,
  now: DateInput,
  locale: FormatLocale,
  {
    numeric = "auto",
    style = "long",
  }: Pick<Intl.RelativeTimeFormatOptions, "numeric" | "style"> = {},
): string {
  const date = toDate(value)
  const reference = toDate(now)
  if (!date || !reference) return ""
  const elapsed = date.getTime() - reference.getTime()
  const format = relativeFormat(locale, { numeric, style })
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) > ms || unit === "second") {
      return format.format(Math.round(elapsed / ms), unit)
    }
  }
  return ""
}

const DURATION_UNITS: [Intl.NumberFormatOptions["unit"] & string, number][] = [
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
  ["second", 1000],
]

/**
 * A length of time in its largest units: 90 min → "1h 30m" (en), "1 Std.
 * 30 Min." (de), "1小时30分钟" (zh-CN). `units` caps how many units are
 * shown (2 by default: "3d 4h"); the smallest shown is rounded down.
 * Negative or zero durations show as zero seconds ("0s").
 */
export function formatDuration(
  ms: number,
  locale: FormatLocale,
  {
    units = 2,
    unitDisplay = "narrow",
  }: { units?: number; unitDisplay?: "narrow" | "short" | "long" } = {},
): string {
  let rest = Number.isFinite(ms) ? Math.max(0, ms) : 0
  const parts: string[] = []
  for (const [unit, size] of DURATION_UNITS) {
    const count = Math.floor(rest / size)
    if (count > 0 || (unit === "second" && parts.length === 0)) {
      parts.push(
        numberFormat(locale, { style: "unit", unit, unitDisplay }).format(count),
      )
      rest -= count * size
    }
    if (parts.length >= units) break
  }
  // Chinese and Japanese durations aren't spaced ("1小时30分钟").
  const separator = /^(zh|ja)\b/.test(locale) ? "" : " "
  return parts.join(separator)
}

/**
 * How long until `future`, in its single most significant unit: "3d", "5h",
 * "12m", "0s" once it has passed (StockManager's expiry column, the bid
 * timer).
 */
export function formatTimeUntil(
  future: DateInput | null | undefined,
  now: DateInput,
  locale: FormatLocale,
): string {
  const date = toDate(future)
  const reference = toDate(now)
  const ms = date && reference ? date.getTime() - reference.getTime() : 0
  return formatDuration(ms, locale, { units: 1 })
}
