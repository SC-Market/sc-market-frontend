/**
 * Wiki Ship Browser — unified ships + ground vehicles + hoverbikes
 *
 * Category inferred from ship_code prefix:
 *   grin_ / tmbl_ / rsi_ursa / rsi_lynx → Ground Vehicle
 *   xian_nox / orig_x1 / drak_dragonfly  → Hoverbike
 *   everything else                       → Ship
 */

import React, { useMemo, useCallback, useState } from "react"
import { Box, Grid, Typography, Alert } from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { Helmet } from "@unhead/react/helmet"
import SearchIcon from "@mui/icons-material/SearchRounded"
import { useTranslation } from "react-i18next"
import {
  useGetShipsQuery,
  type WikiShipSearchResult,
} from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { FRONTEND_URL } from "../../util/constants"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { SHIP_CARD_GRID } from "../../components/game-data/cardGrids"
import { ShipDetailModal } from "../../components/game-data/ShipDetailModal"
import {
  UnifiedSearchBar,
  shipsParamsToTokens,
  shipsTokensToParams,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import { formatShipRole, formatShipCareer } from "../../util/shipDisplay"
import { WIKI_PATHS } from "../../routes/paths"
import { wikiShipsSeoText } from "../../seo/hubHeads"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
  parsePageSize,
} from "../../components/pagination/NumberedPagination"
import { scrollPageToTop } from "../../components/layout/pageScroll"
import {
  VehicleCard,
  SectionHeader,
  getVehicleCategory,
  VehicleCategory,
} from "./WikiVehicleCard"
import { AllShipsIndex } from "./WikiAllShipsIndex"
import { ShipBrowserFilters } from "./WikiShipBrowserFilters"
import {
  ActiveFilterChips,
  useFilteredVehicles,
  useVehicleFacets,
} from "./WikiShipBrowserFacets"

const PAGE_SIZE = 24

export function WikiShipBrowser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useBreakpointDown("lg")

  const [searchParams, setSearchParams] = useSearchParams()
  const urlParams = useParams<{ id?: string }>()

  const page = Number(searchParams.get("page")) || 1
  const manufacturer = searchParams.get("manufacturer") || ""
  const career = searchParams.get("career") || ""
  const role = searchParams.get("role") || ""
  const size = searchParams.get("size") || ""
  const category = (searchParams.get("category") as VehicleCategory) || "all"

  const searchTokens = useMemo(
    () => shipsParamsToTokens(searchParams),
    [searchParams],
  )

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

  const {
    data,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useGetShipsQuery({ pageSize: 500 })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )
  const allVehicles = useMemo(() => data?.ships ?? [], [data?.ships])

  const { manufacturers, careers, roles, sizes, counts } =
    useVehicleFacets(allVehicles)

  const filtered = useFilteredVehicles(allVehicles, searchTokens, {
    category,
    manufacturer,
    career,
    role,
    size,
  })

  const pageSize = parsePageSize(
    searchParams.get("page_size"),
    CARD_GRID_PAGE_SIZE_OPTIONS,
    PAGE_SIZE,
  )
  const totalPages = Math.ceil(filtered.length / pageSize)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  // Section groupings (only in "all" category view)
  const sections = useMemo(() => {
    if (category !== "all") return null
    return {
      ships: pageItems.filter((s) => getVehicleCategory(s) === "ship"),
      ground: pageItems.filter((s) => getVehicleCategory(s) === "ground"),
      hoverbike: pageItems.filter((s) => getVehicleCategory(s) === "hoverbike"),
    }
  }, [category, pageItems])

  // Filtered section counts (for section headers)
  const filteredCounts = useMemo(() => {
    if (category !== "all") return null
    return {
      ships: filtered.filter((s) => getVehicleCategory(s) === "ship").length,
      ground: filtered.filter((s) => getVehicleCategory(s) === "ground").length,
      hoverbike: filtered.filter((s) => getVehicleCategory(s) === "hoverbike")
        .length,
    }
  }, [category, filtered])

  const handleShipClick = (shipCode: string | undefined, id: string) => {
    const slug = shipCode || id
    if (isMobile) {
      navigate(WIKI_PATHS.ship(slug))
    } else {
      const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""
      navigate(`${WIKI_PATHS.ship(slug)}${qs}`)
      setSelectedShipId(slug)
    }
  }

  // Active filter chips to show above the grid
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; key: string; value: string }> = []
    if (career)
      chips.push({
        label: `${t("wiki.shipBrowser.career", "Career")}: ${formatShipCareer(career, t)}`,
        key: "career",
        value: "",
      })
    if (manufacturer)
      chips.push({ label: manufacturer, key: "manufacturer", value: "" })
    if (role)
      chips.push({ label: formatShipRole(role, t), key: "role", value: "" })
    if (size)
      chips.push({
        label: `${t("wiki.shipBrowser.size", "Size")} ${size}`,
        key: "size",
        value: "",
      })
    return chips
  }, [career, manufacturer, role, size, t])

  const hasFilters = !!(
    manufacturer ||
    career ||
    role ||
    size ||
    category !== "all"
  )

  const { title: pageTitle, description: pageDescription } = useMemo(
    () => wikiShipsSeoText(manufacturer, filtered.length),
    [manufacturer, filtered.length],
  )

  const filtersContent = (
    <ShipBrowserFilters
      category={category}
      career={career}
      role={role}
      manufacturer={manufacturer}
      size={size}
      counts={counts}
      careers={careers}
      roles={roles}
      manufacturers={manufacturers}
      sizes={sizes}
      hasFilters={hasFilters}
      updateParam={updateParam}
      onClearAll={() => setSearchParams({}, { replace: true })}
    />
  )

  function renderGrid(items: WikiShipSearchResult[]) {
    return (
      <Grid container spacing={SHIP_CARD_GRID.spacing}>
        {items.map((vehicle) => (
          <Grid item {...SHIP_CARD_GRID.item} key={vehicle.id}>
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
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      headerTitle={t("wiki.shipBrowser.headerTitle", "Ships & Vehicles")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Helmet>
        {currentPage > 1 && (
          <link
            rel="prev"
            href={`${FRONTEND_URL}${WIKI_PATHS.ships}?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage - 1) })}`}
          />
        )}
        {currentPage < totalPages && (
          <link
            rel="next"
            href={`${FRONTEND_URL}${WIKI_PATHS.ships}?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage + 1) })}`}
          />
        )}
      </Helmet>
      <Grid item xs={12}>
        <FilterSidebarLayout
          filters={filtersContent}
          filterTitle={t("wiki.shipBrowser.filters", "Filters")}
          sidebarWidth={220}
        >
          {/* Search bar + result count */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              mb: activeFilterChips.length > 0 ? 1 : 2,
            }}
          >
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="ships"
              placeholder={t(
                "wiki.shipBrowser.searchPlaceholder",
                "Search ships, vehicles and manufacturers",
              )}
            />
            {data && (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  color: "text.primary",
                  fontSize: "0.78rem",
                }}
              >
                {t("wikiUi.resultCount", { count: filtered.length })}
              </Typography>
            )}
          </Box>

          {activeFilterChips.length > 0 && (
            <ActiveFilterChips
              chips={activeFilterChips}
              onRemove={(key) => updateParam(key, "")}
            />
          )}

          {isLoading && <CardGridSkeleton shape={SHIP_CARD_GRID} />}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("wiki.shipBrowser.failedToLoad", "Failed to load ships.")}
            </Alert>
          )}

          {data && (
            <>
              {sections ? (
                <>
                  {sections.ships.length > 0 && (
                    <>
                      <SectionHeader
                        label={t("wiki.shipBrowser.sectionShips", "Ships")}
                        count={filteredCounts!.ships}
                      />
                      {renderGrid(sections.ships)}
                    </>
                  )}
                  {sections.ground.length > 0 && (
                    <>
                      <SectionHeader
                        label={t(
                          "wiki.shipBrowser.sectionGround",
                          "Ground Vehicles",
                        )}
                        count={filteredCounts!.ground}
                      />
                      {renderGrid(sections.ground)}
                    </>
                  )}
                  {sections.hoverbike.length > 0 && (
                    <>
                      <SectionHeader
                        label={t(
                          "wiki.shipBrowser.sectionHoverbikes",
                          "Hoverbikes",
                        )}
                        count={filteredCounts!.hoverbike}
                      />
                      {renderGrid(sections.hoverbike)}
                    </>
                  )}
                </>
              ) : (
                renderGrid(pageItems)
              )}

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <SearchIcon
                    sx={{
                      fontSize: 40,
                      color: "text.disabled",
                      opacity: 0.3,
                      mb: 1,
                      display: "block",
                      mx: "auto",
                    }}
                  />
                  <Typography color="text.primary" variant="body2">
                    {t("wiki.shipBrowser.noResults", "No results found.")}
                  </Typography>
                </Box>
              )}

              {filtered.length > 0 && (
                <NumberedPagination
                  count={filtered.length}
                  page={currentPage - 1}
                  rowsPerPage={pageSize}
                  onPageChange={(newPage) => {
                    updateParam("page", newPage > 0 ? String(newPage + 1) : "")
                    scrollPageToTop()
                  }}
                  rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
                  onRowsPerPageChange={(size) =>
                    updateParam(
                      "page_size",
                      size === PAGE_SIZE ? "" : String(size),
                    )
                  }
                  link={{ path: WIKI_PATHS.ships, searchParams }}
                  sx={{ mt: 3 }}
                />
              )}

              {allVehicles.length > 0 && <AllShipsIndex ships={allVehicles} />}
            </>
          )}
        </FilterSidebarLayout>

        <ShipDetailModal
          shipId={selectedShipId}
          open={!!selectedShipId && !isMobile}
          onClose={() => {
            setSelectedShipId(null)
            const qs = searchParams.toString()
              ? `?${searchParams.toString()}`
              : ""
            navigate(`${WIKI_PATHS.ships}${qs}`)
          }}
        />
      </Grid>
    </StandardPageLayout>
  )
}
