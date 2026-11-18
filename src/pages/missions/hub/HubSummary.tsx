import React from "react"
import { Box, Typography } from "@mui/material"
import type { MissionHubSummaryText } from "../../../seo/missionHubs"

/**
 * The hub's plain-language summary (seo/missionHubs.ts missionHubSummary,
 * built only from its data): a bright lead paragraph, then a duller one with
 * the details. Server-rendered with the page.
 */
export function HubSummary({ summary }: { summary: MissionHubSummaryText }) {
  return (
    <Box
      sx={{ maxWidth: "72ch", mt: { xs: 1.5, md: 2 }, mb: { xs: 2, md: 3 } }}
    >
      <Typography
        component="p"
        color="text.secondary"
        sx={{ fontSize: { xs: 16, md: 17 }, lineHeight: 1.55, m: 0 }}
      >
        {summary.lead}
      </Typography>
      {summary.details.length > 0 && (
        <Typography
          component="p"
          color="text.primary"
          sx={{ fontSize: { xs: 15, md: 16 }, lineHeight: 1.55, mt: 1, mb: 0 }}
        >
          {summary.details.join(" ")}
        </Typography>
      )}
    </Box>
  )
}
