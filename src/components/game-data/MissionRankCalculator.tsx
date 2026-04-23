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
  requiredRank?: number
  isShareable: boolean
}

export function MissionRankCalculator({ reputationReward, rewardScope, requiredRank, isShareable }: Props) {
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

  // Find the min rank index based on the required standing threshold
  const minRankIndex = useMemo(() => {
    if (requiredRank == null) return 0
    // requiredRank is the XP threshold of the min standing
    const idx = ranks.findIndex((r) => r.threshold >= requiredRank)
    return idx >= 0 ? idx : 0
  }, [requiredRank, ranks])

  if (isLoading) return <Typography variant="body2" color="text.secondary">Loading ranks...</Typography>
  if (!ranks.length) return <Alert severity="info">No rank data available for {rewardScope}</Alert>

  return (
    <Box>
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
        <strong>{xpPerRun}</strong> XP per run towards <Chip label={scopeDisplayName} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
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
          {ranks.map((rank, i) => {
            const isBelowMin = i < minRankIndex
            // XP needed from the min standing to reach this rank
            const minThreshold = ranks[minRankIndex]?.threshold ?? 0
            const xpFromMin = rank.threshold - minThreshold
            const runsNeeded = xpPerRun > 0 && xpFromMin > 0 ? Math.ceil(xpFromMin / xpPerRun) : 0

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
                  <Typography variant="body2" color={isBelowMin ? "text.disabled" : "text.primary"}>
                    {isBelowMin ? "—" : xpFromMin.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={isBelowMin ? "text.disabled" : "success.main"} fontWeight={600}>
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
