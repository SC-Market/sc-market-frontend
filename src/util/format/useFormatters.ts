import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toSupportedLocale } from "../locales"
import { useRenderTimeZone } from "./renderTime"
import {
  formatAuec,
  formatCompact,
  formatDate,
  formatDateTime,
  formatDuration,
  formatExactPrice,
  formatInteger,
  formatNumber,
  formatPercent,
  formatPrice,
  formatPriceRange,
  formatQuantity,
  formatRelative,
  formatTime,
  formatTimeUntil,
  type DateFormatOptions,
  type DateInput,
} from "./format"

/**
 * The formatters (./format.ts) bound to the page's language (the i18next
 * instance rendering it: per request on the server, the visitor's in the
 * browser) and, for dates, the render time zone (UTC until hydrated). For
 * relative times, pass useNow().
 */
export function useFormatters() {
  const { i18n } = useTranslation()
  const locale = toSupportedLocale(i18n.language || "en")
  const timeZone = useRenderTimeZone()
  return useMemo(() => {
    const zoned = (options?: DateFormatOptions): DateFormatOptions => ({
      timeZone,
      ...options,
    })
    return {
      locale,
      timeZone,
      number: (
        value: number | string | null | undefined,
        options?: Intl.NumberFormatOptions,
      ) => formatNumber(value, locale, options),
      integer: (value: number | string | null | undefined) =>
        formatInteger(value, locale),
      compact: (
        value: number | string | null | undefined,
        options?: { display?: "short" | "long" },
      ) => formatCompact(value, locale, options),
      percent: (
        ratio: number | string | null | undefined,
        options?: { maximumFractionDigits?: number },
      ) => formatPercent(ratio, locale, options),
      price: (amount: number | string | null | undefined) =>
        formatPrice(amount, locale),
      exactPrice: (amount: number | string | null | undefined) =>
        formatExactPrice(amount, locale),
      auec: (amount: number | string | null | undefined) =>
        formatAuec(amount, locale),
      priceRange: (
        min: number | string | null | undefined,
        max: number | string | null | undefined,
      ) => formatPriceRange(min, max, locale),
      quantity: (value: number | string | null | undefined, unit?: string) =>
        formatQuantity(value, unit, locale),
      date: (
        value: DateInput | null | undefined,
        options?: DateFormatOptions,
      ) => formatDate(value, locale, zoned(options)),
      time: (
        value: DateInput | null | undefined,
        options?: DateFormatOptions,
      ) => formatTime(value, locale, zoned(options)),
      dateTime: (
        value: DateInput | null | undefined,
        options?: DateFormatOptions,
      ) => formatDateTime(value, locale, zoned(options)),
      relative: (
        value: DateInput | null | undefined,
        now: DateInput,
        options?: Parameters<typeof formatRelative>[3],
      ) => formatRelative(value, now, locale, options),
      duration: (ms: number, options?: Parameters<typeof formatDuration>[2]) =>
        formatDuration(ms, locale, options),
      timeUntil: (future: DateInput | null | undefined, now: DateInput) =>
        formatTimeUntil(future, now, locale),
    }
  }, [locale, timeZone])
}

export type Formatters = ReturnType<typeof useFormatters>
