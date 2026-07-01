import React, { useState } from "react"
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from "@mui/material"
import {
  Sync as SyncIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  LinkOff as DisconnectIcon,
  Check as CheckIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetScmdbStatusQuery,
  useConnectScmdbMutation,
  useRegenerateScmdbMutation,
  useDisconnectScmdbMutation,
} from "../api/scmdbApi"

export function ScmdbSyncSettings() {
  const { t } = useTranslation()
  const { data: status, isLoading } = useGetScmdbStatusQuery()
  const [connect, { isLoading: isConnecting }] = useConnectScmdbMutation()
  const [regenerate, { isLoading: isRegenerating }] = useRegenerateScmdbMutation()
  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectScmdbMutation()

  const [copied, setCopied] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)

  const handleConnect = async () => {
    await connect()
  }

  const handleCopy = async () => {
    if (status?.ingest_url) {
      await navigator.clipboard.writeText(status.ingest_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = async () => {
    await regenerate()
    setRegenerateDialogOpen(false)
  }

  const handleDisconnect = async () => {
    await disconnect()
    setDisconnectDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={200} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SyncIcon />
          <Typography variant="h6">
            {t("settings.scmdb.title", "SCMDB Sync")}
          </Typography>
          <Chip
            size="small"
            label={status?.is_connected
              ? t("settings.scmdb.connected", "Connected")
              : t("settings.scmdb.notConnected", "Not connected")}
            color={status?.is_connected ? "success" : "default"}
          />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            "settings.scmdb.description",
            "Connect your SCMDB account to automatically sync blueprint ownership to SC Market. When you mark a blueprint as owned in SCMDB, it will be reflected here.",
          )}
        </Alert>

        <Alert severity="warning">
          {t(
            "settings.scmdb.snapshotWarning",
            "Connecting SCMDB with the snapshot event enabled will replace your current blueprint tracking on SC Market with SCMDB's data. Blueprints tracked only on SC Market will be marked as unowned.",
          )}
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            {status?.is_connected ? (
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t("settings.scmdb.ingestUrl", "Paste this URL into SCMDB → Profile → Sync Sinks:")}
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  value={status.ingest_url || ""}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCopy} size="small">
                            {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {status.last_event_at && (
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.scmdb.lastEvent", "Last event received:")}{" "}
                    {new Date(status.last_event_at).toLocaleString()}
                  </Typography>
                )}

                {!status.last_event_at && (
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.scmdb.noEvents", "No events received yet. Add the URL to SCMDB to start syncing.")}
                  </Typography>
                )}

                <Box display="flex" gap={1} mt={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => setRegenerateDialogOpen(true)}
                    disabled={isRegenerating}
                  >
                    {t("settings.scmdb.regenerate", "Regenerate Token")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DisconnectIcon />}
                    onClick={() => setDisconnectDialogOpen(true)}
                    disabled={isDisconnecting}
                  >
                    {t("settings.scmdb.disconnect", "Disconnect")}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    "settings.scmdb.connectPrompt",
                    "Generate a sync token to connect your SCMDB account. You'll get a URL to paste into SCMDB's Sync Sinks settings.",
                  )}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SyncIcon />}
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {t("settings.scmdb.connect", "Connect SCMDB")}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Regenerate confirmation dialog */}
      <Dialog open={regenerateDialogOpen} onClose={() => setRegenerateDialogOpen(false)}>
        <DialogTitle>{t("settings.scmdb.regenerateTitle", "Regenerate Token?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "settings.scmdb.regenerateWarning",
              "This will invalidate your current URL. You'll need to update it in SCMDB.",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)}>
            {t("ui.cancel", "Cancel")}
          </Button>
          <Button onClick={handleRegenerate} color="primary" disabled={isRegenerating}>
            {t("settings.scmdb.regenerate", "Regenerate Token")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect confirmation dialog */}
      <Dialog open={disconnectDialogOpen} onClose={() => setDisconnectDialogOpen(false)}>
        <DialogTitle>{t("settings.scmdb.disconnectTitle", "Disconnect SCMDB?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "settings.scmdb.disconnectWarning",
              "SCMDB will no longer be able to sync blueprints to SC Market. Your current blueprint inventory will not be affected.",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisconnectDialogOpen(false)}>
            {t("ui.cancel", "Cancel")}
          </Button>
          <Button onClick={handleDisconnect} color="error" disabled={isDisconnecting}>
            {t("settings.scmdb.disconnect", "Disconnect")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
