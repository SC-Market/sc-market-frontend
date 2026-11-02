import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import {
  useStartImportMutation,
  useListJobsQuery,
  type ImportJob,
  type ImportSource,
} from "../../store/api/v2/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { AdminIcons } from "../../components/icons"

/** labelKey: i18n key for the button/job label, resolved with t() at render time. */
const SOURCES: { key: ImportSource; labelKey: string }[] = [
  { key: "cstone-items", labelKey: "adminUi.importMonitoring.sources.cstoneItems" },
  { key: "uex-items", labelKey: "adminUi.importMonitoring.sources.uexItems" },
  { key: "uex-attributes", labelKey: "adminUi.importMonitoring.sources.uexAttributes" },
]

function statusColor(status: ImportJob["status"]): "info" | "success" | "error" {
  if (status === "running") return "info"
  if (status === "completed") return "success"
  return "error"
}

function JobCard({ job }: { job: ImportJob }) {
  const { t } = useTranslation()
  const source = SOURCES.find((s) => s.key === job.source)
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {job.status === "running" ? (
          <CircularProgress size={18} />
        ) : job.status === "completed" ? (
          <AdminIcons.CheckCircle color="success" />
        ) : (
          <AdminIcons.Error color="error" />
        )}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {source ? t(source.labelKey) : job.source}
        </Typography>
        <Chip label={job.status} color={statusColor(job.status)} size="small" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
          {new Date(job.startedAt).toLocaleString()}
        </Typography>
      </Box>
      {job.status === "running" && <LinearProgress sx={{ mb: 1 }} />}
      {job.result && (
        <Typography variant="body2" color="text.secondary">
          {Object.entries(job.result)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ")}
        </Typography>
      )}
      {job.error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {job.error}
        </Alert>
      )}
    </Paper>
  )
}

export function AdminImportMonitoringView() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [startImport, { isLoading: starting }] = useStartImportMutation()

  const [fastPoll, setFastPoll] = useState(false)

  const { data, isLoading } = useListJobsQuery(undefined, {
    pollingInterval: fastPoll ? 3000 : 30000,
  })

  const jobs = data?.jobs ?? []
  const hasRunning = jobs.some((j: ImportJob) => j.status === "running")
  const runningSource = jobs.find((j: ImportJob) => j.status === "running")?.source

  // Sync polling speed with job state
  React.useEffect(() => {
    setFastPoll(hasRunning)
  }, [hasRunning])

  // Adjust polling: slow down when idle
  const { data: polledData } = useListJobsQuery(undefined, {
    pollingInterval: hasRunning ? 3000 : 30000,
    skip: true, // The first query handles fetching; this just adjusts interval
  })

  const handleStart = async (source: ImportSource) => {
    try {
      await startImport({ source }).unwrap()
      issueAlert({ message: t("adminUi.importMonitoring.started", { source }), severity: "info" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("adminUi.importMonitoring.startFailed")
      issueAlert({
        message,
        severity: "error",
      })
    }
  }

  return (
    <>
      <Grid item xs={12} sx={{ mb: 2 }}>
        <HeaderTitle xs={12}>{t("admin.importMonitoring.title")}</HeaderTitle>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("adminUi.importMonitoring.startImport")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {SOURCES.map((s) => (
              <Button
                key={s.key}
                variant="contained"
                startIcon={
                  runningSource === s.key ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AdminIcons.CloudDownload />
                  )
                }
                onClick={() => handleStart(s.key)}
                disabled={starting || !!runningSource}
              >
                {runningSource === s.key ? t("adminUi.importMonitoring.running") : t(s.labelKey)}
              </Button>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {t("adminUi.importMonitoring.oneAtATime")}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("adminUi.importMonitoring.jobHistory")}
        </Typography>
        {isLoading && <LinearProgress sx={{ mb: 2 }} />}
        {jobs.length === 0 && !isLoading && (
          <Alert severity="info">
            {t("adminUi.importMonitoring.noJobs")}
          </Alert>
        )}
        {jobs.map((job: ImportJob) => (
          <JobCard key={job.id} job={job} />
        ))}
      </Grid>
    </>
  )
}
