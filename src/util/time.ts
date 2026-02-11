import i18n from "../util/i18n"
import { isValid, isBefore, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from "date-fns"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
}

// rtf now uses current language
const getRtf = () =>
  new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" })

export const getRelativeTime = (d1: Date, d2: Date = new Date()) => {
  const elapsed = d1.getTime() - d2.getTime()

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const [u, val] of Object.entries(units))
    if (Math.abs(elapsed) > val || u === "second")
      return getRtf().format(
        Math.round(elapsed / val),
        u as Intl.RelativeTimeFormatUnit,
      )

  return ""
}

/**
 * Returns the most significant time difference between now and a future date
 * in shorthand format (e.g., "1mo", "8d", "2h", "10m", "53s").
 *
 * @param future - The future date (Date object or string)
 * @returns A shorthand string representing the most significant time unit
 */
export function formatMostSignificantDiff(
  future: Date | string,
): string {
  const futureDate = typeof future === 'string' ? parseISO(future) : future
  const now = new Date()

  if (!isValid(futureDate) || isBefore(futureDate, now)) {
    return "0s"
  }

  const months = differenceInMonths(futureDate, now)
  if (months > 0) return `${months}mo`

  const days = differenceInDays(futureDate, now)
  if (days > 0) return `${days}d`

  const hours = differenceInHours(futureDate, now)
  if (hours > 0) return `${hours}h`

  const minutes = differenceInMinutes(futureDate, now)
  if (minutes > 0) return `${minutes}m`

  const seconds = differenceInSeconds(futureDate, now)
  if (seconds > 0) return `${seconds}s`

  return "0s"
}
