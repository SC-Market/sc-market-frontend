import React from "react"
import { Typography, TypographyProps } from "@mui/material"

/** Style for placeholder tokens like [DESTINATION] */
const placeholderSx = { fontFamily: "monospace", color: "secondary.main", fontSize: "0.9em" } as const

/**
 * Renders a mission name with ~mission(...) placeholders styled as
 * monospace secondary-colored [LABEL] spans.
 */
export function MissionName({
  name,
  ...props
}: { name: string | null | undefined } & Omit<TypographyProps, "children">) {
  if (!name) return <Typography {...props}>Unknown Mission</Typography>

  const cleaned = name.replace(/<\/?em\d*>/gi, "")

  const parts = cleaned.split(/(~mission\([^)]+\))/)

  return (
    <Typography {...props}>
      {parts.map((part, i) => {
        const match = part.match(/^~mission\(([^)]+)\)$/)
        if (!match) return <React.Fragment key={i}>{part}</React.Fragment>

        const inner = match[1]
        const key = inner.split("|").pop() || inner
        
        // ~mission(Contractor) or ~mission(Contractor|...) → "Various"
        if (inner === "Contractor" || inner.startsWith("Contractor|")) {
          return (
            <Typography key={i} component="span" sx={placeholderSx}>
              Various
            </Typography>
          )
        }

        const label = key
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[_]/g, " ")
          .trim()
          .toUpperCase()

        return (
          <Typography key={i} component="span" sx={placeholderSx}>
            [{label}]
          </Typography>
        )
      })}
    </Typography>
  )
}

/**
 * Renders mission description text with [PLACEHOLDER] tokens styled
 * as monospace secondary-colored spans. Also handles ~mission() syntax.
 */
export function MissionDescription({
  text,
  ...props
}: { text: string | null | undefined } & Omit<TypographyProps, "children">) {
  if (!text) return null

  // First strip em tags, convert ~mission() to [LABEL], then style all [BRACKETS]
  const processed = text
    .replace(/<\/?em\d*>/gi, "")
    .replace(/~mission\(([^|)]+)\|?[^)]*\)/g, (_, key) => {
      if (key === "Contractor") return "[Various]"
      return `[${key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_]/g, " ").trim().toUpperCase()}]`
    })
    .replace(/\\n/g, "\n")

  // Split on [ANYTHING] tokens
  const parts = processed.split(/(\[[A-Z][A-Z0-9 _/]*\])/)

  return (
    <Typography {...props}>
      {parts.map((part, i) =>
        /^\[[A-Z][A-Z0-9 _/]*\]$/.test(part)
          ? <Typography key={i} component="span" sx={placeholderSx}>{part}</Typography>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </Typography>
  )
}
