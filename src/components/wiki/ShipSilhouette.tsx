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
  support:     "hsl(145, 65%, 45%)",
  industrial:  "hsl(38, 92%, 50%)",
  transporter: "hsl(270, 80%, 70%)",
  transport:   "hsl(270, 80%, 70%)",
  competition: "hsl(190, 90%, 50%)",
}

// Role overrides (more specific than career)
const ROLE_OVERRIDES: Record<string, string> = {
  // Combat specializations
  stealthfighter: "hsl(340, 60%, 50%)",
  stealthbomber:  "hsl(340, 60%, 50%)",
  bomber:         "hsl(15, 80%, 55%)",
  interceptor:    "hsl(355, 85%, 58%)",
  gunship:        "hsl(10, 75%, 50%)",
  dropship:       "hsl(20, 70%, 50%)",
  corvette:       "hsl(350, 55%, 45%)",
  frigate:        "hsl(345, 50%, 42%)",
  destroyer:      "hsl(340, 50%, 40%)",
  carrier:        "hsl(335, 45%, 38%)",
  snub:           "hsl(5, 65%, 60%)",
  // Exploration
  pathfinder:     "hsl(220, 80%, 65%)",
  touring:        "hsl(250, 70%, 70%)",
  reporting:      "hsl(215, 60%, 60%)",
  datarunning:    "hsl(210, 75%, 58%)",
  science:        "hsl(245, 70%, 65%)",
  scienceship:    "hsl(245, 70%, 65%)",
  // Industrial
  lightmining:    "hsl(45, 90%, 50%)",
  mediummining:   "hsl(38, 92%, 50%)",
  heavymining:    "hsl(30, 85%, 45%)",
  lightsalvage:   "hsl(55, 75%, 48%)",
  mediumsalvage:  "hsl(50, 70%, 45%)",
  heavysalvage:   "hsl(42, 65%, 40%)",
  refinery:       "hsl(32, 80%, 48%)",
  construction:   "hsl(25, 70%, 45%)",
  constructionship: "hsl(25, 70%, 45%)",
  // Support
  medical:        "hsl(160, 70%, 45%)",
  repair:         "hsl(130, 55%, 48%)",
  refueling:      "hsl(170, 60%, 42%)",
  // Transport
  lightfreight:   "hsl(280, 70%, 65%)",
  mediumfreight:  "hsl(270, 80%, 70%)",
  heavyfreight:   "hsl(260, 70%, 60%)",
  // Competition
  racer:          "hsl(190, 90%, 50%)",
  racing:         "hsl(190, 90%, 50%)",
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
