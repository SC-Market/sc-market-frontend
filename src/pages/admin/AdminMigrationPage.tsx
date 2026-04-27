/**
 * Admin V1→V2 Migration Page (temporary)
 *
 * Shows migration status and allows dry-run or execute from the admin panel.
 */

import React, { useState } from "react"
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
import { useGetMigrationStatusQuery, useRunMigrationMutation } from "../../store/api/v2/market"

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

export default function AdminMigrationPage() {
  const { data: status, isLoading: statusLoading, refetch } = useGetMigrationStatusQuery()
  const [runMigration, { isLoading: running }] = useRunMigrationMutation()
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async (dryRun: boolean) => {
    setResult(null)
    setError(null)
    try {
      const res = await runMigration({ migrationRunRequest: { dry_run: dryRun } }).unwrap()
      setResult(res)
      refetch()
    } catch (err: any) {
      setError(err?.data?.message || "Migration failed")
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        V1 → V2 Data Migration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Migrate V1 market listings, stock, photos, price history, and auction data to V2 tables.
        Dry-run wraps everything in a transaction and rolls back — no data is persisted.
      </Typography>

      {/* Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Current Status</Typography>
          <Button size="small" startIcon={<SyncRounded />} onClick={() => refetch()} disabled={statusLoading}>
            Refresh
          </Button>
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

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Other Data</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <CountCard label="Price History V1" count={status.price_history.v1} />
              <CountCard label="Price History V2" count={status.price_history.v2} />
              <CountCard label="Auctions V1" count={status.auctions.v1} />
              <CountCard label="Auctions V2" count={status.auctions.v2} />
            </Stack>
          </>
        )}
      </Paper>

      {/* Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Run Migration</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={running ? <CircularProgress size={16} /> : <PreviewRounded />}
            onClick={() => handleRun(true)}
            disabled={running}
            size="large"
          >
            Dry Run
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={running ? <CircularProgress size={16} /> : <PlayArrowRounded />}
            onClick={() => handleRun(false)}
            disabled={running}
            size="large"
          >
            Execute Migration
          </Button>
        </Stack>
      </Paper>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Result */}
      {result && (
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            {result.dry_run
              ? <Chip icon={<PreviewRounded />} label="DRY RUN" color="info" />
              : <Chip icon={<CheckCircleRounded />} label="EXECUTED" color="success" />}
            <Typography variant="body2" color="text.secondary">
              {result.duration_seconds.toFixed(2)}s
            </Typography>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Attempted</TableCell>
                <TableCell align="right">Success</TableCell>
                <TableCell align="right">Failed</TableCell>
                <TableCell align="right">Skipped</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: "Listings", data: result.listings },
                { name: "Price History", data: result.price_history },
                { name: "Auctions", data: result.auctions },
                { name: "Order Items", data: result.order_items },
                { name: "Offer Items", data: result.offer_items },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">{row.data.total_attempted}</TableCell>
                  <TableCell align="right">
                    <Typography color="success.main" fontWeight="bold">{row.data.successful}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {row.data.failed > 0
                      ? <Typography color="error.main" fontWeight="bold">{row.data.failed}</Typography>
                      : "0"}
                  </TableCell>
                  <TableCell align="right">{row.data.skipped}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {result.listings.errors?.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                Errors ({result.listings.errors.length})
              </Typography>
              {result.listings.errors.slice(0, 20).map((e: any, i: number) => (
                <Typography key={i} variant="caption" display="block" color="text.secondary">
                  {e.v1_listing_id}: {e.error}
                </Typography>
              ))}
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}
