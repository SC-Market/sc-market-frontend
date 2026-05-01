import React from "react"
import { useParams } from "react-router-dom"
import { Grid, Typography, Chip, Stack, Box, Table, TableBody, TableCell, TableHead, TableRow, Paper, LinearProgress, CircularProgress } from "@mui/material"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const RARITY_COLORS: Record<string, string> = { common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3", epic: "#9c27b0", legendary: "#ff9800" }

export function MiningOreDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: ore, isLoading, error } = useGetOreDetailQuery({ name: name! }, { skip: !name })
  const displayName = ore?.displayName || friendlyName(name || "")

  return (
    <StandardPageLayout
      title={displayName}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining" }, { label: "Ores", href: "/mining" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {ore && (
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Chip label={ore.rarity} size="small" sx={{ bgcolor: (RARITY_COLORS[ore.rarity] || "#9e9e9e") + "22", color: RARITY_COLORS[ore.rarity], fontWeight: 600 }} />
            {ore.marketPrice != null && <Chip label={`${ore.marketPrice.toLocaleString()} aUEC`} size="small" color="success" />}
          </Stack>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Mining Stats</Typography>
            {[
              { label: "Instability", value: ore.instability, max: 800 },
              { label: "Resistance", value: ore.resistance, max: 1 },
              { label: "Optimal Window", value: ore.optimalWindowThinness, max: 3 },
              { label: "Explosion Risk", value: ore.explosionMultiplier, max: 300 },
            ].map(({ label, value, max }) => value != null ? (
              <Box key={label} sx={{ mb: 1 }}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="caption">{label}</Typography><Typography variant="caption" fontWeight={600}>{value}</Typography></Stack>
                <LinearProgress variant="determinate" value={Math.min(100, (Math.abs(value) / max) * 100)}
                  color={value < 0 ? "success" : Math.abs(value) / max < 0.33 ? "success" : Math.abs(value) / max < 0.66 ? "warning" : "error"}
                  sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            ) : null)}
          </Paper>

          {ore.locations && ore.locations.length > 0 && (
            <Paper sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>Locations ({ore.locations.length})</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>System</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Probability</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ore.locations.map((loc, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{loc.locationName}</TableCell>
                      <TableCell>{loc.system}</TableCell>
                      <TableCell><Typography variant="caption">{loc.groupName}</Typography></TableCell>
                      <TableCell align="right">{loc.relativeProbability.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
