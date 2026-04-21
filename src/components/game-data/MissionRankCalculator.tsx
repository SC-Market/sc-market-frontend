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

  const xpPerRun = useMemo(() => {
    if (!reputationReward) return 0
    return Math.floor(reputationReward / crewSize)
  }, [reputationReward, crewSize])

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
        <strong>{xpPerRun}</strong> XP per run towards <Chip label={rewardScope} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
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
            const isBelowMin = requiredRank != null && rank.rank_index < requiredRank
            const prevThreshold = i > 0 ? ranks[i - 1].ceiling : 0
            const xpForThisRank = rank.threshold - prevThreshold
            const runsNeeded = xpPerRun > 0 ? Math.ceil(xpForThisRank / xpPerRun) : "∞"

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
                    {requiredRank != null && rank.rank_index === requiredRank && (
                      <Chip label="Min" size="small" color="warning" sx={{ height: 16, fontSize: "0.6rem" }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={isBelowMin ? "text.disabled" : "text.primary"}>
                    {xpForThisRank.toLocaleString()}
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
