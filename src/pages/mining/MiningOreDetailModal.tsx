import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Chip,
  Stack,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { Section } from "../../components/paper/Section"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Props {
  oreName: string | null
  open: boolean
  onClose: () => void
}

function dangerColor(value: number, max: number): "success" | "warning" | "error" {
  const ratio = value / max
  if (ratio < 0.33) return "success"
  if (ratio < 0.66) return "warning"
  return "error"
}

export function MiningOreDetailModal({ oreName, open, onClose }: Props) {
  const { t } = useTranslation()
  const { data: ore, isLoading } = useGetOreDetailQuery(
    { name: oreName! },
    { skip: !oreName },
  )

  const displayName = ore ? (ore.displayName || friendlyName(ore.name)) : oreName

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{displayName}</Typography>
          {ore?.rarity && (
            <Chip
              label={ore.rarity.charAt(0).toUpperCase() + ore.rarity.slice(1)}
              size="small"
              sx={{ bgcolor: RARITY_COLORS[(ore.rarity || "").toLowerCase()] || "#757575", color: "#fff" }}
            />
          )}
        </Stack>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {ore && (
          <Stack spacing={2}>
            {ore.marketPrice != null && (
              <Typography variant="h6" color="success.main">
                {ore.marketPrice.toLocaleString()} aUEC
              </Typography>
            )}

            <Section title={t("mining.stats", "Mining Stats")}>
              <Stack spacing={1.5} sx={{ pt: 1 }}>
                <StatBar label="Instability" value={ore.instability} max={1000} />
                <StatBar label="Resistance" value={ore.resistance != null ? ore.resistance * 100 : null} max={100} suffix="%" />
                <StatBar label="Optimal Window" value={ore.optimalWindowThinness} max={10} />
                <StatBar label="Explosion Risk" value={ore.explosionMultiplier} max={500} />
                <StatBar label="Cluster Factor" value={ore.clusterFactor} max={10} />
              </Stack>
            </Section>

            <Section title={t("mining.locations", "Locations")}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>System</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Group</TableCell>
                      <TableCell align="right">Probability (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...(ore.locations || [])]
                      .sort((a, b) => b.relativeProbability - a.relativeProbability)
                      .map((loc, i) => (
                        <TableRow key={`${loc.locationName}-${loc.groupName}-${i}`} hover>
                          <TableCell>{friendlyName(loc.locationName)}</TableCell>
                          <TableCell>{friendlyName(loc.system)}</TableCell>
                          <TableCell>{friendlyName(loc.locationType)}</TableCell>
                          <TableCell>{friendlyName(loc.groupName)}</TableCell>
                          <TableCell align="right">{loc.relativeProbability.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StatBar({ label, value, max, suffix = "" }: { label: string; value: number | null | undefined; max: number; suffix?: string }) {
  if (value == null) return null
  const pct = Math.min((value / max) * 100, 100)
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{value.toFixed(1)}{suffix}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={dangerColor(value, max)}
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Box>
  )
}
