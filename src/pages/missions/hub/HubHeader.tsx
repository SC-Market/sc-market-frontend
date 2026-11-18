import React from "react"
import { Box, Button, Link, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type {
  MissionHubDetailResponse,
  MissionHubKind,
} from "../../../store/api/v2/market"
import { GAME_DATA_PATHS } from "../../../routes/paths"
import { missionCountText } from "../../../seo/missionHubs"
import { missionSearchHref } from "./hubModel"

const KICKERS: Record<MissionHubKind, string> = {
  givers: "Mission giver",
  factions: "Faction",
  types: "Mission type",
  systems: "Star system",
}

/**
 * The hub's header: its kind, the h1, "Nyx · 36 missions · Faction: X",
 * and on the right the data's version and "Filter in mission search".
 */
export function HubHeader({
  hub,
  heading,
  lang,
  versionLabel,
}: {
  hub: MissionHubDetailResponse
  heading: string
  lang: string
  versionLabel: string | null
}) {
  const { t } = useTranslation()
  // "Nyx · 36 missions · Faction: X" under the h1.
  const systemsMeta = hub.kind === "systems" ? [] : hub.systems.slice(0, 3)
  const metaFaction =
    hub.kind === "givers" &&
    hub.factions.length === 1 &&
    hub.factions[0].name !== hub.name
      ? hub.factions[0]
      : undefined

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "flex-end" },
        justifyContent: "space-between",
        gap: { xs: 1.25, md: 3 },
        mb: 0.5,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="p"
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: "common.subheader",
            m: 0,
            mb: 0.5,
          }}
        >
          {t(`missionHubs.kicker.${hub.kind}`, KICKERS[hub.kind])}
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          color="text.secondary"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: 26, md: 32 },
            lineHeight: 1.15,
            m: 0,
          }}
        >
          {heading}
        </Typography>
        <Typography
          component="p"
          color="text.primary"
          sx={{ fontSize: 15, mt: 1, mb: 0 }}
        >
          {systemsMeta.map((s, i) => (
            <React.Fragment key={s.slug}>
              {i > 0 && ", "}
              <Link
                component={RouterLink}
                to={GAME_DATA_PATHS.missionHub("systems", s.slug)}
                color="text.secondary"
                sx={{
                  textUnderlineOffset: "3px",
                  textDecorationColor: "rgba(255,255,255,0.3)",
                }}
              >
                {s.name}
              </Link>
              {i === systemsMeta.length - 1 && " · "}
            </React.Fragment>
          ))}
          {missionCountText(hub.mission_count, t, lang)}
          {metaFaction && (
            <>
              {" · "}
              {t("missionHubs.facts.faction", "Faction")}:{" "}
              <Link
                component={RouterLink}
                to={GAME_DATA_PATHS.missionHub("factions", metaFaction.slug)}
                color="text.secondary"
                sx={{
                  textUnderlineOffset: "3px",
                  textDecorationColor: "rgba(255,255,255,0.3)",
                }}
              >
                {metaFaction.name}
              </Link>
            </>
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "column" },
          flexWrap: "wrap",
          alignItems: { xs: "center", md: "flex-end" },
          gap: 1,
          flex: "none",
        }}
      >
        {versionLabel && (
          <Typography
            component="p"
            sx={{
              fontSize: 13,
              color: "text.primary",
              m: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t("missionHubs.dataFrom", {
              defaultValue: "Data from {{version}}",
              version: versionLabel,
            })}
          </Typography>
        )}
        <Button
          component={RouterLink}
          to={missionSearchHref(hub)}
          variant="outlined"
          color="neutral"
          size="small"
          sx={{ textTransform: "none" }}
        >
          {t("missionHubs.filterInSearch", "Filter in mission search")}
        </Button>
      </Box>
    </Box>
  )
}
