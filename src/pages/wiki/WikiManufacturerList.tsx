/**
 * Wiki Manufacturer List — grid of manufacturer cards with color accent lines,
 * specialty category chips, and item/ship counts.
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useGetManufacturersQuery } from "../../store/api/v2/market"
import {
  GridViewRounded, ViewListRounded, RocketLaunchRounded, DirectionsCarRounded,
  SecurityRounded, BuildRounded, MemoryRounded, ShoppingBagRounded,
} from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { WIKI_PATHS } from "../../routes/paths"
import { useLocalStorageState } from "../../hooks/storage/useLocalStorageState"
import { manufacturersSeoText } from "../../seo/hubHeads"
import {
  blue,
  blueGrey,
  cyan,
  green,
  indigo,
  orange,
  purple,
  red,
  teal,
} from "@mui/material/colors"

const VIEW_MODES = ["grid", "list"] as const

// Accent color + known specialty metadata per manufacturer code
const MFR_META: Record<string, { color: string; specialties: string[]; tagline?: string }> = {
  "Roberts Space Industries": { color: cyan[600], specialties: ["Ships", "Armor", "Weapons"], tagline: "From the Earth to the Stars" },
  RSI: { color: cyan[600], specialties: ["Ships", "Armor", "Weapons"], tagline: "From the Earth to the Stars" },
  "Aegis Dynamics": { color: blue[700], specialties: ["Ships", "Weapons", "Armor"], tagline: "Prepared for the Worst" },
  Aegis: { color: blue[700], specialties: ["Ships", "Weapons", "Armor"], tagline: "Prepared for the Worst" },
  "Drake Interplanetary": { color: red[600], specialties: ["Ships", "Weapons"], tagline: "What You Do Is Your Business" },
  Drake: { color: red[600], specialties: ["Ships", "Weapons"], tagline: "What You Do Is Your Business" },
  "Anvil Aerospace": { color: orange[600], specialties: ["Ships", "Weapons", "Armor"], tagline: "Built to Last" },
  Anvil: { color: orange[600], specialties: ["Ships", "Weapons", "Armor"], tagline: "Built to Last" },
  "Origin Jumpworks": { color: purple[700], specialties: ["Ships", "Consumer"], tagline: "Luxury Redefined" },
  Origin: { color: purple[700], specialties: ["Ships", "Consumer"], tagline: "Luxury Redefined" },
  MISC: { color: green[700], specialties: ["Ships", "Components"], tagline: "Today, Tomorrow, Together" },
  "Greycat Industrial": { color: blueGrey[600], specialties: ["Vehicles", "Tools", "Equipment"], tagline: "Industrial Grade. Always." },
  Greycat: { color: blueGrey[600], specialties: ["Vehicles", "Tools", "Equipment"], tagline: "Industrial Grade. Always." },
  "Tumbril Land Systems": { color: red[800], specialties: ["Vehicles", "Weapons"], tagline: "Ground Dominance" },
  Tumbril: { color: red[800], specialties: ["Vehicles", "Weapons"], tagline: "Ground Dominance" },
  "Klaus & Werner": { color: indigo[400], specialties: ["Ship Weapons", "Turrets", "Components"], tagline: "Precision in Every Shot" },
  "Behring Applied Technology": { color: blueGrey[700], specialties: ["Weapons", "Components"], tagline: "Reliability When It Matters" },
  Behring: { color: blueGrey[700], specialties: ["Weapons", "Components"], tagline: "Reliability When It Matters" },
  "Gallenson Tactical Systems": { color: blueGrey[800], specialties: ["Weapons", "Armor"], tagline: "No Compromises" },
  Gallenson: { color: blueGrey[800], specialties: ["Weapons", "Armor"] },
  "Amon & Reese": { color: teal[300], specialties: ["Ship Weapons", "Components"] },
  "Aopoa (Xi'an)": { color: purple[700], specialties: ["Ships", "Hoverbikes"], tagline: "Xi'an Craftsmanship" },
  Aopoa: { color: purple[700], specialties: ["Ships", "Hoverbikes"], tagline: "Xi'an Craftsmanship" },
  "Crusader Industries": { color: blue[800], specialties: ["Ships", "Components"], tagline: "Your Home in the Stars" },
  Crusader: { color: blue[800], specialties: ["Ships", "Components"], tagline: "Your Home in the Stars" },
}

function getMfrMeta(name: string) {
  return MFR_META[name] ?? { color: blueGrey[600], specialties: [] }
}

/** Specialty chip labels -> gameTaxonomyUi.manufacturerSpecialties keys */
const SPECIALTY_KEYS: Record<string, string> = {
  Ships: "ships",
  Armor: "armor",
  Weapons: "weapons",
  Consumer: "consumer",
  Components: "components",
  Vehicles: "vehicles",
  Tools: "tools",
  Equipment: "equipment",
  "Ship Weapons": "shipWeapons",
  Turrets: "turrets",
  Hoverbikes: "hoverbikes",
}

function getSpecialtyIcon(specialty: string) {
  if (specialty === "Ships") return <RocketLaunchRounded sx={{ fontSize: 11 }} />
  if (specialty === "Vehicles" || specialty === "Hoverbikes") return <DirectionsCarRounded sx={{ fontSize: 11 }} />
  if (specialty === "Armor") return <SecurityRounded sx={{ fontSize: 11 }} />
  if (specialty === "Weapons" || specialty.includes("Weapons")) return <BuildRounded sx={{ fontSize: 11 }} />
  if (specialty === "Components") return <MemoryRounded sx={{ fontSize: 11 }} />
  if (specialty === "Consumer" || specialty === "Tools" || specialty === "Equipment") return <ShoppingBagRounded sx={{ fontSize: 11 }} />
  return null
}

export function WikiManufacturerList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetManufacturersQuery()
  const [viewMode, setViewMode] = useLocalStorageState<"grid" | "list">(
    "wiki-mfr-view",
    "grid",
    VIEW_MODES,
  )

  const go = (code: string) => navigate(WIKI_PATHS.manufacturer(encodeURIComponent(code)))

  return (
    <StandardPageLayout
      title={manufacturersSeoText(t).title}
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
            {manufacturers ? t("gameTaxonomyUi.manufacturerCount", { count: manufacturers.length }) : ""}
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => { if (v) setViewMode(v) }}
          >
            <ToggleButton value="grid" aria-label={t("ui.viewMode.grid", "Grid view")}><GridViewRounded fontSize="small" /></ToggleButton>
            <ToggleButton value="list" aria-label={t("ui.viewMode.list", "List view")}><ViewListRounded fontSize="small" /></ToggleButton>
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
                    component={RouterLink}
                    to={WIKI_PATHS.manufacturer(
                      encodeURIComponent(m.manufacturer),
                    )}
                    sx={{
                      display: "block",
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "transform 0.15s",
                      "&:hover": { transform: "translateY(-2px)" },
                      height: "100%",
                      overflow: "hidden",
                    }}
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
                            label={t("gameTaxonomyUi.itemCount", { count: m.item_count })}
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
                              label={t(`gameTaxonomyUi.manufacturerSpecialties.${SPECIALTY_KEYS[s]}`)}
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
                          <Box
                            sx={{
                              width: 4,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: meta.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            component={RouterLink}
                            to={WIKI_PATHS.manufacturer(
                              encodeURIComponent(m.manufacturer),
                            )}
                            onClick={(event: React.MouseEvent) =>
                              event.stopPropagation()
                            }
                            sx={{ color: "inherit", textDecoration: "none" }}
                          >
                            {displayName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {meta.specialties.map((s) => (
                            <Chip key={s} label={t(`gameTaxonomyUi.manufacturerSpecialties.${SPECIALTY_KEYS[s]}`)} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
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
