import type { Formatters } from "../../../../util/format"

/** Discord's timestamp styles (<t:unix:style>) as date/time format options. */
const STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  t: { hour: "2-digit", minute: "2-digit" },
  T: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
  d: { year: "numeric", month: "2-digit", day: "2-digit" },
  D: { year: "numeric", month: "long", day: "numeric" },
  f: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  F: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
}

/**
 * Replace Discord-like timestamp tags in messages (<t:1700000000:f>) with
 * text in the page's language (`fmt`, useFormatters()); "R" (relative) is
 * relative to `now` (useNow()).
 */
export function replaceDiscordTimestamps(
  input: string,
  fmt: Formatters,
  now: number,
) {
  return input.replace(
    /<t:(\d+):([dDtTfFR])>/g,
    (match, timestamp: string, style: string) => {
      const date = new Date(parseInt(timestamp, 10) * 1000)
      if (style === "R") return fmt.relative(date, now)
      const options = STYLES[style]
      return options ? fmt.dateTime(date, options) : match
    },
  )
}
