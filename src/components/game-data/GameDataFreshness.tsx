import React from "react"
import { Typography, type TypographyProps } from "@mui/material"
import { useGetActiveVersionsQuery } from "../../store/api/v2/market"
import { freshnessStamp } from "../../seo/missionText"

/**
 * "Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026 (build …)." under
 * game-data pages and hubs (missions, blueprints, items). The active
 * versions query is shipped with prerendered pages, so the stamp is in their
 * HTML. Renders nothing until the version is known.
 */
export function GameDataFreshness(props: Omit<TypographyProps, "children">) {
  const { data } = useGetActiveVersionsQuery()
  const text = freshnessStamp(data?.LIVE)
  if (!text) return null
  return (
    <Typography variant="caption" component="p" color="text.primary" sx={{ mt: 2, opacity: 0.8 }} {...props}>
      {text}
    </Typography>
  )
}
