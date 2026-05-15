/**
 * ShipSilhouette
 *
 * Renders a top-down ship silhouette tinted with a career-based color.
 * SVGs live at /public/ship-icons/{ship_code}.svg — built with currentColor,
 * tinted via CSS mask-image + background-color so no inline SVG needed.
 *
 * If the SVG is missing (404), the mask resolves to nothing and the element
 * is invisible — no broken image state.
 */

import React, { useState } from "react"
import { Box, SxProps, Theme } from "@mui/material"

// Career → color
const CAREER_COLORS: Record<string, string> = {
  combat:      "hsl(0, 72%, 62%)",
  exploration: "hsl(238, 90%, 72%)",
  support:     "hsl(200, 70%, 55%)",
  industrial:  "hsl(38, 92%, 50%)",
  transporter: "hsl(270, 80%, 70%)",
}

// Role overrides (more specific than career)
const ROLE_OVERRIDES: Record<string, string> = {
  stealthfighter: "hsl(200, 70%, 55%)",
  stealthbomber:  "hsl(200, 70%, 55%)",
  pathfinder:     "hsl(200, 70%, 55%)",
  dropship:       "hsl(38, 92%, 50%)",
  mediummining:   "hsl(38, 92%, 50%)",
  mediumfreight:  "hsl(270, 80%, 70%)",
}

const DEFAULT_COLOR = "hsl(220, 15%, 55%)"

export function getShipColor(career?: string, role?: string): string {
  if (role) {
    const key = role.toLowerCase().replace(/[^a-z]/g, "")
    if (ROLE_OVERRIDES[key]) return ROLE_OVERRIDES[key]
  }
  if (career) {
    const key = career.toLowerCase()
    if (CAREER_COLORS[key]) return CAREER_COLORS[key]
  }
  return DEFAULT_COLOR
}

interface ShipSilhouetteProps {
  shipCode: string
  career?: string
  role?: string
  /** Height of the silhouette area — width fills container */
  height?: number | string
  opacity?: number
  sx?: SxProps<Theme>
}

export function ShipSilhouette({
  shipCode,
  career,
  role,
  height = 120,
  opacity = 0.85,
  sx,
}: ShipSilhouetteProps) {
  const color = getShipColor(career, role)
  const url = `/ship-icons/${shipCode}.svg`

  return (
    <Box
      sx={{
        width: "100%",
        height,
        bgcolor: color,
        opacity,
        // CSS mask renders the SVG shape, colors it with bgcolor above
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        transition: "opacity 0.2s",
        // If SVG 404s, mask resolves to nothing → element invisible (no broken state)
        ...sx,
      }}
    />
  )
}
