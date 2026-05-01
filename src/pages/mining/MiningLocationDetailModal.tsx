import React from "react"
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Chip, Stack, Box, CircularProgress,
} from "@mui/material"
import { Close, RocketLaunchRounded, DirectionsCarRounded, PanToolRounded } from "@mui/icons-material"
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
  if (g.includes("ship")) return "Ship Mining"
  if (g.includes("ground")) return "Ground Vehicle Mining"
  if (g.includes("fps") || g.includes("hand")) return "Hand Mining (FPS)"
  return friendlyName(groupName || "Unknown")
}

function groupIcon(groupName: string) {
  const g = (groupName || "").toLowerCase()
  const sx = { fontSize: 18, mr: 0.5, verticalAlign: "text-bottom" }
  if (g.includes("ship")) return <RocketLaunchRounded sx={{ ...sx, color: "#2196f3" }} />
  if (g.includes("ground")) return <DirectionsCarRounded sx={{ ...sx, color: "#ff9800" }} />
  if (g.includes("fps") || g.includes("hand")) return <PanToolRounded sx={{ ...sx, color: "#4caf50" }} />
  return null
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
  const sorted = [...(group.ores || [])].sort((a, b) => b.relativeProbability - a.relativeProbability)
  return (
    <Section element_title={<Box component="span">{groupIcon(group.groupName)}{groupLabel(group.groupName)} (Weight: {group.groupProbability})</Box>}>
      <Stack spacing={0.5} sx={{ pt: 1 }}>
        {sorted.map((ore) => {
          const name = ore.displayName || (ore.resourceName ? friendlyName(ore.resourceName) : friendlyName(ore.elementName || ore.presetName))
          const rarity = ore.rarity || "common"
          const color = RARITY_COLORS[rarity] || "#9e9e9e"
          return (
            <Box key={ore.presetName} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Chip
                  label={name}
                  size="small"
                  sx={{ bgcolor: color + "18", color, fontWeight: 600, height: 24, fontSize: "0.75rem", borderLeft: `3px solid ${color}` }}
                />
                {ore.marketPrice != null && (
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {ore.marketPrice.toLocaleString()} aUEC
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ ml: 1, whiteSpace: "nowrap" }}>
                {ore.relativeProbability.toFixed(1)}%
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Section>
  )
}
  )
}
