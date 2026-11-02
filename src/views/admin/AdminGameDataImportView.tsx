import React, { useState, useCallback } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  Typography,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress,
  Collapse,
  IconButton,
} from "@mui/material"
import {
  CloudUploadRounded,
  CheckCircleRounded,
  ErrorRounded,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import {
  useImportGameDataMutation,
  useListGameDataImportJobsQuery,
  GameDataImportJob,
} from "../../store/api/admin"
import { useGetPagesDeployHookStatusQuery } from "../../store/api/v2/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"

function statusColor(s: GameDataImportJob["status"]): "success" | "error" | "info" | "warning" {
  if (s === "completed") return "success"
  if (s === "failed") return "error"
  return "info"
}

/**
 * The frontend rebuild a successful import triggers (backend
 * services/game-data/pages-deploy-hook.ts: the Cloudflare Pages deploy hook,
 * at most once per 30 minutes), so the prerendered game-data pages get the
 * new data.
 */
function DeployHookStatus({ pollFast }: { pollFast: boolean }) {
  const { t } = useTranslation()
  const { data } = useGetPagesDeployHookStatusQuery(undefined, {
    pollingInterval: pollFast ? 5000 : 60000,
  })
  if (!data) return null
  const time = (iso: string) => new Date(iso).toLocaleString()
  if (!data.configured) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Trans i18nKey="adminUi.gameDataImport.deployHook.notConfigured" components={{ code: <code /> }} />
      </Alert>
    )
  }
  const lines: string[] = []
  if (!data.last_triggered_at) lines.push(t("adminUi.gameDataImport.deployHook.never"))
  else if (data.last_result === "failed")
    lines.push(
      t("adminUi.gameDataImport.deployHook.lastFailed", {
        time: time(data.last_triggered_at),
        error: data.last_error ?? "",
      }),
    )
  else lines.push(t("adminUi.gameDataImport.deployHook.lastOk", { time: time(data.last_triggered_at) }))
  if (data.next_trigger_at)
    lines.push(t("adminUi.gameDataImport.deployHook.pending", { time: time(data.next_trigger_at) }))
  return (
    <Alert severity={data.last_result === "failed" ? "error" : "info"} sx={{ mb: 3 }}>
      <Typography variant="subtitle2" component="p">
        {t("adminUi.gameDataImport.deployHook.title")}
      </Typography>
      <Typography variant="body2" component="p">
        {t("adminUi.gameDataImport.deployHook.explainer")}
      </Typography>
      {lines.map((line) => (
        <Typography key={line} variant="body2" component="p">
          {line}
        </Typography>
      ))}
    </Alert>
  )
}

function JobDetailRow({ job }: { job: GameDataImportJob }) {
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
            <Chip label={job.status} size="small" color={statusColor(job.status)} />
          </Box>
        </TableCell>
        <TableCell>{new Date(job.startedAt).toLocaleString()}</TableCell>
        <TableCell>
          {job.completedAt
            ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s`
            : job.progress || "—"}
        </TableCell>
        <TableCell>
          {job.result?.summary
            ? [
                job.result.summary.matched &&
                  t("adminUi.gameDataImport.summary.matched", { count: job.result.summary.matched }),
                job.result.summary.inserted &&
                  t("adminUi.gameDataImport.summary.inserted", { count: job.result.summary.inserted }),
                job.result.summary.missionsInserted &&
                  t("adminUi.gameDataImport.summary.missionsInserted", { count: job.result.summary.missionsInserted }),
                job.result.summary.missionsUpdated &&
                  t("adminUi.gameDataImport.summary.missionsUpdated", { count: job.result.summary.missionsUpdated }),
                job.result.summary.blueprintsInserted &&
                  t("adminUi.gameDataImport.summary.blueprintsInserted", { count: job.result.summary.blueprintsInserted }),
                job.result.summary.shopsImported &&
                  t("adminUi.gameDataImport.summary.shopsImported", { count: job.result.summary.shopsImported }),
              ].filter(Boolean).join(", ") || t("adminUi.gameDataImport.noChanges")
            : job.error
              ? job.error.slice(0, 60)
              : "—"}
        </TableCell>
        <TableCell>
          <IconButton size="small">{open ? <ExpandLess /> : <ExpandMore />}</IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0, borderBottom: open ? undefined : "none" }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ p: 2 }}>
              {job.status === "failed" && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {job.error}
                  {job.details && <Typography variant="caption" display="block">{job.details}</Typography>}
                </Alert>
              )}
              {job.result?.summary && (
                <Table size="small">
                  <TableBody>
                    {Object.entries(job.result.summary).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontWeight: 600, border: "none", py: 0.5 }}>
                          {k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </TableCell>
                        <TableCell sx={{ border: "none", py: 0.5 }}>
                          {typeof v === "number" ? v.toLocaleString() : String(v)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {job.result?.errors && job.result.errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {t("adminUi.gameDataImport.warnings", { count: job.result.errors.length })}
                  <Box component="ul" sx={{ m: 0, pl: 2, maxHeight: 150, overflow: "auto" }}>
                    {job.result.errors.slice(0, 20).map((e, i) => (
                      <li key={i}><Typography variant="caption">{e}</Typography></li>
                    ))}
                  </Box>
                </Alert>
              )}
              {!job.result?.summary && !job.error && (
                <Typography variant="body2" color="text.secondary">{t("adminUi.gameDataImport.noDetails")}</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export function AdminGameDataImportView() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [gameVersion, setGameVersion] = useState("")
  const [gameChannel, setGameChannel] = useState<"LIVE" | "PTU" | "EPTU">("LIVE")

  const [importGameData, { isLoading: uploading }] = useImportGameDataMutation()
  const issueAlert = useAlertHook()

  // Fetch all jobs — poll fast if any are running
  const { data: jobsData, refetch } = useListGameDataImportJobsQuery()
  const jobs = jobsData?.jobs ?? []
  const hasRunning = jobs.some((j) => j.status !== "completed" && j.status !== "failed")

  // Poll faster when jobs are running
  useListGameDataImportJobsQuery(undefined, {
    pollingInterval: hasRunning ? 2000 : 30000,
  })

  // Track last alerted job to avoid duplicate alerts
  const alertedRef = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    for (const j of jobs) {
      if ((j.status === "completed" || j.status === "failed") && !alertedRef.current.has(j.id)) {
        alertedRef.current.add(j.id)
        if (j.status === "completed") {
          issueAlert({ message: t("adminUi.gameDataImport.importSuccess"), severity: "success" })
        } else {
          issueAlert({ message: j.error || t("adminUi.gameDataImport.importFailed"), severity: "error" })
        }
      }
    }
  }, [jobs])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith(".zip")) setFile(f)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    try {
      await importGameData({ file, gameChannel, gameVersion: gameVersion || undefined }).unwrap()
      issueAlert({ message: t("adminUi.gameDataImport.importStarted"), severity: "info" })
      refetch()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("adminUi.gameDataImport.uploadFailed")
      issueAlert({ message, severity: "error" })
    }
  }

  return (
    <Box>
      <HeaderTitle>{t("nav.adminGameData")}</HeaderTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        <Trans i18nKey="adminUi.gameDataImport.intro" components={{ code: <code /> }} />
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Trans i18nKey="adminUi.gameDataImport.shopsNotice" components={{ code: <code /> }} />
      </Alert>
      <DeployHookStatus pollFast={hasRunning} />

      {/* Upload area */}
      <Paper
        sx={{
          p: 4, mb: 3, border: "2px dashed",
          borderColor: file ? "primary.main" : "divider",
          textAlign: "center", cursor: "pointer",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("game-data-file-input")?.click()}
      >
        <input id="game-data-file-input" type="file" accept=".zip" hidden onChange={handleFileSelect} />
        <CloudUploadRounded sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6">{file ? file.name : t("adminUi.gameDataImport.dropHint")}</Typography>
        {file && <Typography variant="body2" color="text.secondary">{(file.size / 1024).toFixed(0)} KB</Typography>}
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="admin-game-data-import-view-channel-label">{t("adminUi.gameDataImport.channel")}</InputLabel>
          <Select labelId="admin-game-data-import-view-channel-label" value={gameChannel} label={t("adminUi.gameDataImport.channel")} onChange={(e) => setGameChannel(e.target.value as typeof gameChannel)}>
            <MenuItem value="LIVE">LIVE</MenuItem>
            <MenuItem value="PTU">PTU</MenuItem>
            <MenuItem value="EPTU">EPTU</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label={t("adminUi.gameDataImport.gameVersion")} placeholder={t("adminUi.gameDataImport.gameVersionPlaceholder")} value={gameVersion} onChange={(e) => setGameVersion(e.target.value.slice(0, 50))} inputProps={{ maxLength: 50 }} />
        <Button
          variant="contained" size="large"
          disabled={!file || uploading || hasRunning}
          onClick={handleUpload}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadRounded />}
        >
          {uploading
            ? t("adminUi.gameDataImport.uploading")
            : hasRunning
              ? t("adminUi.gameDataImport.importRunning")
              : t("adminUi.gameDataImport.importButton")}
        </Button>
      </Stack>

      {/* Running job progress */}
      {jobs.filter((j) => j.status !== "completed" && j.status !== "failed").map((j) => (
        <Paper key={j.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="subtitle1" fontWeight={600}>
              {j.status.charAt(0).toUpperCase() + j.status.slice(1)}
            </Typography>
            <Chip label={j.status} color="info" size="small" />
          </Box>
          <LinearProgress sx={{ mb: 1 }} />
          {j.progress && <Typography variant="body2" color="text.secondary">{j.progress}</Typography>}
        </Paper>
      ))}

      {/* Jobs table */}
      {jobs.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t("adminUi.gameDataImport.history")}</Typography>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("admin.moderation.field.status")}</TableCell>
                  <TableCell>{t("adminUi.gameDataImport.started")}</TableCell>
                  <TableCell>{t("adminUi.gameDataImport.duration")}</TableCell>
                  <TableCell>{t("adminUi.gameDataImport.summaryColumn")}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((j) => <JobDetailRow key={j.id} job={j} />)}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}
    </Box>
  )
}
