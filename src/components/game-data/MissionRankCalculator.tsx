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
import { useGetReputationRanksQuery } from "../../store/api/v2/market"

interface Props {
  reputationReward: number
  rewardScope: string
  rewardFaction?: string
  requiredRank?: number
  isShareable: boolean
}

export function MissionRankCalculator({ reputationReward, rewardScope, rewardFaction, requiredRank, isShareable }: Props) {
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
  const isNegativeRep = xpPerRun < 0 || useMemo(() => {
    if (ranks.length < 2) return false
    const firstName = ranks[0]?.standing_display_name?.toLowerCase() || ""
    return /exalted|ally|best|loved/.test(firstName)
  }, [ranks])

  const displayRanks = useMemo(() => ranks, [ranks])

  // Find the min rank index based on the required standing threshold
  const minRankIndex = useMemo(() => {
    if (requiredRank == null) return 0
    const idx = displayRanks.findIndex((r) => r.threshold >= requiredRank)
    return idx >= 0 ? idx : 0
  }, [requiredRank, displayRanks])

  if (isLoading) return <Typography variant="body2" color="text.secondary">Loading ranks...</Typography>
  if (!ranks.length) return <Alert severity="info">No rank data available for {scopeDisplayName}</Alert>

  // Affinity scopes have negative thresholds and sliding scale — not suitable for a grind calculator
  if (isNegativeRep || ranks.some((r) => r.threshold < 0)) {
    return (
      <Alert severity="info">
        This mission affects your <strong>{scopeDisplayName}</strong> standing
        {rewardFaction ? ` with ${rewardFaction}` : ""}.
        {" "}Completing it will {reputationReward > 0 ? "increase" : "decrease"} your reputation by{" "}
        <strong>{Math.abs(reputationReward).toLocaleString()} XP</strong> per run.
      </Alert>
    )
  }

  return (
    <Box>
      {isNegativeRep && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This mission <strong>decreases</strong> your standing with this faction. Completing it will push you toward lower ranks.
        </Alert>
      )}
      {/* Crew size slider */}
      {isShareable && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Crew size: <strong>{crewSize}</strong> {crewSize > 1 && `(${xpPerRun} XP each)`}
          </Typography>
          <Slider
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
        <strong>{xpPerRun}</strong> XP per run towards{" "}
        {rewardFaction && <Chip label={rewardFaction} size="small" color="secondary" sx={{ height: 20, fontSize: "0.7rem", mr: 0.5 }} />}
        <Chip label={scopeDisplayName} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
      </Typography>

      <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell align="right">XP Needed</TableCell>
            <TableCell align="right">Runs to Reach</TableCell>
            <TableCell align="right">Total XP at Rank</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayRanks.map((rank, i) => {
            const isBelowMin = i < minRankIndex
            const minThreshold = displayRanks[minRankIndex]?.threshold ?? 0
            const xpFromMin = rank.threshold - minThreshold
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
                      <Chip label="Locked" size="small" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
                    )}
                    {i === minRankIndex && (
                      <Chip label="MIN" size="small" color="warning" sx={{ height: 16, fontSize: "0.6rem" }} />
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
