/**
 * MissionRankCalculator — shows XP needed per rank, greyed out below min rank,
 * how many runs to reach each rank, with crew split support.
 */

import React, { useMemo, useState } from "react"
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Stack,
  Alert,
  Slider,
} from "@mui/material"
import { Trans, useTranslation } from "react-i18next"
import { useGetReputationRanksQuery } from "../../store/api/v2/market"

interface Props {
  reputationReward: number
  rewardScope: string
  rewardFaction?: string
  requiredRank?: number
  minStanding?: string
  isShareable: boolean
}

export function MissionRankCalculator({ reputationReward, rewardScope, rewardFaction, requiredRank, minStanding, isShareable }: Props) {
  const { t } = useTranslation()
  const [crewSize, setCrewSize] = useState(1)

  const { data, isLoading } = useGetReputationRanksQuery(
    { scopeCode: rewardScope },
    { skip: !rewardScope },
  )

  const ranks = data?.ranks ?? []
  const scopeDisplayName = data?.display_name || rewardScope

  const xpPerRun = useMemo(() => {
    if (!reputationReward) return 0
    return Math.floor(reputationReward / crewSize)
  }, [reputationReward, crewSize])

  // Detect inverse scopes (Affinity: Exalted=0 → Hated=max, higher XP = worse)
  const ranksDescend = useMemo(() => {
    if (ranks.length < 2) return false
    const firstName = ranks[0]?.standing_display_name?.toLowerCase() || ""
    return /exalted|ally|best|loved/.test(firstName)
  }, [ranks])
  const isNegativeRep = xpPerRun < 0 || ranksDescend

  const displayRanks = useMemo(() => isNegativeRep ? [...ranks].reverse() : ranks, [ranks, isNegativeRep])

  // Find the min rank index — match by standing code first, then threshold
  const minRankIndex = useMemo(() => {
    if (minStanding) {
      const idx = displayRanks.findIndex((r) => r.standing_code === minStanding)
      if (idx >= 0) return idx
    }
    if (requiredRank == null) return 0
    const idx = displayRanks.findIndex((r) => {
      return isNegativeRep ? r.threshold <= requiredRank : r.threshold >= requiredRank
    })
    return idx >= 0 ? idx : 0
  }, [minStanding, requiredRank, displayRanks, isNegativeRep])

  if (isLoading) return <Typography variant="body2" color="text.secondary">{t("missionToolsUi.loadingRanks")}</Typography>
  if (!ranks.length) return <Alert severity="info">{t("missionToolsUi.noRankData", { scope: scopeDisplayName })}</Alert>

  return (
    <Box>
      {isNegativeRep && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Trans i18nKey="missionToolsUi.negativeRepWarning" components={{ strong: <strong /> }} />
        </Alert>
      )}
      {/* Crew size slider */}
      {isShareable && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <Trans i18nKey="missionToolsUi.crewSizeValue" values={{ size: crewSize }} components={{ strong: <strong /> }} />{" "}
            {crewSize > 1 && t("missionToolsUi.xpEach", { xp: xpPerRun })}
          </Typography>
          <Slider
            aria-label={t("missionToolsUi.crewSize")}
            value={crewSize}
            onChange={(_, v) => setCrewSize(v as number)}
            min={1}
            max={8}
            marks={[{ value: 1, label: "1" }, { value: 4, label: "4" }, { value: 8, label: "8" }]}
            valueLabelDisplay="auto"
            size="small"
            sx={{ maxWidth: 300 }}
          />
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <Trans i18nKey="missionToolsUi.xpPerRunTowards" values={{ xp: xpPerRun }} components={{ strong: <strong /> }} />{" "}
        {rewardFaction && <Chip label={rewardFaction} size="small" color="secondary" sx={{ height: 20, fontSize: "0.7rem", mr: 0.5 }} />}
        <Chip label={scopeDisplayName} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
      </Typography>

      <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell>{t("missionToolsUi.rank")}</TableCell>
            <TableCell align="right">{t("missionToolsUi.xpNeeded")}</TableCell>
            <TableCell align="right">{t("missionToolsUi.runsToReach")}</TableCell>
            <TableCell align="right">{t("missionToolsUi.totalXpAtRank")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRanks.map((rank, i) => {
            const isBelowMin = i < minRankIndex
            const minThreshold = displayRanks[minRankIndex]?.threshold ?? 0
            // For negative rep: XP goes down, so distance is minThreshold - rank.threshold
            // For positive rep: XP goes up, so distance is rank.threshold - minThreshold
            const xpFromMin = isNegativeRep
              ? minThreshold - rank.threshold
              : rank.threshold - minThreshold
            const absXpPerRun = Math.abs(xpPerRun) || 1
            const runsNeeded = xpFromMin > 0 ? Math.ceil(xpFromMin / absXpPerRun) : 0

            return (
              <TableRow
                key={rank.standing_code}
                sx={{
                  opacity: isBelowMin ? 0.35 : 1,
                  bgcolor: isBelowMin ? "action.disabledBackground" : undefined,
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" fontWeight={isBelowMin ? 400 : 600}>
                      {rank.standing_display_name}
                    </Typography>
                    {isBelowMin && (
                      <Chip label={t("missionToolsUi.locked")} size="small" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
                    )}
                    {i === minRankIndex && (
                      <Chip label={t("missionToolsUi.minBadge")} size="small" color="warning" sx={{ height: 16, fontSize: "0.6rem" }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={isBelowMin ? "text.secondary" : "text.primary"}>
                    {isBelowMin ? "—" : xpFromMin.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={isBelowMin ? "text.secondary" : "success.main"} fontWeight={600}>
                    {isBelowMin ? "—" : runsNeeded}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" color="text.secondary">
                    {rank.threshold.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}
