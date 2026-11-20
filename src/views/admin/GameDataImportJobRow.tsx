import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Collapse,
  IconButton,
} from "@mui/material"
import {
  CheckCircleRounded,
  ErrorRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
} from "@mui/icons-material"
import type {
  GameDataImportJob,
  ImportItemRename,
} from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"

export function statusColor(
  s: GameDataImportJob["status"],
): "success" | "error" | "info" | "warning" {
  if (s === "completed") return "success"
  if (s === "failed") return "error"
  return "info"
}

/**
 * A job summary value as display lines. Numbers are formatted; an object is
 * one "key: value" line per entry (a transition key "key_derived->derived"
 * reads "key_derived → derived"), nested values flattened inline; an array is
 * comma-joined. Empty objects/arrays show "—".
 */
export function summaryValueLines(
  value: unknown,
  formatNumber: (n: number) => string,
): string[] {
  const inline = (v: unknown): string => {
    if (typeof v === "number") return formatNumber(v)
    if (v === null || v === undefined) return "—"
    if (Array.isArray(v)) return v.length ? v.map(inline).join(", ") : "—"
    if (typeof v === "object") {
      const entries = Object.entries(v as Record<string, unknown>)
      return entries.length
        ? entries.map(([k, x]) => `${k}: ${inline(x)}`).join(", ")
        : "—"
    }
    return String(v)
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return ["—"]
    return entries.map(
      ([k, v]) => `${k.replace(/\s*->\s*/g, " → ")}: ${inline(v)}`,
    )
  }
  return [inline(value)]
}

/**
 * One import rename as text: `"Old" → "New" (key_derived → derived)`, or
 * the match type for rows matched by name/CStone UUID.
 */
export function renameLine(r: ImportItemRename): string {
  const how = r.oldSource
    ? `${r.oldSource} → ${r.newSource}`
    : `${r.match}, ${r.newSource}`
  return `"${r.oldName}" → "${r.newName}" (${how})`
}

export function JobDetailRow({ job }: { job: GameDataImportJob }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow hover sx={{ cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {job.status === "completed" ? (
              <CheckCircleRounded color="success" fontSize="small" />
            ) : job.status === "failed" ? (
              <ErrorRounded color="error" fontSize="small" />
            ) : (
              <CircularProgress size={16} />
            )}
            <Chip
              label={job.status}
              size="small"
              color={statusColor(job.status)}
            />
          </Box>
        </TableCell>
        <TableCell>{fmt.dateTime(job.startedAt)}</TableCell>
        <TableCell>
          {job.completedAt
            ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s`
            : job.progress || "—"}
        </TableCell>
        <TableCell>
          {job.result?.summary
            ? [
                job.result.summary.matched &&
                  t("adminUi.gameDataImport.summary.matched", {
                    count: job.result.summary.matched,
                  }),
                job.result.summary.inserted &&
                  t("adminUi.gameDataImport.summary.inserted", {
                    count: job.result.summary.inserted,
                  }),
                job.result.summary.missionsInserted &&
                  t("adminUi.gameDataImport.summary.missionsInserted", {
                    count: job.result.summary.missionsInserted,
                  }),
                job.result.summary.missionsUpdated &&
                  t("adminUi.gameDataImport.summary.missionsUpdated", {
                    count: job.result.summary.missionsUpdated,
                  }),
                job.result.summary.blueprintsInserted &&
                  t("adminUi.gameDataImport.summary.blueprintsInserted", {
                    count: job.result.summary.blueprintsInserted,
                  }),
                job.result.summary.shopsImported &&
                  t("adminUi.gameDataImport.summary.shopsImported", {
                    count: job.result.summary.shopsImported,
                  }),
              ]
                .filter(Boolean)
                .join(", ") || t("adminUi.gameDataImport.noChanges")
            : job.error
              ? job.error.slice(0, 60)
              : "—"}
        </TableCell>
        <TableCell>
          <IconButton
            size="small"
            aria-label={
              open ? t("ui.aria.hideDetails") : t("ui.aria.showDetails")
            }
            aria-expanded={open}
          >
            {open ? <ExpandLessRounded /> : <ExpandMoreRounded />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={5}
          sx={{ py: 0, borderBottom: open ? undefined : "none" }}
        >
          <Collapse in={open} unmountOnExit>
            <Box sx={{ p: 2 }}>
              {job.status === "failed" && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {job.error}
                  {job.details && (
                    <Typography variant="caption" display="block">
                      {job.details}
                    </Typography>
                  )}
                </Alert>
              )}
              {job.result?.summary && (
                <Table size="small">
                  <TableBody>
                    {Object.entries(job.result.summary).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell
                          sx={{ fontWeight: 600, border: "none", py: 0.5 }}
                        >
                          {k
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (s) => s.toUpperCase())}
                        </TableCell>
                        <TableCell sx={{ border: "none", py: 0.5 }}>
                          {summaryValueLines(v, fmt.number).map((line, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              component="span"
                              display="block"
                            >
                              {line}
                            </Typography>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {job.result?.errors && job.result.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {t("adminUi.gameDataImport.warnings", {
                    count: job.result.errors.length,
                  })}
                  <Box
                    component="ul"
                    sx={{ m: 0, pl: 2, maxHeight: 150, overflow: "auto" }}
                  >
                    {job.result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}>
                        <Typography variant="caption">{e}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
              {job.result?.itemRenames && job.result.itemRenames.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {t("adminUi.gameDataImport.renames", {
                    count: job.result.itemRenames.length,
                  })}
                  <Box
                    component="ul"
                    sx={{ m: 0, pl: 2, maxHeight: 240, overflow: "auto" }}
                  >
                    {job.result.itemRenames.map((r) => (
                      <li key={r.id}>
                        <Typography variant="caption">
                          {renameLine(r)}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
              {!job.result?.summary && !job.error && (
                <Typography variant="body2" color="text.secondary">
                  {t("adminUi.gameDataImport.noDetails")}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
