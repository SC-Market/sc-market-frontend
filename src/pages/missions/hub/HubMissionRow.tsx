import React from "react"
import { Box } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { MissionHubMission } from "../../../store/api/v2/market"
import { MissionName } from "../../../components/game-data/MissionName"
import { inAppClick } from "../../../components/links/inAppClick"
import { GAME_DATA_PATHS } from "../../../routes/paths"
import { missionGiver } from "../../../seo/missionText"
import { formatInteger } from "../../../util/format/format"
import {
  getFactionIcon,
  getMissionCategoryColor,
  getMissionIcon,
} from "../../../util/gameIcons"
import { getMissionTypeLabel } from "../../../util/missionDisplay"
import { missionPayout, missionTypeName } from "./hubModel"

/** One mission: icon, name, type · system · rank · blueprints, then rep and aUEC columns. */
export function HubMissionRow({
  mission: m,
  hasPay,
  showRank,
  lang,
  onOpen,
}: {
  mission: MissionHubMission
  hasPay: boolean
  showRank: boolean
  lang: string
  onOpen?: (m: MissionHubMission) => void
}) {
  const { t } = useTranslation()
  const n = (v: number) => formatInteger(v, lang)
  const giver = missionGiver(m)
  const icon = getMissionIcon(m.category) || getFactionIcon(m.faction)
  const type = missionTypeName(m)
  const payout = missionPayout(m)
  const bps = m.blueprint_rewards.length || m.blueprint_reward_count
  const meta = [
    type ?? t("missionHubs.list.noType", "No type listed"),
    m.star_system,
    showRank ? m.min_standing_display : undefined,
    bps > 0
      ? t("missionHubs.list.blueprintCount", {
          defaultValue: bps === 1 ? "{{n}} blueprint" : "{{n}} blueprints",
          count: bps,
          n: n(bps),
        })
      : undefined,
  ].filter((x): x is string => !!x)

  return (
    <Box
      component={RouterLink}
      to={GAME_DATA_PATHS.mission(encodeURIComponent(m.mission_code))}
      onClick={onOpen ? inAppClick(() => onOpen(m)) : undefined}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "32px minmax(0, 1fr)",
          md: "32px minmax(0, 1fr) auto",
        },
        columnGap: 1.5,
        rowGap: 0.5,
        alignItems: "center",
        px: { xs: 1.5, md: 2 },
        py: { xs: 1.5, md: 1 },
        textDecoration: "none",
        color: "inherit",
        borderBottom: 1,
        borderColor: "divider",
        "li:last-of-type > &": { borderBottom: 0 },
        "&:hover": { bgcolor: "action.hover" },
        "&:hover .hub-mission-name": {
          textDecoration: "underline",
          textUnderlineOffset: "3px",
        },
        "&:focus-visible": {
          outline: 2,
          outlineColor: "primary.main",
          outlineOffset: -2,
        },
        "@media (prefers-reduced-motion: no-preference)": {
          transition: "background-color .12s",
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 32,
          height: 32,
          borderRadius: "3px",
          display: "grid",
          placeItems: "center",
          bgcolor: getMissionCategoryColor(m.category),
          color: "common.white",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {icon ? (
          <Box
            component="img"
            src={icon}
            alt=""
            loading="lazy"
            sx={{ width: 20, height: 20, objectFit: "contain" }}
          />
        ) : (
          getMissionTypeLabel(m.category).slice(0, 1)
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <MissionName
          name={m.mission_name}
          giver={giver}
          className="hub-mission-name"
          component="span"
          color="text.secondary"
          sx={{
            display: "block",
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.25,
          }}
        />
        <Box
          component="span"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 1,
            rowGap: 0.5,
            mt: 0.25,
            fontSize: 13,
            color: "text.primary",
          }}
        >
          {meta.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span aria-hidden="true">·</span>}
              <span>{part}</span>
            </React.Fragment>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          gridColumn: { xs: 2, md: "auto" },
          display: { xs: "flex", md: "grid" },
          gridTemplateColumns: hasPay ? "72px 136px" : "72px",
          columnGap: { xs: 1.5, md: 2 },
          alignItems: "baseline",
          justifyItems: "end",
          fontVariantNumeric: "tabular-nums",
          fontSize: { xs: 13, md: 14 },
          whiteSpace: "nowrap",
          "&:empty": { display: "none" },
        }}
      >
        {m.reputation_reward ? (
          <Box component="span" sx={{ color: "text.secondary" }}>
            +{n(m.reputation_reward)}{" "}
            <Box component="small" sx={{ color: "text.primary", fontSize: 12 }}>
              {t("missionHubs.list.rep", "rep")}
            </Box>
          </Box>
        ) : (
          <span />
        )}
        {payout ? (
          <Box
            component="span"
            sx={{
              color: payout.kind === "fee" ? "error.main" : "success.main",
              fontWeight: 600,
              textAlign: { xs: "left", md: "right" },
            }}
          >
            {payout.kind === "fee" ? t("missionHubs.list.fee", "Fee") : null}
            {payout.kind === "fee" ? " " : ""}
            {payout.min === payout.max
              ? n(payout.max)
              : `${n(payout.min)}–${n(payout.max)}`}{" "}
            <Box
              component="small"
              sx={{ color: "text.primary", fontSize: 12, fontWeight: 400 }}
            >
              aUEC
            </Box>
          </Box>
        ) : hasPay ? (
          <span />
        ) : null}
      </Box>
    </Box>
  )
}
