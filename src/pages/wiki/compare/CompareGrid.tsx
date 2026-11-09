/**
 * The comparison table on desktop: MUI DataGrid (ThemedDataGrid), sorted and
 * filtered by the page (URL state), with a pick checkbox per row for the
 * side-by-side comparison.
 */
import { useMemo } from "react"
import { Box, Checkbox, Link, Stack } from "@mui/material"
import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import type {
  WikiCompareColumn,
  WikiCompareRow,
} from "../../../store/api/v2/market"
import { WIKI_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { wikiItemImage } from "../wikiItemImage"
import { MAX_COMPARE, type CompareSort } from "./compareTable"
import { formatSize, formatStat, statLabel } from "./compareFormat"
import { CompareMarketPrice } from "./CompareMarketPrice"

export const COMPARE_PAGE_SIZES = [25, 50, 100] as const

export interface CompareShownFields {
  class: boolean
  grade: boolean
  size: boolean
}

export function CompareGrid({
  rows,
  columns,
  shown,
  sort,
  onSortChange,
  selected,
  onToggle,
  pagination,
  onPaginationChange,
}: {
  rows: WikiCompareRow[]
  columns: readonly WikiCompareColumn[]
  shown: CompareShownFields
  sort: CompareSort
  onSortChange: (sort: CompareSort | null) => void
  selected: readonly string[]
  onToggle: (id: string) => void
  pagination: GridPaginationModel
  onPaginationChange: (model: GridPaginationModel) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const full = selected.length >= MAX_COMPARE

  const gridColumns = useMemo<GridColDef<WikiCompareRow>[]>(() => {
    const cols: GridColDef<WikiCompareRow>[] = [
      {
        field: "__pick",
        headerName: t("wikiCompare.pickColumn"),
        width: 56,
        sortable: false,
        disableColumnMenu: true,
        renderHeader: () => null,
        renderCell: ({ row }) => {
          const picked = selected.includes(row.id.toLowerCase())
          return (
            <Checkbox
              size="small"
              checked={picked}
              disabled={!picked && full}
              onChange={() => onToggle(row.id)}
              inputProps={{
                "aria-label": t("wikiCompare.pickItem", { name: row.name }),
              }}
            />
          )
        },
      },
      {
        field: "name",
        headerName: t("wikiCompare.column.name"),
        flex: 1,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ height: "100%", minWidth: 0 }}
          >
            <ImageAvatar
              alt=""
              src={wikiItemImage(row)}
              variant="rounded"
              sx={{ width: 28, height: 28, bgcolor: "background.default" }}
              imgProps={{ loading: "lazy", style: { objectFit: "contain" } }}
            />
            <Link
              component={RouterLink}
              to={WIKI_PATHS.item(row.id, row.name)}
              underline="hover"
              color="inherit"
              fontWeight={600}
              noWrap
            >
              {row.name}
            </Link>
          </Stack>
        ),
      },
    ]
    if (shown.class)
      cols.push({
        field: "class",
        headerName: t("wikiCompare.filter.class"),
        width: 150,
        valueGetter: (_v, row) => row.class ?? "—",
      })
    if (shown.grade)
      cols.push({
        field: "grade",
        headerName: t("wikiCompare.filter.grade"),
        width: 80,
        valueGetter: (_v, row) => row.grade ?? "—",
      })
    if (shown.size)
      cols.push({
        field: "size",
        headerName: t("wikiCompare.filter.size"),
        width: 80,
        valueGetter: (_v, row) => formatSize(row.size),
      })
    cols.push({
      field: "manufacturer",
      headerName: t("wikiCompare.filter.manufacturer"),
      width: 170,
      valueGetter: (_v, row) => row.manufacturer ?? "—",
    })
    for (const column of columns) {
      cols.push({
        field: column.key,
        headerName: statLabel(t, column.key),
        description: statLabel(t, column.key),
        align: column.kind === "number" ? "right" : "left",
        headerAlign: column.kind === "number" ? "right" : "left",
        width: column.kind === "number" ? 130 : 170,
        valueGetter: (_v, row) =>
          formatStat(row.stats[column.key], column, fmt),
      })
    }
    cols.push({
      field: "price",
      headerName: t("marketPrice.column"),
      width: 200,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) => <CompareMarketPrice row={row} />,
    })
    return cols
  }, [columns, fmt, full, onToggle, selected, shown, t])

  const sortModel: GridSortModel = [{ field: sort.key, sort: sort.dir }]

  return (
    <Box data-testid="compare-grid">
      <ThemedDataGrid
        rows={rows}
        columns={gridColumns}
        getRowId={(row) => row.id}
        density="compact"
        autoHeight
        disableRowSelectionOnClick
        disableColumnFilter
        sortingMode="server"
        sortingOrder={["desc", "asc"]}
        sortModel={sortModel}
        onSortModelChange={(model) => {
          const first = model[0]
          onSortChange(
            first?.sort ? { key: first.field, dir: first.sort } : null,
          )
        }}
        pagination
        paginationModel={pagination}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[...COMPARE_PAGE_SIZES]}
      />
    </Box>
  )
}
