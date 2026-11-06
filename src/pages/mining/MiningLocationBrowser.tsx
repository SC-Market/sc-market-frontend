import React, { useState, useEffect, useMemo } from "react"
import {
  Grid,
  Alert,
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { inAppClick } from "../../components/links/inAppClick"
import {
  Link as RouterLink,
  useSearchParams,
  useNavigate,
  useParams,
} from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import {
  useSearchLocationsQuery,
  type LocationSearchResult,
} from "../../store/api/v2/market"
import { MiningLocationDetailModal } from "./MiningLocationDetailModal"
import {
  UnifiedSearchBar,
  locationTokensToParams,
  locationParamsToTokens,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { useHoverPrefetch } from "../../hooks/prefetch/useHoverPrefetch"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { useUrlPagination } from "../../components/pagination/useUrlPagination"
import { MINING_LOCATION_PAGE_SIZE } from "./constants"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const PAGE_SIZE = MINING_LOCATION_PAGE_SIZE
const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

import {
  RocketLaunchRounded,
  DirectionsCarRounded,
  PanToolRounded,
} from "@mui/icons-material"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { blue, green, orange } from "@mui/material/colors"
import { TagChip } from "../../components/tags/TagChip"

// The API sends English display names for mining groups and location types;
// translate the known ones, show anything else as sent.
const GROUP_NAME_KEYS: Record<string, string> = {
  "Ship Mining": "wikiUi.search.methods.ship",
  "Ground Vehicle Mining (ROC)": "gameTaxonomyUi.miningGroups.groundVehicle",
  "Hand Mining (FPS)": "wikiUi.search.methods.fps",
}
const LOCATION_TYPE_KEYS: Record<string, string> = {
  Surface: "wikiUi.search.locationTypes.surface",
  "Asteroid Field": "wikiUi.search.locationTypes.asteroidField",
}
function apiLabel(
  keys: Record<string, string>,
  value: string,
  t: TFunction,
): string {
  const key = keys[value]
  return key ? t(key) : value
}

function GroupIcon({ groupName }: { groupName: string }) {
  const g = (groupName || "").toLowerCase()
  const sx = { fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }
  if (g.includes("ship"))
    return <RocketLaunchRounded sx={{ ...sx, color: blue[500] }} />
  if (g.includes("ground"))
    return <DirectionsCarRounded sx={{ ...sx, color: orange[500] }} />
  if (g.includes("fps") || g.includes("hand"))
    return <PanToolRounded sx={{ ...sx, color: green[500] }} />
  return null
}

export function MiningLocationBrowser() {
  const { t } = useTranslation()
  const isMobile = useBreakpointDown("lg")
  const navigate = useNavigate()
  const urlParams = useParams<{ name?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const { page, pageSize, pagination } = useUrlPagination({
    path: GAME_DATA_PATHS.miningLocations,
    defaultPageSize: PAGE_SIZE,
    replace: true,
  })
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const searchTokens = useMemo(
    () => locationParamsToTokens(searchParams),
    [searchParams],
  )
  const queryParams = useMemo(
    () => locationTokensToParams(searchTokens),
    [searchTokens],
  )

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(locationTokensToParams(tokens))
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    if (urlParams.name && !isMobile) setSelectedLocation(urlParams.name)
  }, [urlParams.name, isMobile])

  const handleLocationClick = (locName: string) => {
    if (isMobile) {
      navigate(GAME_DATA_PATHS.miningLocation(locName))
    } else {
      setSelectedLocation(locName)
      window.history.replaceState(null, "", `/mining/locations/${locName}`)
    }
  }

  const handleModalClose = () => {
    setSelectedLocation(null)
    navigate(GAME_DATA_PATHS.miningLocations, { replace: true })
  }

  const {
    data,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useSearchLocationsQuery({
    text: queryParams.q || undefined,
    system: queryParams.system || undefined,
    locationType:
      (queryParams.location_type as "surface" | "asteroidfield" | undefined) ||
      undefined,
    page,
    pageSize,
  })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <UnifiedSearchBar
          tokens={searchTokens}
          onChange={handleTokensChange}
          mode="locations"
          placeholder={t("miningUi.locationBrowser.searchPlaceholder")}
        />
        {data && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {data.total}
          </Typography>
        )}
      </Box>

      {isLoading && <CardGridSkeleton />}
      {error && (
        <Alert severity="error">
          {t("gameTaxonomyUi.locationsLoadFailed")}
        </Alert>
      )}
      {data && (
        <>
          <Grid container spacing={1.5}>
            {data.locations.map((loc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={loc.name}>
                <LocationCard
                  location={loc}
                  onClick={() => handleLocationClick(loc.name)}
                />
              </Grid>
            ))}
          </Grid>
          {data.locations.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <Typography color="text.secondary">
                {t("mining.noLocations", "No locations found.")}
              </Typography>
            </Box>
          )}
          <NumberedPagination
            count={data.total}
            {...pagination}
            sx={{ mt: 2 }}
          />
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

function LocationCard({
  location,
  onClick,
}: {
  location: LocationSearchResult
  onClick: () => void
}) {
  const displayName = location.displayName || friendlyName(location.name)
  const systemDisplay = location.system || ""
  const { t } = useTranslation()
  const { onMouseEnter, onMouseLeave } = useHoverPrefetch(
    "/mining/locations/:name",
    GAME_DATA_PATHS.miningLocation(location.name),
  )

  // topOres is string[] from the search endpoint

  return (
    <Card
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardActionArea
        component={RouterLink}
        to={GAME_DATA_PATHS.miningLocation(location.name)}
        onClick={inAppClick(onClick)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        <CardContent sx={{ p: 1.5, flex: 1, "&:last-child": { pb: 1.5 } }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ my: 0.5 }}
          >
            {systemDisplay && (
              <TagChip
                tag="location"
                label={systemDisplay}
                sx={{ ...microChip, fontWeight: 600 }}
              />
            )}
            {location.locationType && (
              <TagChip
                tag="category"
                label={apiLabel(LOCATION_TYPE_KEYS, location.locationType, t)}
                sx={microChip}
              />
            )}
            {location.hasRefinery && (
              <TagChip
                tag="trait"
                label={t("miningUi.location.refinery")}
                sx={microChip}
              />
            )}
          </Stack>

          {(location.groups || []).map((g) => (
            <Box key={g.groupName} sx={{ mb: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ fontSize: "0.65rem" }}
              >
                <GroupIcon groupName={g.groupName} />
                {apiLabel(GROUP_NAME_KEYS, g.groupName, t)}
              </Typography>
              {(g.topOres || []).length > 0 ? (
                <Box>
                  {g.topOres.slice(0, 3).map((name: string, i: number) => (
                    <Typography
                      key={i}
                      variant="caption"
                      display="block"
                      sx={{ fontSize: "0.7rem", pl: 0.5 }}
                    >
                      {name}
                    </Typography>
                  ))}
                  {g.oreCount > 3 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.65rem", pl: 0.5 }}
                    >
                      {t("miningUi.locationBrowser.moreOres", {
                        count: g.oreCount - 3,
                      })}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ pl: 0.5 }}
                >
                  {t("miningUi.locationBrowser.oreCount", {
                    count: g.oreCount,
                  })}
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
