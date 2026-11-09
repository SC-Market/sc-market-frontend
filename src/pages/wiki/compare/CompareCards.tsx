/**
 * The comparison table on mobile: one card per item (name, class/grade/size,
 * every stat, price, pick checkbox) with a sort picker, since the DataGrid
 * can't pin the name column on a narrow screen.
 */
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type {
  WikiCompareColumn,
  WikiCompareRow,
} from "../../../store/api/v2/market"
import { WIKI_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { TagChip } from "../../../components/tags/TagChip"
import { NumberedPagination } from "../../../components/pagination/NumberedPagination"
import { MAX_COMPARE, type CompareSort } from "./compareTable"
import { formatSize, formatStat, statLabel } from "./compareFormat"
import { CompareMarketPrice } from "./CompareMarketPrice"
import { COMPARE_PAGE_SIZES, type CompareShownFields } from "./CompareGrid"

export function CompareCards({
  rows,
  columns,
  shown,
  sort,
  onSortChange,
  selected,
  onToggle,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  rows: readonly WikiCompareRow[]
  columns: readonly WikiCompareColumn[]
  shown: CompareShownFields
  sort: CompareSort
  onSortChange: (sort: CompareSort) => void
  selected: readonly string[]
  onToggle: (id: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const full = selected.length >= MAX_COMPARE
  const sortKeys = [
    "name",
    ...(shown.class ? ["class"] : []),
    ...(shown.grade ? ["grade"] : []),
    ...(shown.size ? ["size"] : []),
    ...columns.map((c) => c.key),
    "price",
  ]
  const sortName = (key: string) =>
    key === "name"
      ? t("wikiCompare.column.name")
      : key === "price"
        ? t("marketPrice.column")
        : key === "class" || key === "grade" || key === "size"
          ? t(`wikiCompare.filter.${key}`)
          : statLabel(t, key)
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <Box data-testid="compare-cards">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <TextField
          select
          size="small"
          fullWidth
          label={t("wikiCompare.sortBy")}
          value={sortKeys.includes(sort.key) ? sort.key : "name"}
          onChange={(e) => onSortChange({ key: e.target.value, dir: sort.dir })}
        >
          {sortKeys.map((key) => (
            <MenuItem key={key} value={key}>
              {sortName(key)}
            </MenuItem>
          ))}
        </TextField>
        <IconButton
          aria-label={
            sort.dir === "asc"
              ? t("wikiCompare.sortAscending")
              : t("wikiCompare.sortDescending")
          }
          onClick={() =>
            onSortChange({
              key: sort.key,
              dir: sort.dir === "asc" ? "desc" : "asc",
            })
          }
        >
          {sort.dir === "asc" ? (
            <ArrowUpwardRounded />
          ) : (
            <ArrowDownwardRounded />
          )}
        </IconButton>
      </Stack>

      <Stack spacing={1}>
        {visible.map((row) => {
          const picked = selected.includes(row.id.toLowerCase())
          return (
            <Paper key={row.id} sx={{ p: 1.5 }} data-testid="compare-card">
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={WIKI_PATHS.item(row.id, row.name)}
                    underline="hover"
                    color="inherit"
                    fontWeight={600}
                  >
                    {row.name}
                  </Link>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ mt: 0.5 }}
                  >
                    {shown.class && row.class && (
                      <TagChip tag="category" label={row.class} />
                    )}
                    {shown.grade && row.grade && (
                      <TagChip tag="tier" label={row.grade} />
                    )}
                    {shown.size && row.size !== null && (
                      <TagChip tag="size" label={formatSize(row.size)} />
                    )}
                  </Stack>
                </Box>
                <FormControlLabel
                  sx={{ mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={picked}
                      disabled={!picked && full}
                      onChange={() => onToggle(row.id)}
                    />
                  }
                  label={t("wikiCompare.pickShort")}
                />
              </Stack>
              <Box
                component="dl"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  columnGap: 2,
                  rowGap: 0.25,
                  m: 0,
                  mt: 1,
                }}
              >
                {columns.map((column) => (
                  <Box key={column.key} sx={{ display: "contents" }}>
                    <Typography
                      component="dt"
                      variant="caption"
                      color="text.secondary"
                    >
                      {statLabel(t, column.key)}
                    </Typography>
                    <Typography component="dd" variant="caption" sx={{ m: 0 }}>
                      {formatStat(row.stats[column.key], column, fmt)}
                    </Typography>
                  </Box>
                ))}
                <Typography
                  component="dt"
                  variant="caption"
                  color="text.secondary"
                >
                  {t("marketPrice.column")}
                </Typography>
                <Typography component="dd" variant="caption" sx={{ m: 0 }}>
                  <CompareMarketPrice row={row} />
                </Typography>
              </Box>
            </Paper>
          )
        })}
      </Stack>
      <NumberedPagination
        count={rows.length}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={onPageChange}
        rowsPerPageOptions={COMPARE_PAGE_SIZES}
        onRowsPerPageChange={onPageSizeChange}
        sx={{ mt: 2 }}
      />
    </Box>
  )
}
