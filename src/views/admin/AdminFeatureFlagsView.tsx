import React, { useMemo, useState } from "react"
import {
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useGetStatsQuery, type FeatureFlagStats } from "../../store/api/v2/market"
import { ADMIN_PATHS } from "../../routes/paths"

export function AdminFeatureFlagsView() {
  const { data: stats } = useGetStatsQuery()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!stats) return [] as FeatureFlagStats[]
    if (!search.trim()) return stats
    const q = search.toLowerCase()
    return stats.filter((f) => f.flag_name.toLowerCase().includes(q))
  }, [stats, search])

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Feature Flags</Typography>
      <TextField
        size="small"
        fullWidth
        placeholder="Search flags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <List disablePadding>
        {filtered.map((flag) => {
          const label = flag.flag_name.replace(/_/g, " ").replace(/\bv2\b/i, "V2")
          return (
            <ListItemButton
              key={flag.flag_name}
              component={Link}
              to={ADMIN_PATHS.featureFlag(flag.flag_name)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="bold" sx={{ textTransform: "capitalize" }}>
                    {label}
                  </Typography>
                }
                secondary={`Default: ${flag.default_version} · Rollout: ${flag.rollout_percentage}% · ${flag.override_count} overrides`}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={flag.enabled ? "Enabled" : "Disabled"}
                  color={flag.enabled ? "success" : "default"}
                  size="small"
                />
              </Stack>
            </ListItemButton>
          )
        })}
        {filtered.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            {search ? "No flags match your search" : "No feature flags configured"}
          </Typography>
        )}
      </List>
    </Box>
  )
}
