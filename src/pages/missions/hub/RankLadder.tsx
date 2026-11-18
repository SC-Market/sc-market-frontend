import React from "react"
import { Box, ButtonBase, Paper, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { formatInteger } from "../../../util/format/format"
import type { LadderRung } from "./hubModel"

/**
 * The hub's reputation ladder: each rank with the reputation it starts at,
 * the missions (and blueprint items) it unlocks, and a bar of the missions
 * open there out of those that list a rank. Bars are grey until a rank is
 * picked; then it and the ranks below turn green and the list shows the
 * missions open at it. Only rendered when the hub's missions list ranks.
 */
export function RankLadder({
  rungs,
  ladderName,
  factionName,
  selected,
  onSelect,
  totalMissions,
  unrankedMissions,
  lang,
}: {
  rungs: LadderRung[]
  /** The ladder's name in the game ("Standing") */
  ladderName: string
  /** Whose reputation it is, when known */
  factionName?: string
  selected: number | undefined
  onSelect: (rankIndex: number | undefined) => void
  totalMissions: number
  unrankedMissions: number
  lang: string
}) {
  const { t } = useTranslation()
  const n = (v: number) => formatInteger(v, lang)
  const sel = rungs.find((r) => r.rankIndex === selected)

  return (
    <Box component="section" aria-labelledby="hub-ranks" sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "baseline" },
          justifyContent: "space-between",
          gap: { xs: 0.25, md: 1.5 },
          mb: 1.5,
        }}
      >
        <Typography id="hub-ranks" variant="h6" component="h2" sx={{ m: 0 }}>
          {t("missionHubs.ladder.title", "Reputation ranks")}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ m: 0 }}>
          {factionName
            ? t("missionHubs.ladder.hintWith", {
                defaultValue:
                  "{{ladder}} with {{faction}}. Bars show missions open at each rank. Pick yours to filter the list.",
                ladder: ladderName,
                faction: factionName,
              })
            : t("missionHubs.ladder.hint", {
                defaultValue:
                  "{{ladder}}. Bars show missions open at each rank. Pick yours to filter the list.",
                ladder: ladderName,
              })}
        </Typography>
      </Box>
      <Paper variant="outlined">
        <Box
          component="ol"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: `repeat(${rungs.length}, minmax(0, 1fr))`,
            overflowX: { xs: "auto", md: "visible" },
            scrollSnapType: { xs: "x mandatory", md: "none" },
            "& > li": {
              minWidth: 0,
              flex: { xs: "0 0 42%", md: "initial" },
              scrollSnapAlign: "start",
            },
            "& > li + li > button": { borderLeft: 1, borderColor: "divider" },
          }}
        >
          {rungs.map((rung) => {
            const pressed = rung.rankIndex === selected
            const reach = sel !== undefined && rung.rankIndex <= sel.rankIndex
            return (
              <li key={rung.rankIndex}>
                <ButtonBase
                  aria-pressed={pressed}
                  aria-label={t("missionHubs.ladder.rungAria", {
                    defaultValue:
                      "{{rank}}: {{threshold}} reputation, {{missions}} unlock, {{open}} open in total",
                    rank: rung.name,
                    threshold: n(rung.threshold),
                    missions: t("missionHubs.missionCount", {
                      defaultValue:
                        rung.missions === 1
                          ? "{{n}} mission"
                          : "{{n}} missions",
                      count: rung.missions,
                      n: n(rung.missions),
                    }),
                    open: n(rung.open),
                  })}
                  onClick={() => onSelect(pressed ? undefined : rung.rankIndex)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    width: "100%",
                    height: "100%",
                    p: { xs: 1.5, md: "12px 16px 16px" },
                    bgcolor: pressed
                      ? "rgba(16, 184, 129, 0.16)"
                      : reach
                        ? "rgba(16, 184, 129, 0.05)"
                        : "transparent",
                    boxShadow: pressed
                      ? (theme) =>
                          `inset 0 -2px 0 ${theme.palette.primary.main}`
                      : "none",
                    "&:hover": {
                      bgcolor: pressed
                        ? "rgba(16, 184, 129, 0.16)"
                        : "action.hover",
                    },
                    "&.Mui-focusVisible": {
                      outline: 2,
                      outlineColor: "primary.main",
                      outlineOffset: -2,
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 12,
                      color: "common.subheader",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t("missionHubs.ladder.rank", {
                      defaultValue: "Rank {{n}}",
                      n: rung.rankIndex,
                    })}
                  </Typography>
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      fontSize: 15,
                      lineHeight: 1.2,
                      mt: 0.5,
                      mb: 0.25,
                    }}
                  >
                    {rung.name}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 13,
                      color: "text.primary",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t("missionHubs.rep", {
                      defaultValue: "{{n}} rep",
                      n: n(rung.threshold),
                    })}
                  </Typography>
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: "auto",
                      pt: 1.5,
                      fontSize: 14,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t("missionHubs.ladder.plusMissions", {
                      defaultValue:
                        rung.missions === 1
                          ? "+{{n}} mission"
                          : "+{{n}} missions",
                      count: rung.missions,
                      n: n(rung.missions),
                    })}
                    {rung.newBlueprints > 0 && (
                      <Box
                        component="small"
                        sx={{
                          display: "block",
                          fontSize: 13,
                          color: "text.primary",
                          mt: 0.25,
                        }}
                      >
                        {t("missionHubs.ladder.plusBlueprints", {
                          defaultValue:
                            rung.newBlueprints === 1
                              ? "+{{n}} blueprint"
                              : "+{{n}} blueprints",
                          count: rung.newBlueprints,
                          n: n(rung.newBlueprints),
                        })}
                      </Box>
                    )}
                  </Typography>
                  <Box
                    aria-hidden="true"
                    sx={{
                      height: 4,
                      bgcolor: "divider",
                      borderRadius: "2px",
                      mt: 1.5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${Math.round(rung.share * 1000) / 10}%`,
                        bgcolor: reach ? "primary.main" : "common.subheader",
                      }}
                    />
                  </Box>
                </ButtonBase>
              </li>
            )
          })}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1.5,
            px: 2,
            py: 1,
            borderTop: 1,
            borderColor: "divider",
            fontSize: 13,
            color: "text.primary",
          }}
          aria-live="polite"
        >
          <span>
            {sel
              ? unrankedMissions > 0
                ? t("missionHubs.ladder.openAtUnranked", {
                    defaultValue:
                      "At {{rank}}: {{open}} of {{total}} missions open (+{{n}} with no rank listed).",
                    rank: sel.name,
                    open: n(sel.open),
                    total: n(totalMissions),
                    n: n(unrankedMissions),
                  })
                : t("missionHubs.ladder.openAt", {
                    defaultValue:
                      "At {{rank}}: {{open}} of {{total}} missions open.",
                    rank: sel.name,
                    open: n(sel.open),
                    total: n(totalMissions),
                  })
              : unrankedMissions > 0
                ? t("missionHubs.ladder.unranked", {
                    defaultValue:
                      unrankedMissions === 1
                        ? "{{n}} mission doesn't list a required rank in the game data."
                        : "{{n}} missions don't list a required rank in the game data.",
                    count: unrankedMissions,
                    n: n(unrankedMissions),
                  })
                : t(
                    "missionHubs.ladder.allRanked",
                    "Every mission lists its required rank.",
                  )}
          </span>
          {sel && (
            <ButtonBase
              onClick={() => onSelect(undefined)}
              sx={{
                color: "primary.main",
                fontSize: 13,
                "&.Mui-focusVisible": {
                  outline: 2,
                  outlineColor: "primary.main",
                },
              }}
            >
              {t("missionHubs.ladder.showAll", "Show all ranks")}
            </ButtonBase>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
