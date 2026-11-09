/**
 * Comparison tables (/wiki/compare/:category): every ship component, FPS
 * weapon or armour piece of a category with the stats the game data has,
 * sortable and filterable, with live SC Market prices; pick 2-4 items to
 * see them side by side. All state is in the URL (compareTable.ts).
 *
 * Client-only (SPA route, neither prerendered nor server-rendered): the
 * table and its prices come from GET /game-data/wiki/compare/{category}.
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { CompareArrowsRounded } from "@mui/icons-material"
import type { GridPaginationModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import {
  Link as RouterLink,
  Navigate,
  useParams,
  useSearchParams,
} from "react-router-dom"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { TableSkeleton } from "../../../components/game-data/GameDataSkeletons"
import { useGetCompareTableQuery } from "../../../store/api/v2/market"
import { WIKI_PATHS } from "../../../routes/paths"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import {
  COMPARE_GROUPS,
  DEFAULT_COMPARE_CATEGORY,
  FILTER_FIELDS,
  MAX_COMPARE,
  MIN_COMPARE,
  filterOptions,
  filterRows,
  isCompareCategory,
  isSortKey,
  readCompareState,
  sortRows,
  toggleSelected,
  writeCompareState,
  type CompareSort,
  type CompareUrlState,
  type FilterField,
} from "./compareTable"
import { categoryLabel, filterLabel } from "./compareFormat"
import { CompareGrid, type CompareShownFields } from "./CompareGrid"
import { CompareCards } from "./CompareCards"
import { CompareDialog } from "./CompareDialog"

export function WikiComparePage() {
  const { category: param } = useParams<{ category?: string }>()
  if (param === undefined) {
    return (
      <Navigate to={WIKI_PATHS.compare(DEFAULT_COMPARE_CATEGORY)} replace />
    )
  }
  return <ComparePage param={param} />
}

function ComparePage({ param }: { param: string }) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = isCompareCategory(param) ? param : null

  const { data, isLoading, error } = useGetCompareTableQuery(
    { category: category ?? DEFAULT_COMPARE_CATEGORY },
    { skip: !category },
  )

  const state = useMemo(() => readCompareState(searchParams), [searchParams])
  const update = useCallback(
    (patch: Partial<CompareUrlState>) => {
      setSearchParams(writeCompareState({ ...state, ...patch }), {
        replace: true,
      })
    },
    [setSearchParams, state],
  )

  const columns = useMemo(() => data?.columns ?? [], [data])
  const allRows = useMemo(() => data?.items ?? [], [data])
  const options = useMemo(() => filterOptions(allRows), [allRows])
  const sort: CompareSort = isSortKey(state.sort.key, columns)
    ? state.sort
    : { key: "name", dir: "asc" }
  const rows = useMemo(
    () => sortRows(filterRows(allRows, state.filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sort is derived from state
    [allRows, state.filters, sort.key, sort.dir],
  )
  const shown: CompareShownFields = {
    class: allRows.some((r) => r.class !== null),
    grade: allRows.some((r) => r.grade !== null),
    size: options.size !== undefined,
  }

  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  })
  // A new filter, sort or category starts at the first page.
  const resetKey = `${category}|${searchParams.toString().replace(/(^|&)(compare|view)=[^&]*/g, "")}`
  useEffect(() => {
    setPagination((p) => (p.page === 0 ? p : { ...p, page: 0 }))
  }, [resetKey])

  const byId = useMemo(
    () => new Map(allRows.map((r) => [r.id.toLowerCase(), r])),
    [allRows],
  )
  const selectedRows = state.selected
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined)

  const toggle = useCallback(
    (id: string) => {
      const selected = toggleSelected(state.selected, id)
      update({
        selected,
        view: state.view && selected.length >= MIN_COMPARE,
      })
    },
    [state.selected, state.view, update],
  )

  const setFilter = (field: FilterField, value: string) => {
    const values = { ...state.filters.values }
    if (value) values[field] = value
    else delete values[field]
    update({ filters: { ...state.filters, values } })
  }

  const label = category ? categoryLabel(t, category) : ""
  const hasFilters =
    state.filters.q.trim() !== "" ||
    state.filters.soldOnly ||
    Object.keys(state.filters.values).length > 0

  return (
    <StandardPageLayout
      title={
        category
          ? t("wikiCompare.pageTitle", { category: label })
          : t("wikiCompare.title")
      }
      description={
        category ? t("wikiCompare.pageDescription", { category: label }) : ""
      }
      canonicalUrl={category ? WIKI_PATHS.compare(category) : undefined}
      headerTitle={t("wikiCompare.title")}
      breadcrumbs={[
        {
          label: t("wiki.itemDetail.breadcrumbWiki", "Wiki"),
          href: WIKI_PATHS.hub,
        },
        { label: t("wikiCompare.breadcrumb"), href: WIKI_PATHS.compareHub },
        ...(category ? [{ label }] : []),
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          {COMPARE_GROUPS.map(({ group, categories }) => (
            <Box key={group}>
              <Typography
                variant="overline"
                color="text.secondary"
                component="h2"
              >
                {t(`wikiCompare.group.${group}`)}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {categories.map((c) => (
                  <Chip
                    key={c}
                    label={categoryLabel(t, c)}
                    component={RouterLink}
                    to={WIKI_PATHS.compare(c)}
                    clickable
                    color={c === category ? "primary" : "default"}
                    variant={c === category ? "filled" : "outlined"}
                    aria-current={c === category ? "page" : undefined}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>

        {!category && (
          <Alert severity="warning">{t("wikiCompare.unknownCategory")}</Alert>
        )}
        {error && <Alert severity="error">{t("wikiCompare.loadError")}</Alert>}
        {category && isLoading && <TableSkeleton rows={10} />}

        {data && (
          <>
            <Paper sx={{ p: 1.5, mb: 2 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                useFlexGap
                flexWrap="wrap"
                alignItems={{ md: "center" }}
              >
                <TextField
                  size="small"
                  label={t("wikiCompare.search")}
                  value={state.filters.q}
                  onChange={(e) =>
                    update({ filters: { ...state.filters, q: e.target.value } })
                  }
                  sx={{ minWidth: 200 }}
                />
                {FILTER_FIELDS.map((field) => {
                  const values = options[field]
                  if (!values) return null
                  return (
                    <TextField
                      key={field}
                      select
                      size="small"
                      label={filterLabel(t, field)}
                      value={state.filters.values[field] ?? ""}
                      onChange={(e) => setFilter(field, e.target.value)}
                      sx={{ minWidth: 140 }}
                      data-testid={`compare-filter-${field}`}
                    >
                      <MenuItem value="">{t("wikiCompare.any")}</MenuItem>
                      {values.map((v) => (
                        <MenuItem key={v} value={v}>
                          {field === "size" ? `S${v}` : v}
                        </MenuItem>
                      ))}
                    </TextField>
                  )
                })}
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={state.filters.soldOnly}
                      onChange={(e) =>
                        update({
                          filters: {
                            ...state.filters,
                            soldOnly: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label={t("wikiCompare.soldOnly")}
                />
                {hasFilters && (
                  <Button
                    size="small"
                    color="neutral"
                    onClick={() =>
                      update({
                        filters: { q: "", values: {}, soldOnly: false },
                      })
                    }
                  >
                    {t("wikiCompare.clearFilters")}
                  </Button>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: { md: "auto" } }}
                >
                  {t("gameTaxonomyUi.itemCount", { count: rows.length })}
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 1.5, mb: 2 }} data-testid="compare-selection-bar">
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {state.selected.length === 0
                    ? t("wikiCompare.pickHint", {
                        min: MIN_COMPARE,
                        max: MAX_COMPARE,
                      })
                    : t("wikiCompare.selectedCount", {
                        count: selectedRows.length,
                        max: MAX_COMPARE,
                      })}
                </Typography>
                {selectedRows.map((row) => (
                  <Chip
                    key={row.id}
                    label={row.name}
                    size="small"
                    onDelete={() => toggle(row.id)}
                  />
                ))}
                <Box sx={{ flex: 1 }} />
                {state.selected.length > 0 && (
                  <Button
                    size="small"
                    color="neutral"
                    onClick={() => update({ selected: [], view: false })}
                  >
                    {t("wikiCompare.clearSelection")}
                  </Button>
                )}
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CompareArrowsRounded />}
                  disabled={selectedRows.length < MIN_COMPARE}
                  onClick={() => update({ view: true })}
                >
                  {t("wikiCompare.compareButton", {
                    count: selectedRows.length,
                  })}
                </Button>
              </Stack>
            </Paper>

            {rows.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", py: 6 }}
              >
                {t("wikiCompare.noResults")}
              </Typography>
            ) : isMobile ? (
              <CompareCards
                rows={rows}
                columns={columns}
                shown={shown}
                sort={sort}
                onSortChange={(s) => update({ sort: s })}
                selected={state.selected}
                onToggle={toggle}
                page={pagination.page}
                pageSize={pagination.pageSize}
                onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
                onPageSizeChange={(pageSize) =>
                  setPagination({ page: 0, pageSize })
                }
              />
            ) : (
              <CompareGrid
                rows={rows}
                columns={columns}
                shown={shown}
                sort={sort}
                onSortChange={(s) =>
                  update({ sort: s ?? { key: "name", dir: "asc" } })
                }
                selected={state.selected}
                onToggle={toggle}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              component="p"
              sx={{ mt: 2 }}
            >
              {t("wikiCompare.dataNote")}
            </Typography>

            <CompareDialog
              open={state.view && selectedRows.length >= MIN_COMPARE}
              onClose={() => update({ view: false })}
              rows={selectedRows}
              columns={columns}
              shown={shown}
              onRemove={toggle}
            />
          </>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
