import React, { useState, useCallback } from "react"
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
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material"
import { CloudUploadRounded, CheckCircleRounded, ErrorRounded } from "@mui/icons-material"
import { HeaderTitle } from "../../components/typography/HeaderTitle"

import { BACKEND_URL } from "../../util/constants"

interface ImportResult {
  success: boolean
  summary?: {
    totalP4KItems: number
    validP4KItems: number
    existingDBItems: number
    matched: number
    matchedExact: number
    matchedCStoneUUID: number
    matchedFuzzy: number
    inserted: number
    updated: number
    nameChanges: number
    fullSetsCreated: number
    missionsProcessed: number
    missionsInserted: number
    missionsUpdated: number
    blueprintsProcessed: number
    blueprintsInserted: number
    blueprintsUpdated: number
  }
  errors?: string[]
  error?: string
  details?: string
  timestamp?: string
}

export function AdminGameDataImportView() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [gameVersion, setGameVersion] = useState("")
  const [gameChannel, setGameChannel] = useState<"LIVE" | "PTU" | "EPTU">("LIVE")

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
    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("gameChannel", gameChannel)
      if (gameVersion) formData.append("gameVersion", gameVersion)

      const res = await fetch(`${BACKEND_URL}/api/v2/admin/import-game-data`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data: ImportResult = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        success: false,
        error: "Upload failed",
        details: err instanceof Error ? err.message : "Network error",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box>
      <HeaderTitle>Game Data Import</HeaderTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a <code>game-data.zip</code> extracted from Star Citizen's Data.p4k
        using StarBreaker. This updates items, blueprints, missions, resources,
        ships, manufacturers, and starmap locations.
      </Typography>

      {/* Upload area */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          border: "2px dashed",
          borderColor: file ? "primary.main" : "divider",
          textAlign: "center",
          cursor: "pointer",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("game-data-file-input")?.click()}
      >
        <input
          id="game-data-file-input"
          type="file"
          accept=".zip"
          hidden
          onChange={handleFileSelect}
        />
        <CloudUploadRounded sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="h6">
          {file ? file.name : "Drop game-data.zip here or click to browse"}
        </Typography>
        {file && (
          <Typography variant="body2" color="text.secondary">
            {(file.size / 1024).toFixed(0)} KB
          </Typography>
        )}
      </Paper>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Channel</InputLabel>
          <Select
            value={gameChannel}
            label="Channel"
            onChange={(e) => setGameChannel(e.target.value as "LIVE" | "PTU" | "EPTU")}
          >
            <MenuItem value="LIVE">LIVE</MenuItem>
            <MenuItem value="PTU">PTU</MenuItem>
            <MenuItem value="EPTU">EPTU</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Game Version"
          placeholder="e.g. 4.7.1"
          value={gameVersion}
          onChange={(e) => setGameVersion(e.target.value)}
        />
        <Button
          variant="contained"
          size="large"
          disabled={!file || uploading}
          onClick={handleUpload}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadRounded />}
        >
          {uploading ? "Importing..." : "Import Game Data"}
        </Button>
      </Stack>

      {/* Results */}
      {result && !result.success && (
        <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorRounded />}>
          <Typography variant="subtitle2">{result.error}</Typography>
          {result.details && (
            <Typography variant="body2">{result.details}</Typography>
          )}
        </Alert>
      )}

      {result?.success && result.summary && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircleRounded color="success" />
            <Typography variant="h6">Import Complete</Typography>
            <Chip label={result.timestamp} size="small" variant="outlined" />
          </Box>

          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>P4K Items</TableCell>
                <TableCell>{result.summary.totalP4KItems.toLocaleString()} total, {result.summary.validP4KItems.toLocaleString()} valid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Existing DB Items</TableCell>
                <TableCell>{result.summary.existingDBItems.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Matched</TableCell>
                <TableCell>
                  {result.summary.matched.toLocaleString()} total
                  {" "}({result.summary.matchedExact} exact, {result.summary.matchedFuzzy} fuzzy)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
                <TableCell>{result.summary.updated.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Inserted</TableCell>
                <TableCell>{result.summary.inserted.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name Changes</TableCell>
                <TableCell>{result.summary.nameChanges}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Full Sets Created</TableCell>
                <TableCell>{result.summary.fullSetsCreated}</TableCell>
              </TableRow>
              {result.summary.missionsProcessed > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Missions</TableCell>
                  <TableCell>
                    {result.summary.missionsProcessed} processed
                    {" "}({result.summary.missionsInserted} new, {result.summary.missionsUpdated} updated)
                  </TableCell>
                </TableRow>
              )}
              {result.summary.blueprintsProcessed > 0 && (
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Blueprints</TableCell>
                  <TableCell>
                    {result.summary.blueprintsProcessed} processed
                    {" "}({result.summary.blueprintsInserted} new, {result.summary.blueprintsUpdated} updated)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {result.errors && result.errors.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">{result.errors.length} warnings</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2, maxHeight: 200, overflow: "auto" }}>
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}><Typography variant="caption">{e}</Typography></li>
                ))}
              </Box>
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  )
}
