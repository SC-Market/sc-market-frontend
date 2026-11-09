/**
 * The side-by-side comparison of the 2-4 picked items: one column per item,
 * one row per stat (class, grade, size, manufacturer, every stat column, the
 * SC Market price), with the best value of each ranked stat highlighted.
 * Scrolls sideways on a narrow screen with the stat names pinned.
 */
import {
  Box,
  Button,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { CloseRounded, EmojiEventsRounded } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ReactNode } from "react"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import type {
  WikiCompareColumn,
  WikiCompareRow,
} from "../../../store/api/v2/market"
import { WIKI_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { PRICE_KEY, bestValues, sortValue } from "./compareTable"
import { formatSize, formatStat, statLabel } from "./compareFormat"
import { CompareMarketPrice } from "./CompareMarketPrice"
import type { CompareShownFields } from "./CompareGrid"

export function CompareDialog({
  open,
  onClose,
  rows,
  columns,
  shown,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  /** The picked items, in pick order */
  rows: readonly WikiCompareRow[]
  columns: readonly WikiCompareColumn[]
  shown: CompareShownFields
  onRemove: (id: string) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const theme = useTheme()
  const best = bestValues(rows, columns)

  const stickySx = {
    position: "sticky",
    left: 0,
    zIndex: 1,
    bgcolor: "background.paper",
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as const

  const cellSx = (key: string, row: WikiCompareRow) => {
    const isBest = best.has(key) && sortValue(row, key) === best.get(key)
    return isBest
      ? {
          bgcolor: alpha(theme.palette.success.main, 0.16),
          color: "success.main",
          fontWeight: 700,
        }
      : undefined
  }

  const bestMark = (key: string, row: WikiCompareRow): ReactNode =>
    best.has(key) && sortValue(row, key) === best.get(key) ? (
      <EmojiEventsRounded
        fontSize="inherit"
        titleAccess={t("wikiCompare.best")}
        sx={{ ml: 0.5, verticalAlign: "-2px" }}
      />
    ) : null

  const textRow = (label: string, value: (row: WikiCompareRow) => string) => (
    <TableRow>
      <TableCell component="th" scope="row" sx={stickySx}>
        {label}
      </TableCell>
      {rows.map((row) => (
        <TableCell key={row.id}>{value(row)}</TableCell>
      ))}
    </TableRow>
  )

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={t("wikiCompare.dialogTitle")}
      maxWidth="lg"
      mobile="fullScreen"
      actions={
        <Button color="neutral" onClick={onClose}>
          {t("wikiCompare.close")}
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("wikiCompare.bestLegend")}
      </Typography>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" data-testid="compare-side-by-side">
          <TableHead>
            <TableRow>
              <TableCell sx={stickySx}>
                {t("wikiCompare.column.stat")}
              </TableCell>
              {rows.map((row) => (
                <TableCell key={row.id} sx={{ minWidth: 160 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Link
                      component={RouterLink}
                      to={WIKI_PATHS.item(row.id, row.name)}
                      underline="hover"
                      color="inherit"
                      fontWeight={700}
                      sx={{ flex: 1 }}
                    >
                      {row.name}
                    </Link>
                    <IconButton
                      size="small"
                      aria-label={t("wikiCompare.remove", { name: row.name })}
                      onClick={() => onRemove(row.id)}
                    >
                      <CloseRounded fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.class &&
              textRow(t("wikiCompare.filter.class"), (r) => r.class ?? "—")}
            {shown.grade &&
              textRow(t("wikiCompare.filter.grade"), (r) => r.grade ?? "—")}
            {shown.size &&
              textRow(t("wikiCompare.filter.size"), (r) => formatSize(r.size))}
            {textRow(
              t("wikiCompare.filter.manufacturer"),
              (r) => r.manufacturer ?? "—",
            )}
            {columns.map((column) => (
              <TableRow key={column.key}>
                <TableCell component="th" scope="row" sx={stickySx}>
                  {statLabel(t, column.key)}
                </TableCell>
                {rows.map((row) => (
                  <TableCell
                    key={row.id}
                    sx={cellSx(column.key, row)}
                    data-best={cellSx(column.key, row) ? "true" : undefined}
                  >
                    {formatStat(row.stats[column.key], column, fmt)}
                    {bestMark(column.key, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableCell component="th" scope="row" sx={stickySx}>
                {t("marketPrice.column")}
              </TableCell>
              {rows.map((row) => (
                <TableCell
                  key={row.id}
                  sx={cellSx(PRICE_KEY, row)}
                  data-best={cellSx(PRICE_KEY, row) ? "true" : undefined}
                >
                  <CompareMarketPrice row={row} />
                  {bestMark(PRICE_KEY, row)}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </ResponsiveDialog>
  )
}
