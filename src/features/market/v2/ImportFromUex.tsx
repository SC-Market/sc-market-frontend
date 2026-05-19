import React, { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { CloudDownloadRounded, CheckCircleRounded } from "@mui/icons-material"
import { useImportFromUexMutation } from "../../../store/api/v2/market-overrides"
import type { UexImportPreviewItem } from "../../../store/api/v2/market-overrides"

interface ImportFromUexProps {
  contractorSpectrumId?: string
}

export function ImportFromUex({ contractorSpectrumId }: ImportFromUexProps) {
  const [username, setUsername] = useState("")
  const [preview, setPreview] = useState<UexImportPreviewItem[] | null>(null)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null)

  const [importFromUex, { isLoading }] = useImportFromUexMutation()

  const handleFetchPreview = async () => {
    if (!username.trim()) return
    setImportResult(null)

    try {
      const result = await importFromUex({
        uex_username: username.trim(),
        contractor_spectrum_id: contractorSpectrumId,
      }).unwrap()

      if (result.preview) {
        setPreview(result.preview)
        setSelectedIndices(new Set(result.preview.map((_, i) => i)))
      } else {
        setPreview([])
      }
    } catch {
      setPreview([])
    }
  }

  const handleConfirmImport = async () => {
    if (!preview) return

    const selectedListings = preview
      .filter((_, i) => selectedIndices.has(i))
      .map((item) => ({
        title: item.title,
        description: "",
        price: item.price,
        quantity: item.quantity,
        quality: item.quality,
        source: item.source,
      }))

    try {
      const result = await importFromUex({
        uex_username: username.trim(),
        contractor_spectrum_id: contractorSpectrumId,
        listings: selectedListings,
        confirm: true,
      }).unwrap()

      setImportResult({ imported: result.imported || 0, total: result.total || 0 })
      setPreview(null)
    } catch {
      // Error handled by RTK Query
    }
  }

  const toggleAll = () => {
    if (!preview) return
    if (selectedIndices.size === preview.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(preview.map((_, i) => i)))
    }
  }

  const toggleIndex = (index: number) => {
    const next = new Set(selectedIndices)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    setSelectedIndices(next)
  }

  if (importResult) {
    return (
      <Box>
        <Alert
          severity="success"
          icon={<CheckCircleRounded />}
          sx={{ mb: 2 }}
        >
          Successfully imported <strong>{importResult.imported}</strong> of {importResult.total} listings from UEX.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            setImportResult(null)
            setUsername("")
          }}
        >
          Import More
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Import your active sell listings from UEXCorp. Enter your UEX username
        to preview what will be imported.
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          label="UEX Username"
          size="small"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetchPreview()}
          disabled={isLoading}
          sx={{ flex: 1, maxWidth: 300 }}
        />
        <LoadingButton
          variant="contained"
          loading={isLoading && !preview}
          startIcon={<CloudDownloadRounded />}
          onClick={handleFetchPreview}
          disabled={!username.trim()}
        >
          Fetch Listings
        </LoadingButton>
      </Box>

      {preview !== null && preview.length === 0 && (
        <Alert severity="info">
          No active sell listings found for <strong>{username}</strong> on UEX.
          Make sure the username is correct.
        </Alert>
      )}

      {preview && preview.length > 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedIndices.size === preview.length}
                  indeterminate={selectedIndices.size > 0 && selectedIndices.size < preview.length}
                  onChange={toggleAll}
                />
              }
              label={`${selectedIndices.size} of ${preview.length} selected`}
            />
            <LoadingButton
              variant="contained"
              color="success"
              loading={isLoading}
              disabled={selectedIndices.size === 0}
              onClick={handleConfirmImport}
            >
              Import {selectedIndices.size} Listing{selectedIndices.size !== 1 ? "s" : ""}
            </LoadingButton>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.map((item, index) => (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => toggleIndex(index)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedIndices.has(index)} />
                    </TableCell>
                    <TableCell>
                      {item.title}
                      {item.quality != null && (
                        <Chip
                          label={`Q${item.quality}`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {item.price.toLocaleString()} aUEC
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell>{item.source || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}
