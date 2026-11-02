import React, { useState } from "react"
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
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
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { CloudDownloadRounded, CheckCircleRounded } from "@mui/icons-material"
import { Trans, useTranslation } from "react-i18next"
import {
  useImportFromUexMutation,
  type ImportFromUexApiResponse,
} from "../../../store/api/v2/market"
import { listingApiError } from "../domain/listingFormErrors"

type UexImportPreviewItem = NonNullable<ImportFromUexApiResponse["preview"]>[number]

/**
 * Copies a seller's active UEXCorp sell listings into `shopId`. Titles that
 * name exactly one game item are linked to it by the backend.
 */
export function ImportFromUex({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState("")
  const [preview, setPreview] = useState<UexImportPreviewItem[] | null>(null)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [importFromUex, { isLoading }] = useImportFromUexMutation()

  const handleFetchPreview = async () => {
    if (!username.trim()) return
    setImportResult(null)
    setError(null)

    try {
      const result = await importFromUex({
        body: { uex_username: username.trim(), shop_id: shopId },
      }).unwrap()

      if (result.preview) {
        setPreview(result.preview)
        setSelectedIndices(new Set(result.preview.map((_, i) => i)))
      } else {
        setPreview([])
      }
    } catch (e) {
      setPreview(null)
      setError(listingApiError(e, t("ItemStock.importFromUexFetchError", "Couldn't fetch your UEX listings")).message)
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

    setError(null)
    try {
      const result = await importFromUex({
        body: {
          uex_username: username.trim(),
          shop_id: shopId,
          listings: selectedListings,
          confirm: true,
        },
      }).unwrap()

      setImportResult({ imported: result.imported || 0, total: result.total || 0 })
      setPreview(null)
    } catch (e) {
      setError(listingApiError(e, t("ItemStock.importFromUexError", "The import failed")).message)
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
          <Trans
            i18nKey="uexImportUi.success"
            count={importResult.total}
            values={{ imported: importResult.imported }}
            components={{ strong: <strong /> }}
          />
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            setImportResult(null)
            setUsername("")
          }}
        >
          {t("uexImportUi.importMore")}
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("uexImportUi.intro")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          label={t("uexImportUi.username")}
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
          {t("uexImportUi.fetch")}
        </LoadingButton>
      </Box>

      {preview !== null && preview.length === 0 && (
        <Alert severity="info">
          <Trans
            i18nKey="uexImportUi.noneFound"
            values={{ username }}
            components={{ strong: <strong /> }}
          />
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
              label={t("uexImportUi.selectedOf", { count: preview.length, selected: selectedIndices.size })}
            />
            <LoadingButton
              variant="contained"
              color="success"
              loading={isLoading}
              disabled={selectedIndices.size === 0}
              onClick={handleConfirmImport}
            >
              {t("uexImportUi.importCount", { count: selectedIndices.size })}
            </LoadingButton>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>{t("uexImportUi.columns.title")}</TableCell>
                  <TableCell align="right">{t("uexImportUi.columns.price")}</TableCell>
                  <TableCell align="right">{t("uexImportUi.columns.quantity")}</TableCell>
                  <TableCell>{t("uexImportUi.columns.source")}</TableCell>
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
                      <Checkbox
                        checked={selectedIndices.has(index)}
                        inputProps={{ "aria-label": t("uexImportUi.selectItem", { title: item.title }) }}
                      />
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

/** The import, in a dialog opened from the shop's listings page. */
export function ImportFromUexDialog({
  shopId,
  open,
  onClose,
}: {
  shopId: string
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t("ItemStock.importFromUex", "Import from UEX")}</DialogTitle>
      <DialogContent>
        <ImportFromUex shopId={shopId} />
      </DialogContent>
    </Dialog>
  )
}
