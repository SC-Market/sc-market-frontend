/**
 * Wiki Manufacturer List — grid of manufacturer cards with color accent lines,
 * specialty category chips, and item/ship counts.
 */

import React, { useState } from "react"
import {
  Box, Card, CardContent, CardActionArea, Grid, Chip, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Typography, ToggleButtonGroup, ToggleButton,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useGetManufacturersQuery } from "../../store/api/v2/market"
import {
  GridViewRounded, ViewListRounded, RocketLaunch, DirectionsCar,
  Security, Build, Memory, ShoppingBag,
} from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"

// Accent color + known specialty metadata per manufacturer code
const MFR_META: Record<string, { color: string; specialties: string[]; tagline?: string }> = {
  "Roberts Space Industries": { color: "#00acc1", specialties: ["Ships", "Armor", "Weapons"], tagline: "From the Earth to the Stars" },
  RSI: { color: "#00acc1", specialties: ["Ships", "Armor", "Weapons"], tagline: "From the Earth to the Stars" },
  "Aegis Dynamics": { color: "#1976d2", specialties: ["Ships", "Weapons", "Armor"], tagline: "Prepared for the Worst" },
  Aegis: { color: "#1976d2", specialties: ["Ships", "Weapons", "Armor"], tagline: "Prepared for the Worst" },
  "Drake Interplanetary": { color: "#e53935", specialties: ["Ships", "Weapons"], tagline: "What You Do Is Your Business" },
  Drake: { color: "#e53935", specialties: ["Ships", "Weapons"], tagline: "What You Do Is Your Business" },
  "Anvil Aerospace": { color: "#fb8c00", specialties: ["Ships", "Weapons", "Armor"], tagline: "Built to Last" },
  Anvil: { color: "#fb8c00", specialties: ["Ships", "Weapons", "Armor"], tagline: "Built to Last" },
  "Origin Jumpworks": { color: "#7b1fa2", specialties: ["Ships", "Consumer"], tagline: "Luxury Redefined" },
  Origin: { color: "#7b1fa2", specialties: ["Ships", "Consumer"], tagline: "Luxury Redefined" },
  MISC: { color: "#388e3c", specialties: ["Ships", "Components"], tagline: "Today, Tomorrow, Together" },
  "Greycat Industrial": { color: "#546e7a", specialties: ["Vehicles", "Tools", "Equipment"], tagline: "Industrial Grade. Always." },
  Greycat: { color: "#546e7a", specialties: ["Vehicles", "Tools", "Equipment"], tagline: "Industrial Grade. Always." },
  "Tumbril Land Systems": { color: "#c62828", specialties: ["Vehicles", "Weapons"], tagline: "Ground Dominance" },
  Tumbril: { color: "#c62828", specialties: ["Vehicles", "Weapons"], tagline: "Ground Dominance" },
  "Klaus & Werner": { color: "#5c6bc0", specialties: ["Ship Weapons", "Turrets", "Components"], tagline: "Precision in Every Shot" },
  "Behring Applied Technology": { color: "#455a64", specialties: ["Weapons", "Components"], tagline: "Reliability When It Matters" },
  Behring: { color: "#455a64", specialties: ["Weapons", "Components"], tagline: "Reliability When It Matters" },
  "Gallenson Tactical Systems": { color: "#37474f", specialties: ["Weapons", "Armor"], tagline: "No Compromises" },
  Gallenson: { color: "#37474f", specialties: ["Weapons", "Armor"] },
  "Amon & Reese": { color: "#4db6ac", specialties: ["Ship Weapons", "Components"] },
  "Aopoa (Xi'an)": { color: "#7b1fa2", specialties: ["Ships", "Hoverbikes"], tagline: "Xi'an Craftsmanship" },
  Aopoa: { color: "#7b1fa2", specialties: ["Ships", "Hoverbikes"], tagline: "Xi'an Craftsmanship" },
  "Crusader Industries": { color: "#1565c0", specialties: ["Ships", "Components"], tagline: "Your Home in the Stars" },
  Crusader: { color: "#1565c0", specialties: ["Ships", "Components"], tagline: "Your Home in the Stars" },
}

function getMfrMeta(name: string) {
  return MFR_META[name] ?? { color: "#546e7a", specialties: [] }
}

function getSpecialtyIcon(specialty: string) {
  if (specialty === "Ships") return <RocketLaunch sx={{ fontSize: 11 }} />
  if (specialty === "Vehicles" || specialty === "Hoverbikes") return <DirectionsCar sx={{ fontSize: 11 }} />
  if (specialty === "Armor") return <Security sx={{ fontSize: 11 }} />
  if (specialty === "Weapons" || specialty.includes("Weapons")) return <Build sx={{ fontSize: 11 }} />
  if (specialty === "Components") return <Memory sx={{ fontSize: 11 }} />
  if (specialty === "Consumer" || specialty === "Tools" || specialty === "Equipment") return <ShoppingBag sx={{ fontSize: 11 }} />
  return null
}

export function WikiManufacturerList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetManufacturersQuery()
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (localStorage.getItem("wiki-mfr-view") as "grid" | "list") || "grid",
  )

  const go = (code: string) => navigate(`/wiki/manufacturers/${encodeURIComponent(code)}`)

  return (
    <StandardPageLayout
      title={t("wiki.manufacturers.title", "Manufacturers")}
      headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      skeleton={<CardGridSkeleton />}
      error={error || undefined}
    >
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {manufacturers ? `${manufacturers.length} ${t("wiki.manufacturerList.manufacturersCount", "manufacturers")}` : ""}
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => { if (v) { setViewMode(v); localStorage.setItem("wiki-mfr-view", v) } }}
          >
            <ToggleButton value="grid"><GridViewRounded fontSize="small" /></ToggleButton>
            <ToggleButton value="list"><ViewListRounded fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === "grid" ? (
          <Grid container spacing={2}>
            {manufacturers?.map((m) => {
              const displayName = m.display_name || m.manufacturer
              const meta = getMfrMeta(displayName)
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={m.manufacturer}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.15s",
                      "&:hover": { transform: "translateY(-2px)" },
                      height: "100%",
                      overflow: "hidden",
                    }}
                    onClick={() => go(m.manufacturer)}
                  >
                    {/* Manufacturer color accent */}
                    <Box sx={{ height: 3, bgcolor: meta.color }} />
                    <CardContent>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        {/* Logo placeholder with initials */}
                        <Box
                          sx={{
                            width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
                            bgcolor: `${meta.color}22`, border: `1px solid ${meta.color}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: meta.color, fontSize: "0.65rem", letterSpacing: "0.02em" }}
                          >
                            {displayName.split(" ").map((w: string) => w[0]).slice(0, 3).join("")}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {displayName}
                          </Typography>
                          {meta.tagline && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                              {meta.tagline}
                            </Typography>
                          )}
                          <Chip
                            label={`${m.item_count} ${t("wiki.manufacturerList.items", "items")}`}
                            size="small"
                            sx={{
                              mt: 0.75, height: 18, fontSize: "0.65rem",
                              bgcolor: `${meta.color}22`, color: meta.color,
                            }}
                          />
                        </Box>
                      </Stack>
                      {meta.specialties.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                          {meta.specialties.map((s) => (
                            <Chip
                              key={s}
                              icon={getSpecialtyIcon(s) || undefined}
                              label={s}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.6rem", "& .MuiChip-icon": { fontSize: 11 } }}
                            />
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        ) : (
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("wiki.manufacturerList.colManufacturer", "Manufacturer")}</TableCell>
                  <TableCell>{t("wiki.manufacturerList.colSpecialties", "Specialties")}</TableCell>
                  <TableCell align="right">{t("wiki.manufacturerList.colItems", "Items")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manufacturers?.map((m) => {
                  const displayName = m.display_name || m.manufacturer
                  const meta = getMfrMeta(displayName)
                  return (
                    <TableRow key={m.manufacturer} hover sx={{ cursor: "pointer" }} onClick={() => go(m.manufacturer)}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 4, height: 28, borderRadius: 1, bgcolor: meta.color, flexShrink: 0 }} />
                          <Typography variant="body2" fontWeight={600}>{displayName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {meta.specialties.map((s) => (
                            <Chip key={s} label={s} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{m.item_count}</Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
