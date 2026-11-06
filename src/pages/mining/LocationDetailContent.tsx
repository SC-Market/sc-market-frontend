/**
 * Shared location detail content — used by both desktop modal and mobile page.
 */
import React from "react"
import {
  Typography,
  Chip,
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  RocketLaunchRounded,
  DirectionsCarRounded,
  PanToolRounded,
} from "@mui/icons-material"
import type {
  LocationDetailResponse,
  LocationMiningGroup,
} from "../../store/api/v2/market"
import { Section } from "../../components/paper/Section"

import { useFormatters } from "../../util/format"
import { blue, green, grey, orange, purple } from "@mui/material/colors"

const RARITY_COLORS: Record<string, string> = {
  common: grey[500],
  uncommon: green[500],
  rare: blue[500],
  epic: purple[500],
  legendary: orange[500],
}

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function groupIcon(groupName: string) {
  const g = (groupName || "").toLowerCase()
  const sx = { fontSize: 18, mr: 0.5, verticalAlign: "text-bottom" }
  if (g.includes("ship"))
    return <RocketLaunchRounded sx={{ ...sx, color: blue[500] }} />
  if (g.includes("ground") || g.includes("vehicle"))
    return <DirectionsCarRounded sx={{ ...sx, color: orange[500] }} />
  if (g.includes("fps") || g.includes("hand"))
    return <PanToolRounded sx={{ ...sx, color: green[500] }} />
  return null
}

interface Props {
  location: LocationDetailResponse
}

export function LocationDetailContent({ location }: Props) {
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      {/* Header chips */}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
      >
        <Chip label={location.system} size="small" color="primary" />
        <Chip label={location.locationType} size="small" variant="outlined" />
        {location.hasRefinery && (
          <Chip
            label={t("miningUi.location.refinery")}
            size="small"
            color="success"
          />
        )}
      </Stack>

      {/* Mining groups */}
      {(location.groups || []).map((group) => (
        <MiningGroupTable key={group.groupName} group={group} />
      ))}

      {/* Amenities */}
      {(location.amenities || []).length > 0 && (
        <Section title={t("miningUi.location.amenities")}>
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            gap={0.5}
            sx={{ pt: 1 }}
          >
            {location.amenities.map((a) => (
              <Chip
                key={a}
                label={a}
                size="small"
                color={
                  a.toLowerCase().includes("refinery")
                    ? "success"
                    : a.toLowerCase().includes("hospital") ||
                        a.toLowerCase().includes("clinic")
                      ? "info"
                      : "default"
                }
              />
            ))}
          </Stack>
        </Section>
      )}
    </Stack>
  )
}

function MiningGroupTable({ group }: { group: LocationMiningGroup }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const sorted = [...(group.ores || [])].sort(
    (a, b) => b.relativeProbability - a.relativeProbability,
  )
  return (
    <Paper>
      <Box sx={{ p: 2, pb: 1, display: "flex", alignItems: "center" }}>
        {groupIcon(group.groupName)}
        <Typography variant="subtitle2">
          {t("miningUi.location.groupWithWeight", {
            group: group.groupName,
            weight: group.groupProbability,
          })}
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("miningUi.location.colOre")}</TableCell>
              <TableCell align="center">
                {t("miningUi.location.colRarity")}
              </TableCell>
              <TableCell align="right">
                {t("miningUi.location.colProbability")}
              </TableCell>
              <TableCell align="right">
                {t("miningUi.location.colPrice")}
              </TableCell>
              <TableCell align="right">
                {t("miningUi.location.colEstValue")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((ore) => {
              const name =
                ore.displayName ||
                (ore.resourceName
                  ? friendlyName(ore.resourceName)
                  : friendlyName(ore.elementName || ore.presetName))
              const rarity = ore.rarity || "common"
              return (
                <TableRow key={ore.presetName} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {name}
                    </Typography>
                    {(ore.instability != null || ore.resistance != null) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.65rem" }}
                      >
                        {[
                          ore.instability != null
                            ? t("miningUi.location.instShort", {
                                value: ore.instability,
                              })
                            : null,
                          ore.resistance != null
                            ? t("miningUi.location.resShort", {
                                value: `${(ore.resistance * 100).toFixed(0)}%`,
                              })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: (RARITY_COLORS[rarity] || grey[500]) + "22",
                        color: RARITY_COLORS[rarity] || grey[500],
                        fontWeight: 600,
                        height: 20,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {ore.relativeProbability.toFixed(1)}%
                  </TableCell>
                  <TableCell align="right">
                    {ore.marketPrice != null
                      ? fmt.number(ore.marketPrice)
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    {ore.estimatedValue != null
                      ? fmt.number(ore.estimatedValue)
                      : "—"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
