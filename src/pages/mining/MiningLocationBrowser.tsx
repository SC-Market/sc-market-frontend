import React, { useState, useEffect } from "react"
import {
  Grid,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  useMediaQuery,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { useSearchLocationsQuery, type LocationSearchResult } from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import { MiningLocationDetailModal } from "./MiningLocationDetailModal"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const PAGE_SIZE = 24
const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

function groupLabel(groupName: string): string {
  const g = (groupName || "").toLowerCase()
  if (g.includes("spaceship") || g.includes("ship")) return "Ship"
  if (g.includes("ground")) return "Ground"
  if (g.includes("fps")) return "FPS"
  return groupName || "Unknown"
}

export function MiningLocationBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const urlParams = useParams<{ name?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchText = searchParams.get("q") || ""
  const system = searchParams.get("system") || ""
  const locationType = searchParams.get("location_type") || ""
  const page = parseInt(searchParams.get("page") || "1") || 1

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== "page") params.delete("page")
    setSearchParams(params, { replace: true })
  }

  const debouncedSearch = useDebounce(searchText, 300)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  useEffect(() => {
    if (urlParams.name && !isMobile) setSelectedLocation(urlParams.name)
  }, [urlParams.name, isMobile])

  const handleLocationClick = (locName: string) => {
    const qs = searchParams.toString()
    navigate(`/mining/locations/${locName}${qs ? `?${qs}` : ""}`)
    if (!isMobile) setSelectedLocation(locName)
  }

  const handleModalClose = () => {
    setSelectedLocation(null)
    navigate(`/mining?tab=locations&${searchParams.toString()}`, { replace: true })
  }

  const { data, isLoading, error } = useSearchLocationsQuery({
    text: debouncedSearch || undefined,
    system: system || undefined,
    locationType: (locationType as any) || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField
        fullWidth size="small"
        placeholder={t("mining.searchLocations", "Search locations...")}
        value={searchText}
        onChange={(e) => updateParam("q", e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />
      <TextField
        select fullWidth size="small"
        label={t("mining.system", "System")}
        value={system}
        onChange={(e) => updateParam("system", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="stanton">Stanton</MenuItem>
        <MenuItem value="pyro">Pyro</MenuItem>
        <MenuItem value="nyx">Nyx</MenuItem>
      </TextField>
      <TextField
        select fullWidth size="small"
        label={t("mining.locationType", "Location Type")}
        value={locationType}
        onChange={(e) => updateParam("location_type", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="surface">Surface</MenuItem>
        <MenuItem value="asteroidfield">Asteroid Field</MenuItem>
      </TextField>
    </Stack>
  )

  return (
    <>
      <FilterSidebarLayout filters={filtersContent} filterTitle={t("mining.filters", "Filters")}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {error && <Alert severity="error">{t("mining.error", "Failed to load locations.")}</Alert>}
        {data && (
          <>
            <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
              {data.locations.map((loc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={loc.name}>
                  <LocationCard location={loc} onClick={() => handleLocationClick(loc.name)} />
                </Grid>
              ))}
            </Grid>
            {data.locations.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <Typography color="text.secondary">{t("mining.noLocations", "No locations found.")}</Typography>
              </Box>
            )}
            {data.total > PAGE_SIZE && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={Math.ceil(data.total / PAGE_SIZE)}
                  page={page}
                  onChange={(_, p) => updateParam("page", String(p))}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </FilterSidebarLayout>
      <MiningLocationDetailModal
        locationName={selectedLocation}
        open={!!selectedLocation}
        onClose={handleModalClose}
      />
    </>
  )
}

const SYSTEM_COLORS: Record<string, string> = {
  Stanton: "#00bcd4",
  Pyro: "#ff9800",
  Nyx: "#4caf50",
}

function systemChipColor(system: string): string {
  return SYSTEM_COLORS[system] || "#9e9e9e"
}

function LocationCard({ location, onClick }: { location: LocationSearchResult; onClick: () => void }) {
  const displayName = location.displayName || friendlyName(location.name)
  const systemDisplay = location.system || ""

  // Flatten all ores across groups, sorted by probability
  const allOres = (location.groups || [])
    .flatMap((g) => (g as any).ores || [])
  // If no ores array on groups (search endpoint), show group summary
  const hasOreDetail = allOres.length > 0
  const topOres = allOres.sort((a: any, b: any) => (b.relativeProbability || 0) - (a.relativeProbability || 0)).slice(0, 5)
  const moreCount = allOres.length - 5

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, flex: 1 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{displayName}</Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ my: 0.5 }}>
            {systemDisplay && (
              <Chip label={systemDisplay} size="small"
                sx={{ ...microChip, bgcolor: systemChipColor(systemDisplay) + "22", color: systemChipColor(systemDisplay), fontWeight: 600 }} />
            )}
            {location.locationType && <Chip label={location.locationType} size="small" variant="outlined" sx={microChip} />}
            {location.hasRefinery && <Chip label="Refinery" size="small" color="success" sx={microChip} />}
          </Stack>

          {hasOreDetail ? (
            <Box sx={{ mt: 0.5 }}>
              {topOres.map((ore: any, i: number) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.1 }}>
                  <Typography variant="caption" noWrap sx={{ flex: 1 }}>{ore.displayName || ore.elementName || ore.presetName}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ ml: 1, flexShrink: 0 }}>{(ore.relativeProbability || 0).toFixed(1)}%</Typography>
                </Box>
              ))}
              {moreCount > 0 && (
                <Typography variant="caption" color="text.secondary">+{moreCount} more</Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 0.5 }}>
              {(location.groups || []).map((g) => (
                <Box key={g.groupName} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.65rem" }}>{g.groupName}</Typography>
                  {(g.topOres || []).length > 0 ? (
                    <Box>
                      {g.topOres.slice(0, 3).map((name, i) => (
                        <Typography key={i} variant="caption" display="block" sx={{ fontSize: "0.7rem", pl: 0.5 }}>{name}</Typography>
                      ))}
                      {g.oreCount > 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", pl: 0.5 }}>+{g.oreCount - 3} more</Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>{g.oreCount} ores</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
