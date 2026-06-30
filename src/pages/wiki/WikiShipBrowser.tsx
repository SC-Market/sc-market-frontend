/**
 * Wiki Ship Browser — unified ships + ground vehicles + hoverbikes
 *
 * Category inferred from ship_code prefix:
 *   grin_ / tmbl_ / rsi_ursa / rsi_lynx → Ground Vehicle
 *   xian_nox / orig_x1 / drak_dragonfly  → Hoverbike
 *   everything else                       → Ship
 */

import React, { useMemo, useCallback, useState } from "react"
import {
  Box, Card, CardContent, Grid, Typography, Pagination, Alert, Chip, Stack,
  Divider, Tooltip, useMediaQuery, Button,
} from "@mui/material"
import type { SxProps } from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler"
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch"
import AppsIcon from "@mui/icons-material/Apps"
import GroupsIcon from "@mui/icons-material/Groups"
import StraightenIcon from "@mui/icons-material/Straighten"
import SearchIcon from "@mui/icons-material/Search"
import { useTheme, alpha } from "@mui/material/styles"
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

const GROUND_PREFIXES   = ["grin_", "tmbl_", "rsi_ursa", "rsi_lynx"]
const HOVERBIKE_PREFIXES = ["xian_nox", "orig_x1", "drak_dragonfly"]

function getVehicleCategory(ship: WikiShipSearchResult): "ship" | "ground" | "hoverbike" {
  const code = ship.ship_code?.toLowerCase() ?? ""
  if (HOVERBIKE_PREFIXES.some((p) => code.startsWith(p))) return "hoverbike"
  if (GROUND_PREFIXES.some((p) => code.startsWith(p))) return "ground"
  return "ship"
}

// Maps career string → accent color hex
const CAREER_PILL_COLORS: Record<string, string> = {
  combat:      "#ef5350",
  exploration: "#5c6bc0",
  industrial:  "#ffa726",
  support:     "#26a69a",
  transporter: "#ab47bc",
  transport:   "#ab47bc",
  competition: "#26c6da",
  multirole:   "#78909c",
}

function getCareerPillColor(career: string): string {
  return CAREER_PILL_COLORS[career.toLowerCase()] ?? "#78909c"
}

// ─── Section divider with count badge ───────────────────────────────────────
function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ my: 1.5 }}>
      <Typography
        variant="overline"
        sx={{
          whiteSpace: "nowrap",
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          color: "text.disabled",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Chip
        label={count}
        size="small"
        sx={{
          height: 16,
          fontSize: "0.6rem",
          bgcolor: "rgba(255,255,255,0.07)",
          color: "text.disabled",
          "& .MuiChip-label": { px: 0.75 },
        }}
      />
      <Divider sx={{ flex: 1 }} />
    </Stack>
  )
}

// ─── Vehicle card ────────────────────────────────────────────────────────────
function VehicleCard({ ship, onClick }: { ship: WikiShipSearchResult; onClick: () => void }) {
  const vehicleCategory = getVehicleCategory(ship)
  const careerColor = getShipColor(ship.career, ship.role, ship.focus)
  const chipColor = getShipRoleColor(ship.career, ship.role, ship.focus)

  return (
    <Card
      sx={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
        "--career-color": careerColor,
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: careerColor,
          boxShadow: `0 6px 24px rgba(0,0,0,0.5), 0 0 0 1px ${careerColor}`,
        },
      } as SxProps<ExtendedTheme>}
      onClick={onClick}
    >
      {/* Career accent bar */}
      <Box sx={{ height: 2, bgcolor: careerColor, flexShrink: 0 }} />

      {/* Silhouette */}
      <Box
        sx={{
          height: 150,
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          // Radial glow at bottom
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "55%",
            background: `radial-gradient(ellipse at bottom, ${careerColor}, transparent 70%)`,
            opacity: 0.2,
            pointerEvents: "none",
          },
        }}
      >
        {/* Type badge for ground/hoverbike */}
        {vehicleCategory !== "ship" && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              px: 0.75,
              py: 0.3,
              borderRadius: 1,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              ...(vehicleCategory === "ground"
                ? { bgcolor: "rgba(255,167,38,0.18)", color: "#ffa726", border: "1px solid rgba(255,167,38,0.35)" }
                : { bgcolor: "rgba(171,71,188,0.18)", color: "#ce93d8", border: "1px solid rgba(171,71,188,0.35)" }
              ),
            }}
          >
            {vehicleCategory === "ground"
              ? <DirectionsCarIcon sx={{ fontSize: 10 }} />
              : <TwoWheelerIcon sx={{ fontSize: 10 }} />
            }
            {vehicleCategory === "ground" ? "Ground" : "Hoverbike"}
          </Box>
        )}

        {/* Size badge */}
        {ship.size && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 1,
              px: 0.6,
              py: 0.2,
              borderRadius: 0.75,
              fontSize: "0.58rem",
              bgcolor: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "text.disabled",
            }}
          >
            S{ship.size}
          </Box>
        )}

        {ship.ship_code ? (
          <ShipSilhouette
            shipCode={ship.ship_code}
            career={ship.career}
            role={ship.role}
            focus={ship.focus}
            height={135}
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

      {/* Card info */}
      <CardContent sx={{ flex: 1, p: 1.25, "&:last-child": { pb: 1.25 } }}>
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          title={ship.name}
          sx={{ color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.2, mb: 0.25 }}
        >
          {ship.name}
        </Typography>

        {ship.manufacturer && (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontSize: "0.62rem", display: "block", mb: 0.5, lineHeight: 1.2 }}
            noWrap
          >
            {ship.manufacturer}
          </Typography>
        )}

        <Stack direction="row" spacing={0.4} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          {ship.career && (
            <Chip
              label={formatShipCareer(ship.career)}
              size="small"
              color={chipColor}
              variant="outlined"
              sx={{ height: 16, fontSize: "0.58rem", "& .MuiChip-label": { px: 0.75 } }}
            />
          )}
          {ship.role && (
            <Chip
              label={formatShipRole(ship.role)}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                bgcolor: "rgba(255,255,255,0.04)",
                color: "text.disabled",
                border: "1px solid rgba(255,255,255,0.10)",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
          {ship.focus && !ship.career && !ship.role && (
            <Chip
              label={ship.focus}
              size="small"
              sx={{ height: 16, fontSize: "0.58rem", "& .MuiChip-label": { px: 0.75 } }}
            />
          )}
        </Stack>

        {(ship.crew_size != null || ship.length_m != null) && (
          <Stack direction="row" spacing={1} alignItems="center">
            {ship.crew_size != null && (
              <Tooltip title="Crew" arrow>
                <Stack direction="row" spacing={0.3} alignItems="center">
                  <GroupsIcon sx={{ fontSize: 11, color: "text.disabled", opacity: 0.6 }} />
                  <Typography sx={{ fontSize: "0.62rem", color: "text.disabled" }}>{ship.crew_size}</Typography>
                </Stack>
              </Tooltip>
            )}
            {ship.length_m != null && (
              <Tooltip
                title={`${ship.length_m}m${ship.width_m ? ` × ${ship.width_m}m` : ""}${ship.height_m ? ` × ${ship.height_m}m` : ""}`}
                arrow
              >
                <Stack direction="row" spacing={0.3} alignItems="center">
                  <StraightenIcon sx={{ fontSize: 11, color: "text.disabled", opacity: 0.6 }} />
                  <Typography sx={{ fontSize: "0.62rem", color: "text.disabled" }}>{ship.length_m}m</Typography>
                </Stack>
              </Tooltip>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function WikiShipBrowser() {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [searchParams, setSearchParams] = useSearchParams()
  const urlParams = useParams<{ id?: string }>()

  const page      = Number(searchParams.get("page")) || 1
  const manufacturer = searchParams.get("manufacturer") || ""
  const career    = searchParams.get("career") || ""
  const role      = searchParams.get("role") || ""
  const size      = searchParams.get("size") || ""
  const category  = (searchParams.get("category") as VehicleCategory) || "all"

  const searchTokens = useMemo(() => shipsParamsToTokens(searchParams), [searchParams])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(shipsTokensToParams(tokens))
    if (category !== "all") params.set("category", category)
    if (manufacturer) params.set("manufacturer", manufacturer)
    if (career) params.set("career", career)
    if (role) params.set("role", role)
    if (size) params.set("size", size)
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

  const [selectedShipId, setSelectedShipId] = useState<string | null>(null)

  React.useEffect(() => {
    if (urlParams.id && !isMobile) setSelectedShipId(urlParams.id)
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
    () => [...new Set(allVehicles.map((s) => s.size).filter(Boolean))].sort((a, b) => Number(a) - Number(b)) as string[],
    [allVehicles],
  )

  const counts = useMemo(() => ({
    all:      allVehicles.length,
    ships:    allVehicles.filter((s) => getVehicleCategory(s) === "ship").length,
    ground:   allVehicles.filter((s) => getVehicleCategory(s) === "ground").length,
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
    if (role) result = result.filter((s) =>
      s.role?.toLowerCase().replace(/[^a-z]/g, "") === role.toLowerCase().replace(/[^a-z]/g, ""),
    )
    if (size) result = result.filter((s) => String(s.size) === size)
    const textTokens = searchTokens.filter((t) => t.type === "query")
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

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Section groupings (only in "all" category view)
  const sections = useMemo(() => {
    if (category !== "all") return null
    return {
      ships:     pageItems.filter((s) => getVehicleCategory(s) === "ship"),
      ground:    pageItems.filter((s) => getVehicleCategory(s) === "ground"),
      hoverbike: pageItems.filter((s) => getVehicleCategory(s) === "hoverbike"),
    }
  }, [category, pageItems])

  // Filtered section counts (for section headers)
  const filteredCounts = useMemo(() => {
    if (category !== "all") return null
    return {
      ships:     filtered.filter((s) => getVehicleCategory(s) === "ship").length,
      ground:    filtered.filter((s) => getVehicleCategory(s) === "ground").length,
      hoverbike: filtered.filter((s) => getVehicleCategory(s) === "hoverbike").length,
    }
  }, [category, filtered])

  const handleShipClick = (shipCode: string | undefined, id: string) => {
    const slug = shipCode || id
    if (isMobile) {
      navigate(`/wiki/ships/${slug}`)
    } else {
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
      navigate(`/wiki/ships/${slug}${qs}`)
      setSelectedShipId(slug)
    }
  }

  // Active filter chips to show above the grid
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; key: string; value: string }> = []
    if (career)      chips.push({ label: `Career: ${formatShipCareer(career)}`, key: "career", value: "" })
    if (manufacturer) chips.push({ label: manufacturer, key: "manufacturer", value: "" })
    if (role)        chips.push({ label: formatShipRole(role), key: "role", value: "" })
    if (size)        chips.push({ label: `Size ${size}`, key: "size", value: "" })
    return chips
  }, [career, manufacturer, role, size])

  const hasFilters = !!(manufacturer || career || role || size || category !== "all")

  // ─── Sidebar filter content ───────────────────────────────────────────────
  const CATEGORY_OPTIONS = [
    { value: "all",      label: "All",             icon: <AppsIcon sx={{ fontSize: 16 }} />,           count: counts.all },
    { value: "ships",    label: "Ships",            icon: <RocketLaunchIcon sx={{ fontSize: 16 }} />,   count: counts.ships },
    { value: "ground",   label: "Ground Vehicles",  icon: <DirectionsCarIcon sx={{ fontSize: 16 }} />,  count: counts.ground },
    { value: "hoverbike", label: "Hoverbikes",      icon: <TwoWheelerIcon sx={{ fontSize: 16 }} />,     count: counts.hoverbike },
  ]

  const filtersContent = (
    <Stack spacing={2}>
      {/* Category */}
      <Box>
        <Typography
          sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", mb: 0.75, display: "block" }}
        >
          Category
        </Typography>
        <Stack spacing={0.25}>
          {CATEGORY_OPTIONS.map((opt) => {
            const isActive = category === opt.value
            return (
              <Box
                key={opt.value}
                component="button"
                onClick={() => updateParam("category", opt.value === "all" ? "" : opt.value)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.25,
                  py: 0.875,
                  borderRadius: 1.5,
                  border: "none",
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "inherit",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s, color 0.12s",
                  "&:hover": { bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : "rgba(255,255,255,0.06)" },
                }}
              >
                <Box sx={{ opacity: isActive ? 1 : 0.6, display: "flex", color: "inherit" }}>
                  {opt.icon}
                </Box>
                <Box sx={{ flex: 1 }}>{opt.label}</Box>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.68rem",
                    color: isActive ? "primary.main" : "text.disabled",
                    opacity: isActive ? 0.7 : 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {opt.count}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Career — color-coded pill buttons */}
      <Box>
        <Typography
          sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", mb: 0.75, display: "block" }}
        >
          Career
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
          {careers.map((c) => {
            const color = getCareerPillColor(c)
            const isActive = career.toLowerCase() === c.toLowerCase()
            return (
              <Box
                key={c}
                component="button"
                onClick={() => updateParam("career", isActive ? "" : c)}
                sx={{
                  px: 1,
                  py: 0.4,
                  borderRadius: 100,
                  border: `1px solid ${color}`,
                  bgcolor: isActive ? alpha(color, 0.15) : "transparent",
                  color: color,
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  fontFamily: "inherit",
                  fontWeight: isActive ? 700 : 400,
                  transition: "background 0.12s, font-weight 0.12s",
                  "&:hover": { bgcolor: alpha(color, 0.12) },
                }}
              >
                {formatShipCareer(c)}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Role select */}
      <Box>
        <Typography
          sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", mb: 0.75, display: "block" }}
        >
          Role
        </Typography>
        <Box
          component="select"
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("role", e.target.value)}
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: role ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: role ? "text.secondary" : "text.disabled",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{formatShipRole(r)}</option>)}
        </Box>
      </Box>

      {/* Manufacturer select */}
      <Box>
        <Typography
          sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", mb: 0.75, display: "block" }}
        >
          Manufacturer
        </Typography>
        <Box
          component="select"
          value={manufacturer}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("manufacturer", e.target.value)}
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: manufacturer ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: manufacturer ? "text.secondary" : "text.disabled",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">All manufacturers</option>
          {manufacturers.map((m) => <option key={m} value={m}>{m}</option>)}
        </Box>
      </Box>

      {/* Size select */}
      <Box>
        <Typography
          sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "text.disabled", mb: 0.75, display: "block" }}
        >
          Size
        </Typography>
        <Box
          component="select"
          value={size}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("size", e.target.value)}
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: size ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: size ? "text.secondary" : "text.disabled",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">Any size</option>
          {sizes.map((s) => <option key={s} value={s}>Size {s}</option>)}
        </Box>
      </Box>

      {hasFilters && (
        <Box
          component="button"
          onClick={() => setSearchParams({}, { replace: true })}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "transparent",
            color: "text.disabled",
            fontFamily: "inherit",
            fontSize: "0.72rem",
            py: 0.75,
            px: 1.5,
            cursor: "pointer",
            width: "100%",
            transition: "border-color 0.12s, color 0.12s",
            "&:hover": { borderColor: "text.disabled", color: "text.primary" },
          }}
        >
          ✕ Clear all filters
        </Box>
      )}
    </Stack>
  )

  function renderGrid(items: WikiShipSearchResult[]) {
    return (
      <Grid container spacing={1.25}>
        {items.map((vehicle) => (
          <Grid item xs={6} sm={4} md={3} key={vehicle.id}>
            <VehicleCard
              ship={vehicle}
              onClick={() => handleShipClick(vehicle.ship_code, vehicle.id)}
            />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <StandardPageLayout title="Ships & Vehicles" headerTitle="Ships & Vehicles" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters" sidebarWidth={220}>

          {/* Search bar + result count */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: activeFilterChips.length > 0 ? 1 : 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="ships"
              placeholder="Search ships, vehicles, manufacturers..."
            />
            {data && (
              <Typography variant="body2" sx={{ whiteSpace: "nowrap", color: "text.disabled", fontSize: "0.78rem" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
              {activeFilterChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  size="small"
                  onDelete={() => updateParam(chip.key, "")}
                  sx={{
                    height: 22,
                    fontSize: "0.68rem",
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    "& .MuiChip-deleteIcon": { color: "primary.main", opacity: 0.7, fontSize: 14 },
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              ))}
            </Box>
          )}

          {isLoading && <CardGridSkeleton />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load ships.</Alert>}

          {data && (
            <>
              {sections ? (
                <>
                  {sections.ships.length > 0 && (
                    <>
                      <SectionHeader label="Ships" count={filteredCounts!.ships} />
                      {renderGrid(sections.ships)}
                    </>
                  )}
                  {sections.ground.length > 0 && (
                    <>
                      <SectionHeader label="Ground Vehicles" count={filteredCounts!.ground} />
                      {renderGrid(sections.ground)}
                    </>
                  )}
                  {sections.hoverbike.length > 0 && (
                    <>
                      <SectionHeader label="Hoverbikes" count={filteredCounts!.hoverbike} />
                      {renderGrid(sections.hoverbike)}
                    </>
                  )}
                </>
              ) : (
                renderGrid(pageItems)
              )}

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <SearchIcon sx={{ fontSize: 40, color: "text.disabled", opacity: 0.3, mb: 1, display: "block", mx: "auto" }} />
                  <Typography color="text.disabled" variant="body2">No results found.</Typography>
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
          shipId={selectedShipId}
          open={!!selectedShipId && !isMobile}
          onClose={() => {
            setSelectedShipId(null)
            const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
            navigate(`/wiki/ships${qs}`)
          }}
        />
      </Grid>
    </StandardPageLayout>
  )
}
