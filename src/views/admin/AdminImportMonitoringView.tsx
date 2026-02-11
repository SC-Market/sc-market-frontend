import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useImportGameItemAttributesMutation } from "../../store/api/attributes"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { AdminIcons } from "../../components/icons"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

interface ImportJobResult {
  gameItemId: string
  timestamp: Date
  success: boolean
  attributesImported: number
  errors: string[]
  message: string
}

export function AdminImportMonitoringView() {
  const { t } = useTranslation()
  const [gameItemId, setGameItemId] = useState<string>("")
  const [importHistory, setImportHistory] = useState<ImportJobResult[]>([])

  const [importAttributes, { isLoading: isImporting }] =
    useImportGameItemAttributesMutation()

  const issueAlert = useAlertHook()

  const handleImport = () => {
    if (!gameItemId.trim()) {
      issueAlert({
        message: t(
          "admin.importMonitoring.emptyId",
          "Please enter a game item ID",
        ),
        severity: "error",
      })
      return
    }

    const itemId = gameItemId.trim()

    importAttributes(itemId)
      .unwrap()
      .then((result) => {
        // Add to history
        const jobResult: ImportJobResult = {
          gameItemId: itemId,
          timestamp: new Date(),
          success: result.success,
          attributesImported: result.attributesImported,
          errors: result.errors,
          message: result.message,
        }

        setImportHistory((prev) => [jobResult, ...prev])

        if (result.success) {
          issueAlert({
            message: result.message,
            severity: "success",
          })
        } else {
          issueAlert({
            message: result.message,
            severity: "warning",
          })
        }

        // Clear input on success
        setGameItemId("")
      })
      .catch((error) => {
        // Add failed job to history
        const jobResult: ImportJobResult = {
          gameItemId: itemId,
          timestamp: new Date(),
          success: false,
          attributesImported: 0,
          errors: [error?.data?.message || "Import failed"],
          message: "Import failed",
        }

        setImportHistory((prev) => [jobResult, ...prev])
        issueAlert(error)
      })
  }

  const handleRetry = (gameItemId: string) => {
    setGameItemId(gameItemId)
    // Trigger import after setting the ID
    setTimeout(() => {
      handleImport()
    }, 100)
  }

  return (
    <>
      <Grid
        item
        container
        xs={12}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <HeaderTitle xs={12}>
          {t("admin.importMonitoring.title", "Import Job Monitoring")}
        </HeaderTitle>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("admin.importMonitoring.triggerImport", "Trigger Import")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              fullWidth
              label={t("admin.importMonitoring.gameItemId", "Game Item ID")}
              value={gameItemId}
              onChange={(e) => setGameItemId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isImporting) {
                  handleImport()
                }
              }}
              placeholder="Enter game item UUID"
              disabled={isImporting}
            />
            <Button
              variant="contained"
              startIcon={
                isImporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AdminIcons.CloudDownload />
                )
              }
              onClick={handleImport}
              disabled={isImporting}
              sx={{ minWidth: 140 }}
            >
              {isImporting
                ? t("admin.importMonitoring.importing", "Importing...")
                : t("admin.importMonitoring.import", "Import")}
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {t(
              "admin.importMonitoring.importHelp",
              "Import attributes from external sources (finder.cstone.space, UEXCorp.space)",
            )}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("admin.importMonitoring.history", "Import History")}
        </Typography>

        {importHistory.length === 0 && (
          <Alert severity="info">
            {t(
              "admin.importMonitoring.noHistory",
              "No import jobs have been run in this session. Trigger an import to see results here.",
            )}
          </Alert>
        )}

        {importHistory.map((job, index) => (
          <Paper
            key={`${job.gameItemId}-${job.timestamp.getTime()}`}
            sx={{ p: 2, mb: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  {job.success ? (
                    <AdminIcons.CheckCircle color="success" />
                  ) : job.attributesImported > 0 ? (
                    <AdminIcons.Warning color="warning" />
                  ) : (
                    <AdminIcons.Error color="error" />
                  )}
                  <Typography variant="h6">
                    {t("admin.importMonitoring.gameItem", "Game Item")}:{" "}
                    {job.gameItemId}
                  </Typography>
                  <Chip
                    label={
                      job.success
                        ? t("admin.importMonitoring.success", "Success")
                        : job.attributesImported > 0
                          ? t("admin.importMonitoring.partial", "Partial")
                          : t("admin.importMonitoring.failed", "Failed")
                    }
                    color={
                      job.success
                        ? "success"
                        : job.attributesImported > 0
                          ? "warning"
                          : "error"
                    }
                    size="small"
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {t("admin.importMonitoring.timestamp", "Time")}:{" "}
                  {job.timestamp.toLocaleString()}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t(
                    "admin.importMonitoring.attributesImported",
                    "Attributes Imported",
                  )}
                  : {job.attributesImported}
                </Typography>

                {job.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      {t("admin.importMonitoring.errors", "Errors")}:
                    </Typography>
                    {job.errors.map((error, errorIndex) => (
                      <Alert key={errorIndex} severity="error" sx={{ mb: 1 }}>
                        {error}
                      </Alert>
                    ))}
                  </Box>
                )}
              </Box>

              {!job.success && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleRetry(job.gameItemId)}
                  disabled={isImporting}
                >
                  {t("admin.importMonitoring.retry", "Retry")}
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Grid>
    </>
  )
}
