import React from "react"
import { Box, Chip, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { MissionHubKind } from "../../store/api/v2/market"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { MISSION_HUB_KINDS, missionHubKindLabel } from "../../seo/missionHubs"

/**
 * "Browse missions by": links to the mission hub indexes (givers, factions,
 * types, star systems), on /missions and the hub pages. Real links, so the
 * prerendered HTML links every index.
 */
export function MissionHubIndexLinks({ except, sx }: { except?: MissionHubKind; sx?: object }) {
  const { t } = useTranslation()
  const kinds = MISSION_HUB_KINDS.filter((k) => k !== except)
  return (
    <Box component="nav" aria-labelledby="mission-hub-index-links" sx={{ mt: 3, ...sx }}>
      <Typography id="mission-hub-index-links" variant="subtitle2" component="h2" color="text.secondary" sx={{ mb: 1 }}>
        {t("missionHubs.browseBy", "Browse missions by")}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {kinds.map((kind) => (
          <Chip
            key={kind}
            label={missionHubKindLabel(kind, t)}
            component={RouterLink}
            to={GAME_DATA_PATHS.missionHubs(kind)}
            clickable
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  )
}
