import React from "react"
import { Typography, TypographyProps } from "@mui/material"

/**
 * Renders a mission name with ~mission(...) placeholders styled as
 * monospace secondary-colored [LABEL] spans.
 */
export function MissionName({
  name,
  ...props
}: { name: string | null | undefined } & Omit<TypographyProps, "children">) {
  if (!name) return <Typography {...props}>Unknown Mission</Typography>

  const parts = name.split(/(~mission\([^)]+\))/)

  return (
    <Typography {...props}>
      {parts.map((part, i) => {
        const match = part.match(/^~mission\(([^)]+)\)$/)
        if (!match) return <React.Fragment key={i}>{part}</React.Fragment>

        const inner = match[1]
        const key = inner.split("|").pop() || inner
        const label = key
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[_]/g, " ")
          .trim()
          .toUpperCase()

        return (
          <Typography
            key={i}
            component="span"
            sx={{ fontFamily: "monospace", color: "text.secondary" }}
          >
            [{label}]
          </Typography>
        )
      })}
    </Typography>
  )
}
