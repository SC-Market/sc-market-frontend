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
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { MANUFACTURER_CARD_GRID } from "../../components/game-data/cardGrids"
import { WIKI_PATHS } from "../../routes/paths"
import { useLocalStorageState } from "../../hooks/storage/useLocalStorageState"
import { manufacturersSeoText } from "../../seo/hubHeads"
import {
  getMfrMeta,
  getSpecialtyIcon,
  SPECIALTY_KEYS,
} from "./wikiManufacturerMeta"

const VIEW_MODES = ["grid", "list"] as const

export function WikiManufacturerList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetManufacturersQuery()
  const [viewMode, setViewMode] = useLocalStorageState<"grid" | "list">(
    "wiki-mfr-view",
    "grid",
    VIEW_MODES,
  )

  const go = (code: string) =>
    navigate(WIKI_PATHS.manufacturer(encodeURIComponent(code)))

  return (
    <StandardPageLayout
      title={manufacturersSeoText(t).title}
      headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      skeleton={<CardGridSkeleton shape={MANUFACTURER_CARD_GRID} />}
      error={error || undefined}
    >
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {manufacturers
              ? t("gameTaxonomyUi.manufacturerCount", {
                  count: manufacturers.length,
                })
              : ""}
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => {
              if (v) setViewMode(v)
            }}
          >
            <ToggleButton
              value="grid"
              aria-label={t("ui.viewMode.grid", "Grid view")}
            >
              <GridViewRounded fontSize="small" />
            </ToggleButton>
            <ToggleButton
              value="list"
              aria-label={t("ui.viewMode.list", "List view")}
            >
              <ViewListRounded fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === "grid" ? (
          <Grid container spacing={MANUFACTURER_CARD_GRID.spacing}>
            {manufacturers?.map((m) => {
              const displayName = m.display_name || m.manufacturer
              const meta = getMfrMeta(displayName)
              return (
                <Grid
                  item
                  {...MANUFACTURER_CARD_GRID.item}
                  key={m.manufacturer}
                >
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
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        {/* Logo placeholder with initials */}
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            flexShrink: 0,
                            bgcolor: `${meta.color}22`,
                            border: `1px solid ${meta.color}44`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              color: meta.color,
                              fontSize: "0.65rem",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {displayName
                              .split(" ")
                              .map((w: string) => w[0])
                              .slice(0, 3)
                              .join("")}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            noWrap
                          >
                            {displayName}
                          </Typography>
                          {meta.tagline && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: "block" }}
                            >
                              {meta.tagline}
                            </Typography>
                          )}
                          <Chip
                            label={t("gameTaxonomyUi.itemCount", {
                              count: m.item_count,
                            })}
                            size="small"
                            sx={{
                              mt: 0.75,
                              height: 18,
                              fontSize: "0.65rem",
                              bgcolor: `${meta.color}22`,
                              color: meta.color,
                            }}
                          />
                        </Box>
                      </Stack>
                      {meta.specialties.length > 0 && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 1.5 }}
                        >
                          {meta.specialties.map((s) => (
                            <Chip
                              key={s}
                              icon={getSpecialtyIcon(s) || undefined}
                              label={t(
                                `gameTaxonomyUi.manufacturerSpecialties.${SPECIALTY_KEYS[s]}`,
                              )}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                "& .MuiChip-icon": { fontSize: 11 },
                              }}
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
                  <TableCell>
                    {t("wiki.manufacturerList.colManufacturer", "Manufacturer")}
                  </TableCell>
                  <TableCell>
                    {t("wiki.manufacturerList.colSpecialties", "Specialties")}
                  </TableCell>
                  <TableCell align="right">
                    {t("wiki.manufacturerList.colItems", "Items")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manufacturers?.map((m) => {
                  const displayName = m.display_name || m.manufacturer
                  const meta = getMfrMeta(displayName)
                  return (
                    <TableRow
                      key={m.manufacturer}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => go(m.manufacturer)}
                    >
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
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {meta.specialties.map((s) => (
                            <Chip
                              key={s}
                              label={t(
                                `gameTaxonomyUi.manufacturerSpecialties.${SPECIALTY_KEYS[s]}`,
                              )}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: "0.6rem" }}
                            />
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
