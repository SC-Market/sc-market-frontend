import i18n from "../util/i18n" // // Import i18n instance for dynamic language support
import moment, { Moment } from "moment"

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
 * @param future - The future date (Date object, string, or Moment instance)
 * @returns A shorthand string representing the most significant time unit
 */
export function formatMostSignificantDiff(
  future: Date | string | Moment,
): string {
  const futureDate = moment(future)
  const now = moment()

  if (!futureDate.isValid() || futureDate.isBefore(now)) {
    return "0s" // or handle differently if desired
  }

  let duration = moment.duration(futureDate.diff(now))

  const months = Math.floor(duration.asMonths())
  if (months > 0) return `${months}mo`
  duration = duration.subtract(moment.duration(months, "months"))

  const days = Math.floor(duration.asDays())
  if (days > 0) return `${days}d`
  duration = duration.subtract(moment.duration(days, "days"))

  const hours = duration.hours()
  if (hours > 0) return `${hours}h`

  const minutes = duration.minutes()
  if (minutes > 0) return `${minutes}m`

  const seconds = duration.seconds()
  if (seconds > 0) return `${seconds}s`

  return "0s" // Fallback if no difference
}
