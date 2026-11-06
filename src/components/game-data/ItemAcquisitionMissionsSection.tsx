import { Box, Chip, Link, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ItemAcquisitionDocument } from "../../features/game-data/api/gameDataApi"
import {
  acquisitionGiver,
  acquisitionMissionName,
  acquisitionMissionPath,
  missionChance,
  missionRewardKind,
} from "../../seo/itemAcquisition"

/** Missions that reward the item or its blueprint. */ import { SubsectionTitle } from "./ItemAcquisitionParts"

export function AcquisitionMissionsSection({
  doc,
}: {
  doc: ItemAcquisitionDocument
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <SubsectionTitle>
        {t("itemAcquisition.missionsTitle", "Missions that reward it")}
      </SubsectionTitle>
      <Stack spacing={1}>
        {doc.missions.top.map((m) => {
          const giver = acquisitionGiver(m)
          const chance = missionChance(m, t)
          return (
            <Box key={`${m.mission_id}-${m.reward_kind}`}>
              <Link
                component={RouterLink}
                to={acquisitionMissionPath(m)}
                underline="hover"
                fontWeight={600}
              >
                {acquisitionMissionName(m)}
              </Link>
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 0.5 }}
              >
                <Chip
                  size="small"
                  color={m.reward_kind === "item" ? "success" : "default"}
                  label={missionRewardKind(m, t)}
                />
                {chance && (
                  <Chip size="small" variant="outlined" label={chance} />
                )}
                {giver && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ alignSelf: "center" }}
                  >
                    {t("itemAcquisition.giver", {
                      defaultValue: "Giver: {{giver}}",
                      giver,
                    })}
                  </Typography>
                )}
                {m.star_system && (
                  <Typography
                    variant="caption"
                    color="text.primary"
                    sx={{ alignSelf: "center" }}
                  >
                    {m.star_system}
                  </Typography>
                )}
              </Stack>
            </Box>
          )
        })}
      </Stack>
      {doc.missions.total > doc.missions.top.length && (
        <Typography
          variant="caption"
          color="text.primary"
          display="block"
          sx={{ mt: 1 }}
        >
          {t("itemAcquisition.showingMissions", {
            defaultValue: "Showing {{shown}} of {{total}} missions",
            shown: doc.missions.top.length,
            total: doc.missions.total,
          })}
        </Typography>
      )}
    </Box>
  )
}
