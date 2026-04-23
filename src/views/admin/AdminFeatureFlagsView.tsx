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
import { useGetStatsQuery } from "../../store/api/v2/market"

export function AdminFeatureFlagsView() {
  const { data: statsRaw } = useGetStatsQuery()
  const stats = ((statsRaw as any)?.data || statsRaw) as any[] | undefined
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!stats) return []
    if (!search.trim()) return stats
    const q = search.toLowerCase()
    return stats.filter((f: any) => f.flag_name.toLowerCase().includes(q))
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
        {filtered.map((flag: any) => {
          const label = flag.flag_name.replace(/_/g, " ").replace(/\bv2\b/i, "V2")
          return (
            <ListItemButton
              key={flag.flag_name}
              component={Link}
              to={`/admin/feature-flags/${flag.flag_name}`}
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
