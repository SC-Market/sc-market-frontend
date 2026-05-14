/**
 * Admin V1→V2 Migration Page (temporary)
 *
 * Async job-based: starts migration, polls for status.
 */

import React, { useState, useEffect } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  PlayArrowRounded,
  PreviewRounded,
  CheckCircleRounded,
  ErrorRounded,
  SyncRounded,
} from "@mui/icons-material"
import {
  useGetMigrationStatusQuery,
  useRunMigrationMutation,
  useListMigrationJobsQuery,
  useGetMigrationJobQuery,
  type MigrationResult,
  type MigrationJob,
} from "../../store/api/v2/market"

function CountCard({ label, count, color }: { label: string; count: number; color?: string }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 120 }}>
      <CardContent sx={{ textAlign: "center", py: 1, "&:last-child": { pb: 1 } }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight="bold" color={color || "text.primary"}>
          {count.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  )
}

function JobResult({ result }: { result: MigrationResult }) {
  const categories = [
    { key: "listings", label: "Listings", skipReason: "Already migrated (re-run)" },
    { key: "price_history", label: "Price History", skipReason: "Already migrated or NULL game_item_id" },
    { key: "auctions", label: "Auctions", skipReason: "Already migrated or listing not yet migrated" },
    { key: "order_items", label: "Order Items", skipReason: "Already migrated (re-run)" },
    { key: "offer_items", label: "Offer Items", skipReason: "Already migrated (re-run)" },
    { key: "buy_orders", label: "Buy Orders", skipReason: "Already migrated or NULL game_item_id (required for buy orders)" },
  ]
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell align="right">Success</TableCell>
            <TableCell align="right">Failed</TableCell>
            <TableCell align="right">Skipped</TableCell>
            <TableCell>Skip Reason</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(({ key, label, skipReason }) => {
            const d = result[key]
            if (!d) return null
            return (
              <TableRow key={key}>
                <TableCell>{label}</TableCell>
                <TableCell align="right"><Typography color="success.main" fontWeight="bold">{d.successful}</Typography></TableCell>
                <TableCell align="right">{d.failed > 0 ? <Typography color="error.main" fontWeight="bold">{d.failed}</Typography> : "0"}</TableCell>
                <TableCell align="right">{d.skipped}</TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{d.skipped > 0 ? skipReason : "—"}</Typography></TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {result.listings?.errors?.length > 0 && (
        <Box sx={{ mt: 1, maxHeight: 200, overflow: "auto" }}>
          <Typography variant="subtitle2" color="error" sx={{ mb: 0.5 }}>
            Errors ({result.listings.errors.length})
          </Typography>
          {result.listings.errors.slice(0, 50).map((e, i) => (
            <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
              {e.v1_listing_id}: {e.error}
            </Typography>
          ))}
        </Box>
      )}
    </>
  )
}

export default function AdminMigrationPage() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useGetMigrationStatusQuery()
  const [runMigration] = useRunMigrationMutation()
  const { data: jobsData, refetch: refetchJobs } = useListMigrationJobsQuery()
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  // Poll active job
  const { data: activeJobData } = useGetMigrationJobQuery(
    { jobId: activeJobId! },
    { skip: !activeJobId, pollingInterval: 2000 },
  )

  const activeJob = activeJobData?.job

  // Stop polling when job completes
  useEffect(() => {
    if (activeJob && (activeJob.status === "completed" || activeJob.status === "failed")) {
      setActiveJobId(null)
      refetchStatus()
      refetchJobs()
    }
  }, [activeJob?.status])

  const handleRun = async (dryRun: boolean) => {
    try {
      const res = await runMigration({ migrationRunRequest: { dry_run: dryRun } }).unwrap()
      setActiveJobId(res.job_id)
      refetchJobs()
    } catch {}
  }

  const jobs = jobsData?.jobs || []

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>V1 → V2 Data Migration</Typography>

      {/* Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Current Status</Typography>
          <Button size="small" startIcon={<SyncRounded />} onClick={() => refetchStatus()} disabled={statusLoading}>Refresh</Button>
        </Stack>
        {statusLoading ? <CircularProgress size={24} /> : status && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>V1 Listings</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              <CountCard label="Unique" count={status.v1_counts.unique} />
              <CountCard label="Aggregate" count={status.v1_counts.aggregate} />
              <CountCard label="Multiple" count={status.v1_counts.multiple} />
              <CountCard label="Total" count={status.v1_counts.total} color="primary.main" />
            </Stack>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>V2 Data</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
              <CountCard label="Listings" count={status.v2_counts.listings} color="success.main" />
              <CountCard label="Mapped" count={status.v2_counts.mapped} />
              <CountCard label="Stock Lots" count={status.v2_counts.stock_lots_mapped} />
              <CountCard label="Photos" count={status.v2_counts.photos} />
            </Stack>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>Parity</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <CountCard label="Price Hist V1" count={status.price_history.v1} />
              <CountCard label="Price Hist V2" count={status.price_history.v2} color={status.price_history.v2 >= status.price_history.v1 ? "success.main" : "warning.main"} />
              <CountCard label="Auctions V1" count={status.auctions.v1} />
              <CountCard label="Auctions V2" count={status.auctions.v2} color={status.auctions.v2 >= status.auctions.v1 ? "success.main" : "warning.main"} />
              <CountCard label="Order Items V1" count={status.order_items.v1} />
              <CountCard label="Order Items V2" count={status.order_items.v2} color={status.order_items.v2 >= status.order_items.v1 ? "success.main" : "warning.main"} />
              <CountCard label="Offer Items V1" count={status.offer_items.v1} />
              <CountCard label="Offer Items V2" count={status.offer_items.v2} color={status.offer_items.v2 >= status.offer_items.v1 ? "success.main" : "warning.main"} />
              <CountCard label="Buy Orders V1" count={status.buy_orders.v1} />
              <CountCard label="Buy Orders V2" count={status.buy_orders.v2} color={status.buy_orders.v2 >= status.buy_orders.v1 ? "success.main" : "warning.main"} />
            </Stack>
          </>
        )}
      </Paper>

      {/* Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Run Migration</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<PreviewRounded />} onClick={() => handleRun(true)} disabled={!!activeJobId} size="large">
            Dry Run
          </Button>
          <Button variant="contained" color="warning" startIcon={<PlayArrowRounded />} onClick={() => handleRun(false)} disabled={!!activeJobId} size="large">
            Execute Migration
          </Button>
        </Stack>
      </Paper>

      {/* Active Job */}
      {activeJob && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="subtitle1" fontWeight="bold">{activeJob.progress || "Running..."}</Typography>
            <Chip label={activeJob.dry_run ? "DRY RUN" : "EXECUTE"} size="small" color={activeJob.dry_run ? "info" : "warning"} />
          </Stack>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Paper>
      )}

      {/* Job History */}
      {jobs.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Runs</Typography>
          {jobs.map((job) => (
            <Paper key={job.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {job.status === "completed" ? <CheckCircleRounded color="success" fontSize="small" /> : job.status === "failed" ? <ErrorRounded color="error" fontSize="small" /> : <CircularProgress size={14} />}
                <Chip label={job.dry_run ? "DRY RUN" : "EXECUTED"} size="small" color={job.dry_run ? "info" : "success"} />
                <Chip label={job.status} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(job.started_at).toLocaleString()}
                  {job.result ? ` — ${job.result.duration_seconds.toFixed(1)}s` : ""}
                </Typography>
              </Stack>
              {job.error && <Alert severity="error" sx={{ mb: 1 }}>{job.error}</Alert>}
              {job.result && <JobResult result={job.result} />}
            </Paper>
          ))}
        </Paper>
      )}
    </Box>
  )
}
