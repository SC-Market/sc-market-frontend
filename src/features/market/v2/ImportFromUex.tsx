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
  AlertTitle,
  Chip,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { CloudDownloadRounded, CheckCircleRounded } from "@mui/icons-material"
import { Trans, useTranslation } from "react-i18next"
import {
  useImportFromUexMutation,
  type UexImportItemResult,
  type UexImportPreviewItem,
  type UexImportSkipReason,
} from "../../../store/api/v2/market"
import { listingApiError } from "../domain/listingFormErrors"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { HelpTip } from "../../help/components/HelpTip"

type TFn = ReturnType<typeof useTranslation>["t"]

/** Why a listing can't be or wasn't imported, for the user. */
function skipReasonLabel(t: TFn, reason: UexImportSkipReason): string {
  switch (reason) {
    case "no_price":
      return t("uexImportUi.skipReasons.no_price")
    case "invalid_price":
      return t("uexImportUi.skipReasons.invalid_price")
    case "invalid_title":
      return t("uexImportUi.skipReasons.invalid_title")
    case "invalid_description":
      return t("uexImportUi.skipReasons.invalid_description")
    case "invalid_quantity":
      return t("uexImportUi.skipReasons.invalid_quantity")
    case "failed":
      return t("uexImportUi.skipReasons.failed")
  }
}

/** Indices of the preview rows that can be imported. */
function importableIndices(preview: UexImportPreviewItem[]): number[] {
  return preview.flatMap((item, i) => (item.skip_reason ? [] : [i]))
}

/**
 * Copies a seller's active UEXCorp sell listings into `shopId`. Titles that
 * name exactly one game item are linked to it by the backend.
 *
 * Listings that can't be imported (e.g. no price on UEX) are shown greyed
 * out with the reason and can't be ticked; the rest still import. Any the
 * backend still skips are listed with their reason after the import.
 */
export function ImportFromUex({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState("")
  const [preview, setPreview] = useState<UexImportPreviewItem[] | null>(null)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [importResult, setImportResult] = useState<{
    imported: number
    total: number
    skipped: UexImportItemResult[]
  } | null>(null)
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
        setSelectedIndices(new Set(importableIndices(result.preview)))
      } else {
        setPreview([])
      }
    } catch (e) {
      setPreview(null)
      setError(
        listingApiError(
          e,
          t(
            "ItemStock.importFromUexFetchError",
            "Couldn't fetch your UEX listings",
          ),
        ).message,
      )
    }
  }

  const handleConfirmImport = async () => {
    if (!preview) return

    const selectedListings = preview
      .filter((item, i) => selectedIndices.has(i) && !item.skip_reason)
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

      setImportResult({
        imported: result.imported || 0,
        total: result.total || 0,
        skipped: (result.results ?? []).filter((r) => r.status === "skipped"),
      })
      setPreview(null)
    } catch (e) {
      setError(
        listingApiError(
          e,
          t("ItemStock.importFromUexError", "The import failed"),
        ).message,
      )
    }
  }

  const importable = preview ? importableIndices(preview) : []
  const allSelected =
    importable.length > 0 && selectedIndices.size === importable.length
  const hasBlocked = !!preview && importable.length < preview.length

  const toggleAll = () => {
    if (!preview) return
    setSelectedIndices(allSelected ? new Set() : new Set(importable))
  }

  const toggleIndex = (index: number) => {
    if (preview?.[index]?.skip_reason) return
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
          severity={importResult.imported > 0 ? "success" : "warning"}
          icon={importResult.imported > 0 ? <CheckCircleRounded /> : undefined}
          sx={{ mb: 2 }}
        >
          <Trans
            i18nKey="uexImportUi.success"
            count={importResult.total}
            values={{ imported: importResult.imported }}
            components={{ strong: <strong /> }}
          />
        </Alert>
        {importResult.skipped.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>{t("uexImportUi.skippedTitle")}</AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {importResult.skipped.map((r) => (
                <li key={r.index}>
                  {r.title}
                  {r.reason && <> — {skipReasonLabel(t, r.reason)}</>}
                </li>
              ))}
            </Box>
          </Alert>
        )}
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
      <FirstUseHint
        hint="uexImport"
        title={t("hints.uexImport.title")}
        sx={{ mb: 2 }}
      >
        {t("hints.uexImport.body")}
      </FirstUseHint>
      <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
        {t("uexImportUi.intro")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label={t("uexImportUi.username")}
          size="small"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetchPreview()}
          disabled={isLoading}
          sx={{ flex: "1 1 200px", maxWidth: 300 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <HelpTip
                  label={t("uexImportUi.username")}
                  title={t("help.tips.uexUsername")}
                />
              </InputAdornment>
            ),
          }}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedIndices.size > 0 && !allSelected}
                  disabled={importable.length === 0}
                  onChange={toggleAll}
                />
              }
              label={t("uexImportUi.selectedOf", {
                count: importable.length,
                selected: selectedIndices.size,
              })}
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

          {hasBlocked && (
            <Alert severity="info" sx={{ mb: 1 }}>
              {t("uexImportUi.someBlocked")}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 400 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>{t("uexImportUi.columns.title")}</TableCell>
                  <TableCell align="right">
                    {t("uexImportUi.columns.price")}
                  </TableCell>
                  <TableCell align="right">
                    {t("uexImportUi.columns.quantity")}
                  </TableCell>
                  <TableCell>{t("uexImportUi.columns.source")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.map((item, index) => {
                  const blocked = !!item.skip_reason
                  return (
                    <TableRow
                      key={index}
                      hover={!blocked}
                      onClick={() => toggleIndex(index)}
                      sx={{
                        cursor: blocked ? "default" : "pointer",
                        opacity: blocked ? 0.6 : 1,
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={!blocked && selectedIndices.has(index)}
                          disabled={blocked}
                          inputProps={{
                            "aria-label": t("uexImportUi.selectItem", {
                              title: item.title,
                            }),
                          }}
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
                        {item.skip_reason && (
                          <Chip
                            label={skipReasonLabel(t, item.skip_reason)}
                            size="small"
                            color="warning"
                            variant="outlined"
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
                  )
                })}
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
      <DialogTitle>
        {t("ItemStock.importFromUex", "Import from UEX")}
      </DialogTitle>
      <DialogContent>
        <ImportFromUex shopId={shopId} />
      </DialogContent>
    </Dialog>
  )
}
