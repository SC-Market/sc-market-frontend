import React, { useState, useEffect, useMemo } from "react"
import {
  Grid,
  Pagination,
  Alert,
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  useMediaQuery,
} from "@mui/material"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useSearchLocationsQuery, type LocationSearchResult } from "../../store/api/v2/market"
import { MiningLocationDetailModal } from "./MiningLocationDetailModal"
import { UnifiedSearchBar, locationTokensToParams, locationParamsToTokens, type SearchToken } from "../../components/game-data/UnifiedSearchBar"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const PAGE_SIZE = 24
const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

import { RocketLaunchRounded, DirectionsCarRounded, PanToolRounded } from "@mui/icons-material"

function groupLabel(groupName: string): string {
  const g = (groupName || "").toLowerCase()
  if (g.includes("ship")) return "Ship Mining"
  if (g.includes("ground")) return "Ground Vehicle"
  if (g.includes("fps") || g.includes("hand")) return "Hand Mining"
  return groupName || "Unknown"
}

function GroupIcon({ groupName }: { groupName: string }) {
  const g = (groupName || "").toLowerCase()
  const sx = { fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }
  if (g.includes("ship")) return <RocketLaunchRounded sx={{ ...sx, color: "#2196f3" }} />
  if (g.includes("ground")) return <DirectionsCarRounded sx={{ ...sx, color: "#ff9800" }} />
  if (g.includes("fps") || g.includes("hand")) return <PanToolRounded sx={{ ...sx, color: "#4caf50" }} />
  return null
}

export function MiningLocationBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const urlParams = useParams<{ name?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get("page") || "1") || 1
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const searchTokens = useMemo(() => locationParamsToTokens(searchParams), [searchParams])
  const queryParams = useMemo(() => locationTokensToParams(searchTokens), [searchTokens])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(locationTokensToParams(tokens))
    setSearchParams(params, { replace: true })
  }

  const handlePageChange = (_: unknown, p: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    if (urlParams.name && !isMobile) setSelectedLocation(urlParams.name)
  }, [urlParams.name, isMobile])

  const handleLocationClick = (locName: string) => {
    if (isMobile) {
      navigate(`/mining/locations/${locName}`)
    } else {
      setSelectedLocation(locName)
      window.history.replaceState(null, "", `/mining/locations/${locName}`)
    }
  }

  const handleModalClose = () => {
    setSelectedLocation(null)
    navigate("/mining/locations", { replace: true })
  }

  const { data, isLoading, error } = useSearchLocationsQuery({
    text: queryParams.q || undefined,
    system: queryParams.system || undefined,
    locationType: (queryParams.location_type as "surface" | "asteroidfield" | undefined) || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <UnifiedSearchBar
          tokens={searchTokens}
          onChange={handleTokensChange}
          mode="locations"
          placeholder="Search locations, systems, types..."
        />
        {data && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {data.total}
          </Typography>
        )}
      </Box>

      {isLoading && <CardGridSkeleton />}
        {error && <Alert severity="error">{t("mining.error", "Failed to load locations.")}</Alert>}
        {data && (
          <>
            <Grid container spacing={1.5}>
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
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
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

  // topOres is string[] from the search endpoint
  const hasTopOres = (location.groups || []).some((g) => (g.topOres || []).length > 0)

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, flex: 1, "&:last-child": { pb: 1.5 } }}>
          <Typography variant="body2" fontWeight={600} noWrap>{displayName}</Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ my: 0.5 }}>
            {systemDisplay && (
              <Chip label={systemDisplay} size="small"
                sx={{ ...microChip, bgcolor: systemChipColor(systemDisplay) + "22", color: systemChipColor(systemDisplay), fontWeight: 600 }} />
            )}
            {location.locationType && <Chip label={location.locationType} size="small" variant="outlined" sx={microChip} />}
            {location.hasRefinery && <Chip label="Refinery" size="small" color="success" sx={microChip} />}
          </Stack>

          {(location.groups || []).map((g) => (
            <Box key={g.groupName} sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.65rem" }}><GroupIcon groupName={g.groupName} />{g.groupName}</Typography>
              {(g.topOres || []).length > 0 ? (
                <Box>
                  {g.topOres.slice(0, 3).map((name: string, i: number) => (
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
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
