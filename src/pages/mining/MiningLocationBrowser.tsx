import React, { useState } from "react"
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
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { useSearchMiningLocationsQuery, type MiningLocationSearchResult } from "../../store/api/v2/mining"
import { useDebounce } from "../../hooks/useDebounce"
import { MiningLocationDetailModal } from "./MiningLocationDetailModal"

const PAGE_SIZE = 24

export function MiningLocationBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
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

  const { data, isLoading, error } = useSearchMiningLocationsQuery({
    text: debouncedSearch || undefined,
    system: system || undefined,
    location_type: locationType || undefined,
    page,
    page_size: PAGE_SIZE,
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
                <Grid item xs={12} sm={6} md={4} lg={3} key={loc.location_name}>
                  <LocationCard location={loc} onClick={() => setSelectedLocation(loc.location_name)} />
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
        onClose={() => setSelectedLocation(null)}
      />
    </>
  )
}

const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

function groupLabel(groupName: string): string {
  if (groupName.toLowerCase().includes("spaceship") || groupName.toLowerCase().includes("ship")) return "Ship"
  if (groupName.toLowerCase().includes("ground")) return "Ground"
  if (groupName.toLowerCase().includes("fps")) return "FPS"
  return groupName
}

function LocationCard({ location, onClick }: { location: MiningLocationSearchResult; onClick: () => void }) {
  const groupSummary = location.groups
    .map((g) => `${g.ore_count} ${groupLabel(g.group_name)}`)
    .join(", ")

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="body2" fontWeight={600} noWrap>{location.location_name}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ my: 0.5 }}>
            <Chip label={location.system} size="small" color="primary" sx={microChip} />
            <Chip label={location.location_type} size="small" variant="outlined" sx={microChip} />
            {location.has_refinery && <Chip label="Refinery" size="small" color="success" sx={microChip} />}
          </Stack>
          <Typography variant="caption" color="text.secondary">{groupSummary}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
