/**
 * Wiki Item Browser — unified search + filter sidebar
 * Sidebar: type, size, grade, manufacturer as clickable filter pills.
 * Main: UnifiedSearchBar (token-based) + card grid or table.
 */

import { useMemo, useCallback } from "react"
import {
  Box,
  Grid,
  Typography,
  Alert,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material"
import { Helmet } from "@unhead/react/helmet"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useSearchItemsQuery,
  useGetManufacturersQuery,
} from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { FRONTEND_URL } from "../../util/constants"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { WIKI_ITEM_CARD_GRID } from "../../components/game-data/cardGrids"
import {
  UnifiedSearchBar,
  wikiItemsTokensToParams,
  wikiItemsParamsToTokens,
  manufacturerSearchTokens,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import { WIKI_PATHS } from "../../routes/paths"
import { useLocalStorageState } from "../../hooks/storage/useLocalStorageState"
import { translateCategoryLabel } from "../../util/categoryDisplay"
import { wikiItemsSeoText } from "../../seo/hubHeads"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
} from "../../components/pagination/NumberedPagination"
import { useUrlPagination } from "../../components/pagination/useUrlPagination"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"

import { useFormatters } from "../../util/format"
import { FilterSection } from "./WikiItemFilterSection"
import { ItemGridCard, ItemListRow } from "./WikiItemCards"
const VIEW_MODES = ["grid", "list"] as const
const gridBreakpoints = WIKI_ITEM_CARD_GRID.item

// Common item types for the sidebar filter
const ITEM_TYPES = [
  "Weapon",
  "Armor",
  "Ship Weapon",
  "Shield",
  "Quantum Drive",
  "Power Plant",
  "Cooler",
  "Missile",
  "Mining Head",
  "Tool",
]
const SIZES = ["1", "2", "3", "4", "5", "6", "7", "8"]
const GRADES = ["A", "B", "C", "D"]

export function WikiItemBrowser() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const typeFilter = searchParams.get("type") || ""
  const sizeFilter = searchParams.get("size") || ""
  const gradeFilter = searchParams.get("grade") || ""

  const [viewMode, setViewMode] = useLocalStorageState<"grid" | "list">(
    "wiki-items-view",
    "grid",
    VIEW_MODES,
  )
  // The grid view shows 24 cards a page, the list view 30 rows.
  const { page, pageSize, pagination } = useUrlPagination({
    path: "/wiki/items",
    defaultPageSize: viewMode === "list" ? 30 : 24,
    pageSizeOptions:
      viewMode === "list" ? [15, 30, 60, 120] : CARD_GRID_PAGE_SIZE_OPTIONS,
    replace: true,
  })

  const searchTokens = useMemo(
    () => wikiItemsParamsToTokens(searchParams),
    [searchParams],
  )
  // Manufacturer suggestions: the name as the label, the code (what the
  // `manufacturer` filter takes) as the value.
  const { data: manufacturers } = useGetManufacturersQuery()
  const manufacturerOptions = useMemo(
    () => manufacturerSearchTokens(manufacturers),
    [manufacturers],
  )
  const queryParams = useMemo(
    () => wikiItemsTokensToParams(searchTokens),
    [searchTokens],
  )

  const updateParam = useCallback(
    (key: string, value: string) => {
      const p = new URLSearchParams(searchParams)
      if (value) p.set(key, value)
      else p.delete(key)
      p.delete("page")
      setSearchParams(p, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(wikiItemsTokensToParams(tokens))
    if (typeFilter) params.set("type", typeFilter)
    if (sizeFilter) params.set("size", sizeFilter)
    if (gradeFilter) params.set("grade", gradeFilter)
    setSearchParams(params, { replace: true })
  }

  const {
    data,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useSearchItemsQuery({
    text: queryParams.q || undefined,
    type: queryParams.type || typeFilter || undefined,
    size: sizeFilter || undefined,
    grade: gradeFilter || undefined,
    manufacturer: queryParams.manufacturer || undefined,
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

  const handleItemClick = (itemId: string) => navigate(WIKI_PATHS.item(itemId))

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0
  const hasFilters = !!(typeFilter || sizeFilter || gradeFilter)

  const { title: pageTitle, description: pageDescription } = useMemo(
    () => wikiItemsSeoText(typeFilter, data?.total),
    [typeFilter, data?.total],
  )

  const filtersContent = (
    <Stack spacing={2}>
      <FilterSection
        label={t("wiki.itemBrowser.filterType", "Type")}
        options={ITEM_TYPES.map((it) => ({
          value: it,
          label: translateCategoryLabel(it, t),
        }))}
        selected={typeFilter}
        onChange={(v) => updateParam("type", v)}
      />

      <Divider />

      <FilterSection
        label={t("wiki.itemBrowser.filterSize", "Size")}
        options={SIZES.map((s) => ({
          value: s,
          label: t("gameTaxonomyUi.sizeN", { size: s }),
        }))}
        selected={sizeFilter}
        onChange={(v) => updateParam("size", v)}
      />

      <Divider />

      <FilterSection
        label={t("wiki.itemBrowser.filterGrade", "Grade")}
        options={GRADES.map((g) => ({
          value: g,
          label: t("gameTaxonomyUi.gradeN", { grade: g }),
        }))}
        selected={gradeFilter}
        onChange={(v) => updateParam("grade", v)}
      />

      {hasFilters && (
        <Chip
          label={t("wiki.itemBrowser.clearFilters", "Clear filters")}
          size="small"
          variant="outlined"
          onClick={() => {
            const p = new URLSearchParams(searchParams)
            p.delete("type")
            p.delete("size")
            p.delete("grade")
            p.delete("page")
            setSearchParams(p, { replace: true })
          }}
          onDelete={() => {
            const p = new URLSearchParams(searchParams)
            p.delete("type")
            p.delete("size")
            p.delete("grade")
            p.delete("page")
            setSearchParams(p, { replace: true })
          }}
          sx={{ alignSelf: "flex-start" }}
        />
      )}
    </Stack>
  )

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      headerTitle={t("wiki.items.title", "Game Items Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Helmet>
        {page > 1 && (
          <link
            rel="prev"
            href={`${FRONTEND_URL}/wiki/items?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`}
          />
        )}
        {page < totalPages && (
          <link
            rel="next"
            href={`${FRONTEND_URL}/wiki/items?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`}
          />
        )}
      </Helmet>
      <Grid item xs={12}>
        <FilterSidebarLayout
          filters={filtersContent}
          filterTitle={t("wiki.itemBrowser.filters", "Filters")}
          sidebarWidth={190}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="wiki-items"
              extraOptions={manufacturerOptions}
              placeholder={t(
                "wiki.itemBrowser.searchPlaceholder",
                "Search items, types and manufacturers",
              )}
            />
            {data && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {fmt.number(data.total)}
              </Typography>
            )}
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

          {isLoading && <CardGridSkeleton shape={WIKI_ITEM_CARD_GRID} />}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("wiki.itemBrowser.loadError", "Failed to load items.")}
            </Alert>
          )}

          {data && (
            <>
              {viewMode === "grid" ? (
                <Grid container spacing={WIKI_ITEM_CARD_GRID.spacing}>
                  {data.items.map((item) => (
                    <Grid item {...gridBreakpoints} key={item.id}>
                      <ItemGridCard item={item} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 40 }} />
                        <TableCell>
                          {t("wiki.itemBrowser.columnName", "Name")}
                        </TableCell>
                        <TableCell>
                          {t("wiki.itemBrowser.columnType", "Type")}
                        </TableCell>
                        <TableCell>
                          {t("wiki.itemBrowser.columnSize", "Size")}
                        </TableCell>
                        <TableCell>
                          {t("wiki.itemBrowser.columnGrade", "Grade")}
                        </TableCell>
                        <TableCell>
                          {t(
                            "wiki.itemBrowser.columnManufacturer",
                            "Manufacturer",
                          )}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.items.map((item) => (
                        <ItemListRow
                          key={item.id}
                          item={item}
                          onClick={() => handleItemClick(item.id)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {data.items.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    {t(
                      "wiki.itemBrowser.noResults",
                      "No results found. Try adjusting your search.",
                    )}
                  </Typography>
                </Box>
              )}

              <NumberedPagination
                count={data?.total ?? 0}
                {...pagination}
                sx={{ mt: 3 }}
              />
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
