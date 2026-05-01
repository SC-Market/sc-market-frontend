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
import { useGetLocationDetailQuery, type LocationMiningGroup } from "../../store/api/v2/market"
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
  locationName: string | null
  open: boolean
  onClose: () => void
}

function groupLabel(groupName: string): string {
  const g = (groupName || "").toLowerCase()
  if (g.includes("spaceship") || g.includes("ship")) return "Ship Mining"
  if (g.includes("ground")) return "Ground Vehicle Mining"
  if (g.includes("fps")) return "FPS Mining"
  return friendlyName(groupName || "Unknown")
}

export function MiningLocationDetailModal({ locationName, open, onClose }: Props) {
  const { t } = useTranslation()
  const { data: loc, isLoading } = useGetLocationDetailQuery(
    { name: locationName! },
    { skip: !locationName },
  )

  const displayName = loc ? (loc.displayName || friendlyName(loc.name)) : locationName

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{displayName}</Typography>
          {loc && <Chip label={friendlyName(loc.system)} size="small" color="primary" />}
          {loc && <Chip label={friendlyName(loc.locationType)} size="small" variant="outlined" />}
          {loc?.hasRefinery && <Chip label="Refinery" size="small" color="success" />}
        </Stack>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {loc && (
          <Stack spacing={2}>
            {(loc.groups || []).map((group) => (
              <MiningGroupSection key={group.groupName} group={group} />
            ))}

            {(loc.amenities || []).length > 0 && (
              <Section title={t("mining.amenities", "Amenities")}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ pt: 1 }}>
                  {loc.amenities.map((a) => (
                    <Chip
                      key={a}
                      label={friendlyName(a)}
                      size="small"
                      color={a.toLowerCase().includes("refinery") ? "success" : "default"}
                    />
                  ))}
                </Stack>
              </Section>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

function MiningGroupSection({ group }: { group: LocationMiningGroup }) {
  return (
    <Section title={`${groupLabel(group.groupName)} (Weight: ${group.groupProbability})`}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ore</TableCell>
              <TableCell align="center">Rarity</TableCell>
              <TableCell align="right">Probability (%)</TableCell>
              <TableCell align="right">Market Price</TableCell>
              <TableCell align="right">Est. Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...(group.ores || [])]
              .sort((a, b) => b.relativeProbability - a.relativeProbability)
              .map((ore) => {
                const name = ore.displayName || (ore.resourceName ? friendlyName(ore.resourceName) : friendlyName(ore.elementName || ore.presetName))
                const rarity = ore.rarity || "common"
                return (
                  <TableRow key={ore.presetName} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                        size="small"
                        sx={{ bgcolor: (RARITY_COLORS[rarity] || "#9e9e9e") + "22", color: RARITY_COLORS[rarity] || "#9e9e9e", fontWeight: 600, height: 20, fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="right">{ore.relativeProbability.toFixed(1)}</TableCell>
                    <TableCell align="right">
                      {ore.marketPrice != null ? `${ore.marketPrice.toLocaleString()} aUEC` : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {ore.estimatedValue != null ? `${ore.estimatedValue.toLocaleString()} aUEC` : "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  )
}
