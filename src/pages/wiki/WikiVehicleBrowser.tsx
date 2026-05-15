/**
 * Wiki Vehicle Browser — unified ships + ground vehicles + hoverbikes
 *
 * All three categories share a single card template with ShipSilhouette icons.
 * Category is inferred from ship_code prefix (grin_/tmbl_/rsi_ursa/rsi_lynx → ground,
 * xian_nox/orig_x1/drak_dragonfly → hoverbike, everything else → ship).
 * Desktop: filter sidebar + ShipDetailModal overlay. Mobile: bottom-sheet filters + navigate.
 */

import React, { useMemo, useCallback, useState } from "react"
import {
  Box, Card, CardContent, Grid, Typography, Pagination, Alert, Chip, Stack,
  ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem,
  Divider, Tooltip, useMediaQuery,
} from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler"
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch"
import AppsIcon from "@mui/icons-material/Apps"
import GroupsIcon from "@mui/icons-material/Groups"
import StraightenIcon from "@mui/icons-material/Straighten"
import { useTheme } from "@mui/material/styles"
import { useGetShipsQuery, type WikiShipSearchResult } from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { ShipSilhouette, getShipColor } from "../../components/wiki/ShipSilhouette"
import { ShipDetailModal } from "../../components/game-data/ShipDetailModal"
import {
  UnifiedSearchBar, shipsParamsToTokens, shipsTokensToParams, type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import { formatShipRole, formatShipCareer, getShipRoleColor } from "../../util/shipDisplay"

const PAGE_SIZE = 24

type VehicleCategory = "all" | "ships" | "ground" | "hoverbike"

const GROUND_PREFIXES = ["grin_", "tmbl_", "rsi_ursa", "rsi_lynx"]
const HOVERBIKE_PREFIXES = ["xian_nox", "orig_x1", "drak_dragonfly"]

function getVehicleCategory(ship: WikiShipSearchResult): "ship" | "ground" | "hoverbike" {
  const code = ship.ship_code?.toLowerCase() ?? ""
  if (HOVERBIKE_PREFIXES.some((p) => code.startsWith(p))) return "hoverbike"
  if (GROUND_PREFIXES.some((p) => code.startsWith(p))) return "ground"
  return "ship"
}

const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  all: "All Vehicles",
  ships: "Ships",
  ground: "Ground Vehicles",
  hoverbike: "Hoverbikes",
}

function SectionDivider({ label }: { label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ my: 1.5 }}>
      <Typography
        variant="overline"
        color="text.disabled"
        sx={{ whiteSpace: "nowrap", fontSize: "0.65rem", letterSpacing: "0.12em" }}
      >
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Stack>
  )
}

function VehicleCard({ ship, onClick }: { ship: WikiShipSearchResult; onClick: () => void }) {
  const vehicleCategory = getVehicleCategory(ship)
  const careerColor = getShipColor(ship.career, ship.role, ship.focus)
  const chipColor = getShipRoleColor(ship.career, ship.role, ship.focus)

  return (
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
      onClick={onClick}
    >
      {/* Career/type color accent line */}
      <Box sx={{ height: 3, bgcolor: careerColor }} />

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
            bgcolor: careerColor,
            opacity: 0.07,
          },
        }}
      >
        {/* Category badge — only for non-ship types */}
        {vehicleCategory !== "ship" && (
          <Chip
            icon={vehicleCategory === "ground" ? <DirectionsCarIcon /> : <TwoWheelerIcon />}
            label={vehicleCategory === "ground" ? "Ground" : "Hoverbike"}
            size="small"
            color={vehicleCategory === "ground" ? "warning" : "secondary"}
            sx={{
              position: "absolute", top: 6, left: 6, zIndex: 1,
              height: 20, fontSize: "0.6rem", fontWeight: 700,
              "& .MuiChip-icon": { fontSize: 12 },
            }}
          />
        )}
        {ship.size && (
          <Chip
            label={`S${ship.size}`}
            size="small"
            sx={{
              position: "absolute", top: 6, right: 6, zIndex: 1,
              height: 18, fontSize: "0.6rem",
              bgcolor: "rgba(0,0,0,0.45)", color: "text.secondary",
            }}
          />
        )}
        {ship.ship_code ? (
          <ShipSilhouette
            shipCode={ship.ship_code}
            career={ship.career}
            role={ship.role}
            focus={ship.focus}
            height={110}
          />
        ) : ship.image_url ? (
          <Box
            component="img"
            src={ship.image_url}
            alt={ship.name}
            sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1 }}
          />
        ) : null}
      </Box>

      <CardContent sx={{ flex: 1, p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight={700} noWrap title={ship.name}>
          {ship.name}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
          {ship.career && (
            <Chip
              label={formatShipCareer(ship.career)}
              size="small"
              color={chipColor}
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {ship.role && (
            <Chip
              label={formatShipRole(ship.role)}
              size="small"
              color={chipColor}
              sx={{ height: 18, fontSize: "0.6rem" }}
            />
          )}
          {ship.focus && !ship.career && !ship.role && (
            <Chip label={ship.focus} size="small" sx={{ height: 18, fontSize: "0.6rem" }} />
          )}
        </Stack>
        {ship.manufacturer && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, display: "block" }}>
            {ship.manufacturer}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
          {ship.crew_size != null && (
            <Tooltip title="Crew" arrow>
              <Stack direction="row" spacing={0.25} alignItems="center">
                <GroupsIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">{ship.crew_size}</Typography>
              </Stack>
            </Tooltip>
          )}
          {ship.length_m != null && (
            <Tooltip
              title={`${ship.length_m}m${ship.width_m ? ` × ${ship.width_m}m` : ""}${ship.height_m ? ` × ${ship.height_m}m` : ""}`}
              arrow
            >
              <Stack direction="row" spacing={0.25} alignItems="center">
                <StraightenIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">{ship.length_m}m</Typography>
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export function WikiVehicleBrowser() {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [searchParams, setSearchParams] = useSearchParams()
  const urlParams = useParams<{ id?: string }>()

  const page = Number(searchParams.get("page")) || 1
  const manufacturer = searchParams.get("manufacturer") || ""
  const career = searchParams.get("career") || ""
  const role = searchParams.get("role") || ""
  const size = searchParams.get("size") || ""
  const category = (searchParams.get("category") as VehicleCategory) || "all"

  const searchTokens = useMemo(() => shipsParamsToTokens(searchParams), [searchParams])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(shipsTokensToParams(tokens))
    if (category !== "all") params.set("category", category)
    setSearchParams(params, { replace: true })
  }

  const updateParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams)
      if (value) p.set(key, value)
      else p.delete(key)
      if (key !== "page") p.delete("page")
      setSearchParams(p, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)

  React.useEffect(() => {
    if (urlParams.id && !isMobile) setSelectedId(urlParams.id)
  }, [urlParams.id, isMobile])

  const { data, isLoading, error } = useGetShipsQuery({ pageSize: 500 })
  const allVehicles = data?.ships ?? []

  const manufacturers = useMemo(
    () => [...new Set(allVehicles.map((s) => s.manufacturer).filter(Boolean))].sort() as string[],
    [allVehicles],
  )
  const careers = useMemo(
    () => [...new Set(allVehicles.map((s) => s.career).filter(Boolean))].sort() as string[],
    [allVehicles],
  )
  const roles = useMemo(
    () => [...new Set(allVehicles.map((s) => s.role).filter(Boolean))].sort() as string[],
    [allVehicles],
  )
  const sizes = useMemo(
    () => [...new Set(allVehicles.map((s) => s.size).filter(Boolean))].sort() as string[],
    [allVehicles],
  )

  const counts = useMemo(() => ({
    all: allVehicles.length,
    ships: allVehicles.filter((s) => getVehicleCategory(s) === "ship").length,
    ground: allVehicles.filter((s) => getVehicleCategory(s) === "ground").length,
    hoverbike: allVehicles.filter((s) => getVehicleCategory(s) === "hoverbike").length,
  }), [allVehicles])

  const filtered = useMemo(() => {
    let result = allVehicles
    if (category !== "all") {
      result = result.filter((s) => {
        const cat = getVehicleCategory(s)
        return category === "ships" ? cat === "ship" : cat === category
      })
    }
    if (manufacturer) result = result.filter((s) => s.manufacturer === manufacturer)
    if (career) result = result.filter((s) => s.career?.toLowerCase() === career.toLowerCase())
    if (role) result = result.filter((s) => s.role?.toLowerCase().replace(/[^a-z]/g, "") === role.toLowerCase().replace(/[^a-z]/g, ""))
    if (size) result = result.filter((s) => String(s.size) === size)
    const textTokens = searchTokens.filter((t) => t.type === "text")
    for (const t of textTokens) {
      const q = t.value.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.manufacturer?.toLowerCase().includes(q) ||
          s.career?.toLowerCase().includes(q) ||
          formatShipRole(s.role).toLowerCase().includes(q),
      )
    }
    return result
  }, [allVehicles, category, manufacturer, career, role, size, searchTokens])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const sections = useMemo(() => {
    if (category !== "all") return null
    return {
      ships: pageItems.filter((s) => getVehicleCategory(s) === "ship"),
      ground: pageItems.filter((s) => getVehicleCategory(s) === "ground"),
      hoverbike: pageItems.filter((s) => getVehicleCategory(s) === "hoverbike"),
    }
  }, [category, pageItems])

  const handleVehicleClick = (shipCode: string | undefined, id: string) => {
    const slug = shipCode || id
    if (isMobile) {
      navigate(`/wiki/vehicles/${slug}`)
    } else {
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
      navigate(`/wiki/vehicles/${slug}${qs}`)
      setSelectedId(slug)
    }
  }

  const hasFilters = !!(manufacturer || career || role || size || category !== "all")

  const filtersContent = (
    <Stack spacing={2}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 0.5, display: "block" }}
        >
          Category
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          value={category}
          exclusive
          onChange={(_, v) => { if (v !== null) updateParam("category", v === "all" ? "" : v) }}
          fullWidth
          size="small"
        >
          <ToggleButton value="all" sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none", fontSize: "0.8rem" }}>
            <AppsIcon fontSize="small" />
            <span style={{ flex: 1 }}>All Vehicles</span>
            <Typography variant="caption" color="text.secondary">{counts.all}</Typography>
          </ToggleButton>
          <ToggleButton value="ships" sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none", fontSize: "0.8rem" }}>
            <RocketLaunchIcon fontSize="small" />
            <span style={{ flex: 1 }}>Ships</span>
            <Typography variant="caption" color="text.secondary">{counts.ships}</Typography>
          </ToggleButton>
          <ToggleButton value="ground" sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none", fontSize: "0.8rem" }}>
            <DirectionsCarIcon fontSize="small" />
            <span style={{ flex: 1 }}>Ground Vehicles</span>
            <Typography variant="caption" color="text.secondary">{counts.ground}</Typography>
          </ToggleButton>
          <ToggleButton value="hoverbike" sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none", fontSize: "0.8rem" }}>
            <TwoWheelerIcon fontSize="small" />
            <span style={{ flex: 1 }}>Hoverbikes</span>
            <Typography variant="caption" color="text.secondary">{counts.hoverbike}</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <FormControl fullWidth size="small">
        <InputLabel>Manufacturer</InputLabel>
        <Select value={manufacturer} label="Manufacturer" onChange={(e) => updateParam("manufacturer", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {manufacturers.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Career</InputLabel>
        <Select value={career} label="Career" onChange={(e) => updateParam("career", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {careers.map((c) => <MenuItem key={c} value={c}>{formatShipCareer(c)}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Role</InputLabel>
        <Select value={role} label="Role" onChange={(e) => updateParam("role", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {roles.map((r) => <MenuItem key={r} value={r}>{formatShipRole(r)}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Size</InputLabel>
        <Select value={size} label="Size" onChange={(e) => updateParam("size", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {sizes.map((s) => <MenuItem key={s} value={s}>Size {s}</MenuItem>)}
        </Select>
      </FormControl>

      {hasFilters && (
        <Chip
          label="Clear all filters"
          size="small"
          variant="outlined"
          onClick={() => setSearchParams({}, { replace: true })}
          onDelete={() => setSearchParams({}, { replace: true })}
          sx={{ alignSelf: "flex-start" }}
        />
      )}
    </Stack>
  )

  function renderGrid(items: WikiShipSearchResult[]) {
    return (
      <Grid container spacing={1.5}>
        {items.map((vehicle) => (
          <Grid item xs={6} sm={4} md={3} key={vehicle.id}>
            <VehicleCard
              ship={vehicle}
              onClick={() => handleVehicleClick(vehicle.ship_code, vehicle.id)}
            />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <StandardPageLayout title="Vehicles & Ships" headerTitle="Vehicles & Ships" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters" sidebarWidth={220}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="ships"
              placeholder="Search vehicles, manufacturers, careers..."
            />
            {data && (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          {isLoading && <CardGridSkeleton />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load vehicles.</Alert>}

          {data && (
            <>
              {sections ? (
                <>
                  {sections.ships.length > 0 && (
                    <>
                      <SectionDivider label={`Ships — ${counts.ships}`} />
                      {renderGrid(sections.ships)}
                    </>
                  )}
                  {sections.ground.length > 0 && (
                    <>
                      <SectionDivider label={`Ground Vehicles — ${counts.ground}`} />
                      {renderGrid(sections.ground)}
                    </>
                  )}
                  {sections.hoverbike.length > 0 && (
                    <>
                      <SectionDivider label={`Hoverbikes — ${counts.hoverbike}`} />
                      {renderGrid(sections.hoverbike)}
                    </>
                  )}
                </>
              ) : (
                renderGrid(pageItems)
              )}

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">No vehicles found.</Typography>
                </Box>
              )}

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, p) => {
                      updateParam("page", String(p))
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>

        <ShipDetailModal
          shipId={selectedId}
          open={!!selectedId && !isMobile}
          onClose={() => {
            setSelectedId(null)
            const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
            navigate(`/wiki/vehicles${qs}`)
          }}
        />
      </Grid>
    </StandardPageLayout>
  )
}
