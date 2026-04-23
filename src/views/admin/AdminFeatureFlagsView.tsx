import React from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useGetStatsQuery } from "../../store/api/v2/market"

export function AdminFeatureFlagsView() {
  const { data: statsRaw } = useGetStatsQuery()
  const stats = ((statsRaw as any)?.data || statsRaw) as any[] | undefined

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Feature Flags</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click a flag to manage its configuration and per-user overrides.
      </Typography>

      <Grid container spacing={2}>
        {(stats || []).map((flag: any) => {
          const label = flag.flag_name.replace(/_/g, " ").replace(/\bv2\b/i, "V2")
          return (
            <Grid item xs={12} sm={6} md={4} key={flag.flag_name}>
              <Card>
                <CardActionArea component={Link} to={`/admin/feature-flags/${flag.flag_name}`}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" sx={{ textTransform: "capitalize" }}>{label}</Typography>
                      <Chip
                        label={flag.enabled ? "Enabled" : "Disabled"}
                        color={flag.enabled ? "success" : "default"}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Default: {flag.default_version} · Rollout: {flag.rollout_percentage}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {flag.override_count} overrides ({flag.enabled_overrides} on / {flag.disabled_overrides} off)
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
