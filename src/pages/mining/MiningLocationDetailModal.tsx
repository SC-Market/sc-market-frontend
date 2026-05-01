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
import { useGetMiningLocationDetailQuery, type MiningLocationGroup } from "../../store/api/v2/mining"
import { Section } from "../../components/paper/Section"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

interface Props {
  locationName: string | null
  open: boolean
  onClose: () => void
}

function groupLabel(groupName: string): string {
  if (groupName.toLowerCase().includes("spaceship") || groupName.toLowerCase().includes("ship")) return "Ship Mining"
  if (groupName.toLowerCase().includes("ground")) return "Ground Vehicle Mining"
  if (groupName.toLowerCase().includes("fps")) return "FPS Mining"
  return groupName
}

export function MiningLocationDetailModal({ locationName, open, onClose }: Props) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetMiningLocationDetailQuery(
    { name: locationName! },
    { skip: !locationName },
  )
  const loc = data?.location

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{loc?.location_name || locationName}</Typography>
          {loc && <Chip label={loc.system} size="small" color="primary" />}
          {loc && <Chip label={loc.location_type} size="small" variant="outlined" />}
        </Stack>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {loc && (
          <Stack spacing={2}>
            {loc.groups.map((group) => (
              <MiningGroupSection key={group.group_name} group={group} />
            ))}

            {loc.amenities.length > 0 && (
              <Section title={t("mining.amenities", "Amenities")}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ pt: 1 }}>
                  {loc.amenities.map((a) => (
                    <Chip
                      key={a}
                      label={a}
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

function MiningGroupSection({ group }: { group: MiningLocationGroup }) {
  return (
    <Section
      title={`${groupLabel(group.group_name)} (Weight: ${group.group_probability})`}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ore</TableCell>
              <TableCell>Rarity</TableCell>
              <TableCell align="right">Probability (%)</TableCell>
              <TableCell align="right">Market Price</TableCell>
              <TableCell align="right">Est. Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...group.ores]
              .sort((a, b) => b.probability_pct - a.probability_pct)
              .map((ore) => (
                <TableRow key={ore.ore_name} hover>
                  <TableCell>{ore.ore_name}</TableCell>
                  <TableCell>
                    {ore.rarity && (
                      <Chip
                        label={ore.rarity}
                        size="small"
                        sx={{ height: 20, fontSize: "0.65rem", bgcolor: RARITY_COLORS[ore.rarity.toLowerCase()] || "#757575", color: "#fff" }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{ore.probability_pct.toFixed(1)}</TableCell>
                  <TableCell align="right">
                    {ore.market_price != null ? `${ore.market_price.toLocaleString()} aUEC` : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {ore.estimated_value != null ? `${ore.estimated_value.toLocaleString()} aUEC` : "—"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Section>
  )
}
