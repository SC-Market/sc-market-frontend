/**
 * Shared ore detail content — used by both the desktop modal and mobile full page.
 */
import React from "react"
import {
  Typography, Chip, Stack, Box, Button, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useTheme,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { OreDetailResponse, OreQualityDistribution } from "../../store/api/v2/market"
import { Section } from "../../components/paper/Section"
import { EmptyState } from "../../components/empty-states/EmptyState"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3", epic: "#9c27b0", legendary: "#ff9800",
}

function dangerColor(value: number, max: number): "success" | "warning" | "error" {
  if (value < 0) return "success"
  const ratio = Math.abs(value) / max
  if (ratio < 0.33) return "success"
  if (ratio < 0.66) return "warning"
  return "error"
}

interface Props {
  ore: OreDetailResponse
  onClose?: () => void
}

export function OreDetailContent({ ore, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const hasQuality = (ore.qualityDistributions?.length ?? 0) > 0

  return (
    <Stack spacing={2}>
      {/* Header chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {ore.rarity && (
          <Chip label={ore.rarity.charAt(0).toUpperCase() + ore.rarity.slice(1)} size="small"
            sx={{ bgcolor: RARITY_COLORS[ore.rarity.toLowerCase()] || "#757575", color: "#fff" }} />
        )}
        {ore.marketPrice != null && (
          <Chip label={`${ore.marketPrice.toLocaleString()} aUEC`} size="small" color="success" />
        )}
      </Stack>

      {/* Stats + Quality: side by side on desktop, stacked on mobile */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: hasQuality ? "row" : "column" }, gap: 2 }}>
        <Box sx={{ flex: { xs: 1, md: hasQuality ? "0 0 33.33%" : 1 }, minWidth: 0 }}>
          <Section title={t("mining.stats", "Mining Stats")} disablePadding>
            <Stack spacing={1.5} sx={{ pt: 1, px: 2, pb: 2, width: "100%" }}>
              <StatBar label="Instability" value={ore.instability} max={1000} />
              <StatBar label="Resistance" value={ore.resistance != null ? ore.resistance * 100 : null} max={100} suffix="%" />
              <StatBar label="Optimal Window Size" value={ore.optimalWindowThinness} max={10} />
              <StatBar label="Optimal Window Position" value={ore.optimalWindowMidpoint != null ? ore.optimalWindowMidpoint * 100 : null} max={100} suffix="%" />
              <StatBar label="Explosion Risk" value={ore.explosionMultiplier} max={500} />
              <StatBar label="Cluster Factor" value={ore.clusterFactor != null ? ore.clusterFactor * 100 : null} max={100} suffix="%" />
            </Stack>
          </Section>
        </Box>

        {hasQuality && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Section title="Quality Distribution" disablePadding>
              <Box sx={{ pt: 1, px: 2, pb: 2, width: "100%" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Quality 0–1000. Higher = better crafting &amp; sell price.
                </Typography>
                {ore.qualityDistributions.map((qd: OreQualityDistribution, i: number) => (
                  <QualityDistBar key={i} qd={qd} />
                ))}
              </Box>
            </Section>
          </Box>
        )}
      </Box>

      {/* Locations */}
      <Section title={t("mining.locations", "Locations")}>
        {(ore.locations?.length ?? 0) === 0 ? (
          <EmptyState title="No known locations" description="This ore has no recorded spawn locations in the current game data." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Probability</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...ore.locations]
                  .sort((a, b) => b.relativeProbability - a.relativeProbability)
                  .map((loc, i) => (
                    <TableRow key={`${loc.locationName}-${loc.groupName}-${i}`} hover>
                      <TableCell>{loc.locationName}</TableCell>
                      <TableCell>{loc.system}</TableCell>
                      <TableCell>{loc.locationType}</TableCell>
                      <TableCell>{loc.groupName}</TableCell>
                      <TableCell align="right">{loc.relativeProbability.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Section>

      {ore.gameItemId && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" size="small"
            onClick={() => { onClose?.(); window.location.href = `/market/aggregate/${ore.gameItemId}` }}>
            View Market Listings
          </Button>
        </Box>
      )}
    </Stack>
  )
}

function StatBar({ label, value, max, suffix = "" }: { label: string; value: number | null | undefined; max: number; suffix?: string }) {
  if (value == null) return null
  const pct = Math.min((Math.abs(value) / max) * 100, 100)
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{value.toFixed(1)}{suffix}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={dangerColor(value, max)}
        sx={{ height: 6, borderRadius: 1 }} />
    </Box>
  )
}

function QualityDistBar({ qd }: { qd: OreQualityDistribution }) {
  if (qd.min == null || qd.max == null) return null
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" fontWeight={600}>{qd.miningType}</Typography>
      <Box sx={{ mt: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
          <Typography variant="caption" color="text.secondary">Range</Typography>
          <Typography variant="caption">{qd.min} – {qd.max}</Typography>
        </Box>
        {qd.mean != null && qd.stddev != null && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
              <Typography variant="caption" color="text.secondary">Most likely</Typography>
              <Typography variant="caption" fontWeight={600}>
                {Math.max(qd.min, Math.round(qd.mean - qd.stddev))} – {Math.min(qd.max, Math.round(qd.mean + qd.stddev))}
              </Typography>
            </Box>
            <Box sx={{ position: "relative", height: 12, bgcolor: "action.hover", borderRadius: 1, mt: 0.5, overflow: "hidden" }}>
              <Box sx={{
                position: "absolute",
                left: `${((Math.max(0, qd.mean - qd.stddev) - qd.min) / (qd.max - qd.min)) * 100}%`,
                width: `${Math.min(100, ((2 * qd.stddev) / (qd.max - qd.min)) * 100)}%`,
                height: "100%", bgcolor: "primary.main", opacity: 0.3, borderRadius: 1,
              }} />
              <Box sx={{
                position: "absolute",
                left: `${((qd.mean - qd.min) / (qd.max - qd.min)) * 100}%`,
                width: 2, height: "100%", bgcolor: "primary.main",
              }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>{qd.min}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>{qd.max}</Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
