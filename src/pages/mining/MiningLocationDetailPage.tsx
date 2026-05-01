import React from "react"
import { useParams } from "react-router-dom"
import { Grid, Typography, Chip, Stack, Box, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, CircularProgress } from "@mui/material"
import { useGetLocationDetailQuery, type LocationMiningGroup } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const RARITY_COLORS: Record<string, string> = { common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3", epic: "#9c27b0", legendary: "#ff9800" }

export function MiningLocationDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: loc, isLoading, error } = useGetLocationDetailQuery({ name: name! }, { skip: !name })
  const displayName = loc?.displayName || friendlyName(name || "")

  return (
    <StandardPageLayout
      title={displayName}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining?tab=locations" }, { label: "Locations", href: "/mining?tab=locations" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {loc && (
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>{displayName}</Typography>
            <Chip label={loc.system} size="small" color="primary" />
            <Chip label={loc.locationType} size="small" variant="outlined" />
            {loc.hasRefinery && <Chip label="Refinery" size="small" color="success" />}
          </Stack>

          {(loc.groups || []).map((group) => (
            <Paper key={group.groupName} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>{group.groupName} (Weight: {group.groupProbability})</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ore</TableCell>
                      <TableCell align="center">Rarity</TableCell>
                      <TableCell align="right">Probability</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Est. Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...(group.ores || [])].sort((a, b) => b.relativeProbability - a.relativeProbability).map((ore) => (
                      <TableRow key={ore.presetName} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{ore.displayName || friendlyName(ore.elementName || ore.presetName)}</Typography></TableCell>
                        <TableCell align="center">
                          <Chip label={(ore.rarity || "common").charAt(0).toUpperCase() + (ore.rarity || "common").slice(1)} size="small"
                            sx={{ bgcolor: (RARITY_COLORS[ore.rarity || "common"] || "#9e9e9e") + "22", color: RARITY_COLORS[ore.rarity || "common"], fontWeight: 600, height: 20, fontSize: "0.7rem" }} />
                        </TableCell>
                        <TableCell align="right">{ore.relativeProbability.toFixed(1)}</TableCell>
                        <TableCell align="right">{ore.marketPrice != null ? `${ore.marketPrice.toLocaleString()}` : "—"}</TableCell>
                        <TableCell align="right">{ore.estimatedValue != null ? `${ore.estimatedValue.toLocaleString()}` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
