import React, { useState } from "react"
import { Box, ButtonBase, Link, Paper, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type {
  MissionHubBlueprintItem,
  MissionHubLadder,
} from "../../../store/api/v2/market"
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  WIKI_PATHS,
} from "../../../routes/paths"
import { formatInteger } from "../../../util/format/format"

/** Items listed before "Show all". */
const COLLAPSED = 8

/**
 * The blueprint items the hub's missions can reward: the item (its wiki
 * page), how many missions and from which rank, with quiet links to the
 * blueprint and the item's market page. Only rendered when there are any.
 */
export function HubBlueprintRewards({
  items,
  ladder,
  lang,
}: {
  items: MissionHubBlueprintItem[]
  ladder: MissionHubLadder | undefined
  lang: string
}) {
  const { t } = useTranslation()
  const [all, setAll] = useState(false)
  const n = (v: number) => formatInteger(v, lang)
  const rankName = (idx: number | undefined) =>
    idx === undefined
      ? undefined
      : ladder?.ranks.find((r) => r.rank_index === idx)?.display_name
  const quiet = {
    color: "text.primary",
    textUnderlineOffset: "3px",
    textDecorationColor: "rgba(255,255,255,0.25)",
    "&:hover": { color: "primary.main", textDecorationColor: "currentColor" },
  } as const

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="hub-blueprints"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 1,
          px: 2,
          pt: 1.5,
          pb: 1,
        }}
      >
        <Typography
          id="hub-blueprints"
          component="h2"
          color="text.secondary"
          sx={{ fontSize: 17, fontWeight: 500, m: 0 }}
        >
          {t("missionHubs.blueprintPanel.title", "Blueprint rewards")}
        </Typography>
        <Typography
          component="p"
          sx={{ fontSize: 13, color: "text.primary", m: 0 }}
        >
          {t("missionHubs.tiles.items", {
            defaultValue: items.length === 1 ? "{{n}} item" : "{{n}} items",
            count: items.length,
            n: n(items.length),
          })}
        </Typography>
      </Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {items.map((item, i) => {
          const from = ladder ? rankName(item.min_rank_index) : undefined
          return (
            <Box
              component="li"
              key={item.game_item_id}
              sx={{
                // Collapsed items stay in the HTML (their links are crawlable).
                display: all || i < COLLAPSED ? "grid" : "none",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                columnGap: 1.5,
                rowGap: 0.25,
                alignItems: "center",
                px: 2,
                py: 1,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Link
                component={RouterLink}
                to={WIKI_PATHS.item(item.item_slug)}
                color="text.secondary"
                underline="hover"
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  "&:hover": { color: "primary.main" },
                }}
              >
                {item.item_name}
              </Link>
              <Box
                sx={{
                  gridRow: "1 / span 2",
                  gridColumn: 2,
                  display: "flex",
                  gap: 1.5,
                  fontSize: 13,
                }}
              >
                <Link
                  component={RouterLink}
                  to={GAME_DATA_PATHS.blueprint(
                    encodeURIComponent(item.blueprint_name),
                  )}
                  aria-label={t("missionHubs.blueprintPanel.blueprintAria", {
                    defaultValue: "{{name}} blueprint",
                    name: item.item_name,
                  })}
                  sx={quiet}
                >
                  {t("missionHubs.blueprintPanel.blueprint", "Blueprint")}
                </Link>
                <Link
                  component={RouterLink}
                  to={MARKET_PATHS.aggregate(item.game_item_id, item.item_name)}
                  aria-label={t("missionHubs.blueprintPanel.marketAria", {
                    defaultValue: "Buy or sell {{name}} on the market",
                    name: item.item_name,
                  })}
                  sx={quiet}
                >
                  {t("missionHubs.blueprintPanel.market", "Market")}
                </Link>
              </Box>
              <Typography
                component="span"
                sx={{ gridColumn: 1, fontSize: 13, color: "text.primary" }}
              >
                {t("missionHubs.missionCount", {
                  defaultValue:
                    item.mission_count === 1
                      ? "{{n}} mission"
                      : "{{n}} missions",
                  count: item.mission_count,
                  n: n(item.mission_count),
                })}
                {from &&
                  ` · ${t("missionHubs.blueprintPanel.fromRank", {
                    defaultValue: "from {{rank}}",
                    rank: from,
                  })}`}
              </Typography>
            </Box>
          )
        })}
      </Box>
      {items.length > COLLAPSED && (
        <ButtonBase
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            px: 2,
            py: 1.25,
            borderTop: 1,
            borderColor: "divider",
            color: "primary.main",
            fontSize: 14,
            fontWeight: 500,
            "&.Mui-focusVisible": {
              outline: 2,
              outlineColor: "primary.main",
              outlineOffset: -2,
            },
          }}
        >
          {all
            ? t("missionHubs.blueprintPanel.showFewer", "Show fewer")
            : t("missionHubs.blueprintPanel.showAll", {
                defaultValue: "Show all {{n}} blueprints",
                n: n(items.length),
              })}
        </ButtonBase>
      )}
    </Paper>
  )
}
