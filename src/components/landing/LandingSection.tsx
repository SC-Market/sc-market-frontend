import React, { ReactNode } from "react"
import { Box, Typography } from "@mui/material"
import { LandingSectionTitle } from "./LandingTypography"

/** Homepage section titles (h2): 2.4rem from md, 1.9rem on phones. */
export const LANDING_SECTION_TITLE_SX = {
  textAlign: "left",
  fontSize: { xs: "1.9rem", md: "2.4rem" },
  lineHeight: 1.167,
} as const

/**
 * A homepage section's header row: the h2 (with an optional one-line
 * subtitle) on the left, its actions on the right. On phones the actions
 * wrap under the title. Static, so a section's skeleton renders the real one.
 */
export function LandingSectionHeader(props: {
  /** The h2's id, for the section's aria-labelledby. */
  id: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: { xs: "wrap", sm: "nowrap" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 1.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <LandingSectionTitle id={props.id} sx={LANDING_SECTION_TITLE_SX}>
          {props.title}
        </LandingSectionTitle>
        {props.subtitle && (
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
            {props.subtitle}
          </Typography>
        )}
      </Box>
      {props.actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0, flexWrap: "wrap" }}>
          {props.actions}
        </Box>
      )}
    </Box>
  )
}

/** A homepage section below the hero: a <section> named by its h2. */
export function LandingSection(props: {
  labelledBy: string
  children: ReactNode
  testId?: string
}) {
  return (
    <Box
      component="section"
      aria-labelledby={props.labelledBy}
      data-testid={props.testId}
      sx={{ minWidth: 0 }}
    >
      {props.children}
    </Box>
  )
}
