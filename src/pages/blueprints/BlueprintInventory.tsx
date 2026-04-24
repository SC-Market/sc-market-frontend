/**
 * BlueprintInventory — thin wrapper around BlueprintBrowser with collection progress.
 * Sets ?owned=true so the browser shows only owned blueprints by default.
 */

import React, { useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material"
import { useSearchParams } from "react-router-dom"
import { useGetUserBlueprintInventoryQuery } from "../../store/api/v2/market"
import { BlueprintBrowser } from "./BlueprintBrowser"

function CollectionProgress() {
  const { data } = useGetUserBlueprintInventoryQuery({ page: 1, pageSize: 1 })
  const stats = data?.statistics
  if (!stats) return null

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" gutterBottom>
          Collection Progress
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={stats.completion_percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
            {stats.completion_percentage.toFixed(1)}%
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {stats.total_owned} of {stats.total_available} obtainable blueprints
          {stats.recently_acquired_count > 0 && (
            <Chip
              label={`${stats.recently_acquired_count} new this week`}
              size="small"
              color="primary"
              sx={{ ml: 1, height: 18, fontSize: "0.65rem" }}
            />
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}

export function BlueprintInventory() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Ensure owned=true is set on mount
  useEffect(() => {
    if (searchParams.get("owned") !== "true") {
      const params = new URLSearchParams(searchParams)
      params.set("owned", "true")
      setSearchParams(params, { replace: true })
    }
  }, [])

  return (
    <>
      <CollectionProgress />
      <BlueprintBrowser />
    </>
  )
}
