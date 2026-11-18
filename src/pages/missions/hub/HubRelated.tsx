import React from "react"
import { Box, Chip, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { MissionHubDetailResponse } from "../../../store/api/v2/market"
import { GAME_DATA_PATHS } from "../../../routes/paths"
import {
  MISSION_HUB_KINDS,
  missionHubKindLabel,
} from "../../../seo/missionHubs"

/** The related hubs among this hub's missions (its factions, types, systems, givers), with counts. */
export function HubRelated({ hub }: { hub: MissionHubDetailResponse }) {
  const { t } = useTranslation()
  const related = MISSION_HUB_KINDS.filter(
    (k) => k !== hub.kind && hub[k].length > 0,
  )
  if (related.length === 0) return null
  return (
    <Box component="section" aria-labelledby="hub-related">
      <Typography
        id="hub-related"
        component="h2"
        color="text.secondary"
        sx={{ fontSize: 17, fontWeight: 500, mb: 0.5 }}
      >
        {t("missionHubs.related", "Related mission hubs")}
      </Typography>
      {related.map((k) => (
        <Box key={k}>
          <Typography
            component="h3"
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: "text.primary",
              mt: 1.5,
              mb: 1,
            }}
          >
            {missionHubKindLabel(k, t)}
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {hub[k].map((other) => (
              <Chip
                key={other.slug}
                label={
                  <>
                    {other.name}{" "}
                    <Box
                      component="span"
                      sx={{
                        opacity: 0.8,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {other.mission_count}
                    </Box>
                  </>
                }
                component={RouterLink}
                to={GAME_DATA_PATHS.missionHub(k, other.slug)}
                clickable
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}
