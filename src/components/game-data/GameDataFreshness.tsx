import React from "react"
import { Typography } from "@mui/material"
import { useGetActiveVersionsQuery } from "../../store/api/v2/market"
import { gameDataFreshness } from "../../seo/missionText"

/**
 * "Data from Star Citizen 4.10.2 LIVE, updated 24 Oct 2026, from game
 * files" under a game-data page (the server render prefetches the active
 * versions, so it is in the HTML).
 */
export function GameDataFreshness() {
  const { data } = useGetActiveVersionsQuery()
  const text = gameDataFreshness(data?.LIVE)
  if (!text) return null
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      component="p"
      sx={{ mt: 2 }}
    >
      {text}
    </Typography>
  )
}
