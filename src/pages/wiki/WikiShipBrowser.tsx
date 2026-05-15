/**
 * Wiki Ship Browser
 *
 * Fetches all ships in one request (pageSize=500), filters + paginates
 * entirely client-side so career/role/text filters work across the full set.
 */

import React, { useMemo, useCallback } from "react"
import {
  Box, Card, CardContent, Grid, Typography, TextField,
  MenuItem, Select, FormControl, InputLabel, Pagination, Alert, Chip, Stack,
  Tooltip,
} from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import StraightenIcon from "@mui/icons-material/Straighten"
import { useTheme } from "@mui/material/styles"
import { useGetShipsQuery } from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { ShipSilhouette, getShipColor } from "../../components/wiki/ShipSilhouette"

const PAGE_SIZE = 24

export function WikiShipBrowser() {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const text         = searchParams.get("q") || ""
  const manufacturer = searchParams.get("manufacturer") || ""
  const focus        = searchParams.get("focus") || ""
  const size         = searchParams.get("size") || ""
  const career       = searchParams.get("career") || ""
  const role         = searchParams.get("role") || ""
  const page         = Number(searchParams.get("page")) || 1

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    if (key !== "page") p.delete("page")
    setSearchParams(p, { replace: true })
  }, [searchParams, setSearchParams])

  // Fetch everything at once — all filtering is client-side
  const { data, isLoading, error } = useGetShipsQuery({ pageSize: 500 })

  const allShips = data?.ships || []

  // Derive filter option lists from full dataset
  const manufacturers = useMemo(() =>
    [...new Set(allShips.map(s => s.manufacturer).filter(Boolean))].sort() as string[],
    [allShips])
  const focuses = useMemo(() =>
    [...new Set(allShips.map(s => s.focus).filter(Boolean))].sort() as string[],
    [allShips])
  const sizes = useMemo(() =>
    [...new Set(allShips.map(s => s.size).filter(Boolean))].sort() as string[],
    [allShips])
  const careers = useMemo(() =>
    [...new Set(allShips.map(s => s.career).filter(Boolean))].sort() as string[],
    [allShips])
  const roles = useMemo(() =>
    [...new Set(allShips.map(s => s.role).filter(Boolean))].sort() as string[],
    [allShips])

  // All filters client-side over the full set
  const filtered = useMemo(() => {
    let result = allShips
    if (manufacturer) result = result.filter(s => s.manufacturer === manufacturer)
    if (focus)        result = result.filter(s => s.focus === focus)
    if (size)         result = result.filter(s => s.size === size)
    if (career)       result = result.filter(s => s.career === career)
    if (role)         result = result.filter(s => s.role === role)
    if (text) {
      const q = text.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.manufacturer?.toLowerCase().includes(q) ||
        s.career?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q)
      )
    }
    return result
  }, [allShips, manufacturer, focus, size, career, role, text])

  // Client-side pagination
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageShips   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField fullWidth size="small" label="Search ships" value={text}
        onChange={(e) => updateParam("q", e.target.value)}
        placeholder="Name or manufacturer..." />

      <FormControl fullWidth size="small">
        <InputLabel>Manufacturer</InputLabel>
        <Select value={manufacturer} label="Manufacturer"
          onChange={(e) => updateParam("manufacturer", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {manufacturers.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Focus</InputLabel>
        <Select value={focus} label="Focus"
          onChange={(e) => updateParam("focus", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {focuses.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Size</InputLabel>
        <Select value={size} label="Size"
          onChange={(e) => updateParam("size", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {sizes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      {careers.length > 0 && (
        <FormControl fullWidth size="small">
          <InputLabel>Career</InputLabel>
          <Select value={career} label="Career"
            onChange={(e) => updateParam("career", e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {careers.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      )}

      {roles.length > 0 && (
        <FormControl fullWidth size="small">
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role"
            onChange={(e) => updateParam("role", e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
      )}
    </Stack>
  )

  return (
    <StandardPageLayout title="Ships Database" headerTitle="Ships Database" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters">
          {isLoading && <CardGridSkeleton />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load ships.</Alert>}
          {data && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filtered.length} ship{filtered.length !== 1 ? "s" : ""}
                {filtered.length !== allShips.length && ` of ${allShips.length}`}
              </Typography>

              <Grid container spacing={1.5}>
                {pageShips.map((ship) => {
                  const color = getShipColor(ship.career, ship.role)
                  return (
                    <Grid item xs={6} sm={4} md={3} key={ship.id}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          transition: "transform 0.15s",
                          "&:hover": { transform: "translateY(-3px)" },
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                        onClick={() => navigate(`/wiki/ships/${ship.id}`)}
                      >
                        {/* Silhouette area */}
                        <Box
                          sx={{
                            height: 120,
                            bgcolor: "background.default",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              bgcolor: color,
                              opacity: 0.07,
                            },
                          }}
                        >
                          {ship.ship_code ? (
                            <ShipSilhouette
                              shipCode={ship.ship_code}
                              career={ship.career}
                              role={ship.role}
                              height={100}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={ship.image_url || FALLBACK_IMAGE_URL}
                              alt={ship.name}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flex: 1, p: 1.5, "&:last-child": { pb: 1.5 } }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {ship.name}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                            {ship.career && (
                              <Chip label={ship.career} size="small" color="secondary" variant="outlined"
                                sx={{ height: 20, fontSize: "0.65rem" }} />
                            )}
                            {ship.role && (
                              <Chip label={ship.role} size="small" color="primary"
                                sx={{ height: 20, fontSize: "0.65rem" }} />
                            )}
                            {ship.focus && !ship.role && (
                              <Chip label={ship.focus} size="small" color="primary"
                                sx={{ height: 20, fontSize: "0.65rem" }} />
                            )}
                            {ship.size && (
                              <Chip label={ship.size} size="small"
                                sx={{ height: 20, fontSize: "0.65rem" }} />
                            )}
                          </Stack>
                          {ship.manufacturer && (
                            <Typography variant="caption" color="text.secondary"
                              sx={{ mt: 0.5, display: "block" }}>
                              {ship.manufacturer}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                            {ship.crew_size != null && (
                              <Tooltip title="Crew size" arrow>
                                <Stack direction="row" spacing={0.25} alignItems="center">
                                  <GroupsIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {ship.crew_size}
                                  </Typography>
                                </Stack>
                              </Tooltip>
                            )}
                            {ship.length_m != null && (
                              <Tooltip title={`${ship.length_m}m${ship.width_m ? ` × ${ship.width_m}m` : ""}${ship.height_m ? ` × ${ship.height_m}m` : ""}`} arrow>
                                <Stack direction="row" spacing={0.25} alignItems="center">
                                  <StraightenIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {ship.length_m}m
                                  </Typography>
                                </Stack>
                              </Tooltip>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">No ships found.</Typography>
                </Box>
              )}

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, p) => updateParam("page", String(p))}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
