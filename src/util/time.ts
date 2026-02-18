import i18n from "../util/i18n"
import {
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  isAfter,
  parseISO,
  format as dateFnsFormat,
} from "date-fns"
import { enUS, uk, zhCN } from "date-fns/locale"

const locales = { en: enUS, uk, "zh-CN": zhCN }

export const format = (date: Date | number, formatStr: string) =>
  dateFnsFormat(date, formatStr, {
    locale: locales[i18n.language as keyof typeof locales] || enUS,
  })

const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
}

const getRtf = () =>
  new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" })

export const getRelativeTime = (d1: Date, d2: Date = new Date()) => {
  const elapsed = d1.getTime() - d2.getTime()

  for (const [u, val] of Object.entries(units))
    if (Math.abs(elapsed) > val || u === "second")
      return getRtf().format(
        Math.round(elapsed / val),
        u as Intl.RelativeTimeFormatUnit,
      )

  return ""
}

export function formatMostSignificantDiff(future: Date | string): string {
  const futureDate = typeof future === "string" ? parseISO(future) : future
  const now = new Date()

  if (isNaN(futureDate.getTime()) || !isAfter(futureDate, now)) {
    return "0s"
  }

  const months = differenceInMonths(futureDate, now)
  if (months > 0) return `${months}mo`

  const days = differenceInDays(futureDate, now)
  if (days > 0) return `${days}d`

  const hours = differenceInHours(futureDate, now) % 24
  if (hours > 0) return `${hours}h`

  const minutes = differenceInMinutes(futureDate, now) % 60
  if (minutes > 0) return `${minutes}m`

  const seconds = differenceInSeconds(futureDate, now) % 60
  if (seconds > 0) return `${seconds}s`

  return "0s"
}
