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
  Button,
  CircularProgress,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetMiningOreDetailQuery } from "../../store/api/v2/mining"
import { Section } from "../../components/paper/Section"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

interface Props {
  oreName: string | null
  open: boolean
  onClose: () => void
}

/** Map a 0-1 value to green→red */
function dangerColor(value: number, max: number): "success" | "warning" | "error" {
  const ratio = value / max
  if (ratio < 0.33) return "success"
  if (ratio < 0.66) return "warning"
  return "error"
}

export function MiningOreDetailModal({ oreName, open, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useGetMiningOreDetailQuery(
    { name: oreName! },
    { skip: !oreName },
  )
  const ore = data?.ore

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{ore?.resource_name || oreName}</Typography>
          {ore?.rarity && (
            <Chip
              label={ore.rarity}
              size="small"
              sx={{ bgcolor: RARITY_COLORS[ore.rarity.toLowerCase()] || "#757575", color: "#fff" }}
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
            {ore.market_price != null && (
              <Typography variant="h6" color="success.main">
                {ore.market_price.toLocaleString()} aUEC
              </Typography>
            )}

            <Section title={t("mining.stats", "Mining Stats")}>
              <Stack spacing={1.5} sx={{ pt: 1 }}>
                <StatBar label="Instability" value={ore.instability} max={1000} />
                <StatBar label="Resistance" value={ore.resistance != null ? ore.resistance * 100 : null} max={100} suffix="%" />
                <StatBar label="Optimal Window" value={ore.optimal_window_thinness} max={10} />
                <StatBar label="Explosion Risk" value={ore.explosion_multiplier} max={500} />
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
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Probability (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...ore.locations]
                      .sort((a, b) => b.probability_pct - a.probability_pct)
                      .map((loc) => (
                        <TableRow key={`${loc.location_name}-${loc.group_name}`} hover>
                          <TableCell>{loc.location_name}</TableCell>
                          <TableCell>{loc.system}</TableCell>
                          <TableCell>{loc.location_type}</TableCell>
                          <TableCell>{loc.mining_method}</TableCell>
                          <TableCell align="right">{loc.probability_pct.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>

            {ore.game_item_id && (
              <Button
                variant="outlined"
                onClick={() => { onClose(); navigate(`/market/aggregate/${ore.game_item_id}`) }}
              >
                {t("mining.viewOnMarket", "View on Market")}
              </Button>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StatBar({ label, value, max, suffix = "" }: { label: string; value: number | null; max: number; suffix?: string }) {
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
