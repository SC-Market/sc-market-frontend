import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import PersonAddRounded from "@mui/icons-material/PersonAddRounded"
import SaveRounded from "@mui/icons-material/SaveRounded"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  useGetStatsQuery,
  useUpdateConfigMutation,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
  type UpdateConfigRequest,
  type MarketVersion,
} from "../../store/api/v2/market"
import { UserSearch } from "../../components/search/UserSearch"
import { useFormatters } from "../../util/format"

interface Props {
  flagName: string
}

export function AdminFeatureFlagDetailView({ flagName }: Props) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const label = flagName.replace(/_/g, " ").replace(/\bv2\b/i, "V2")

  // Config
  const { data: stats } = useGetStatsQuery()
  const flagConfig = stats?.find((s) => s.flag_name === flagName)

  const [updateConfig] = useUpdateConfigMutation()
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null)
  const [localDefault, setLocalDefault] = useState<MarketVersion | null>(null)
  const [localRollout, setLocalRollout] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const enabled = localEnabled ?? flagConfig?.enabled ?? false
  const defaultVersion = localDefault ?? flagConfig?.default_version ?? "V1"
  const rollout = localRollout ?? flagConfig?.rollout_percentage ?? 0
  const hasEdits =
    localEnabled !== null || localDefault !== null || localRollout !== null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates: UpdateConfigRequest = { flag_name: flagName }
      if (localEnabled !== null) updates.enabled = localEnabled
      if (localDefault !== null) updates.default_version = localDefault
      if (localRollout !== null) updates.rollout_percentage = localRollout
      await updateConfig({ updateConfigRequest: updates }).unwrap()
      issueAlert({
        message: t("adminUi.featureFlags.configSaved"),
        severity: "success",
      })
      setLocalEnabled(null)
      setLocalDefault(null)
      setLocalRollout(null)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("adminUi.featureFlags.failed")
      issueAlert({ message, severity: "error" })
    } finally {
      setSaving(false)
    }
  }

  // Overrides for this flag
  const { data: overridesData } = useGetUserOverridesQuery({
    page: 1,
    pageSize: 200,
    flagName,
  })
  const overrides = overridesData?.overrides || []

  const [setUserOverride] = useSetUserOverrideMutation()
  const [removeUserOverride] = useRemoveUserOverrideMutation()
  const [addOpen, setAddOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newEnabled, setNewEnabled] = useState(true)

  const handleAdd = async () => {
    if (!newUsername.trim()) return
    try {
      await setUserOverride({
        setUserOverrideRequest: {
          username: newUsername.trim(),
          flag_name: flagName,
          enabled: newEnabled,
        },
      }).unwrap()
      issueAlert({
        message: t("adminUi.featureFlags.overrideSet", {
          username: newUsername,
        }),
        severity: "success",
      })
      setAddOpen(false)
      setNewUsername("")
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : t("adminUi.featureFlags.userNotFound")
      issueAlert({ message, severity: "error" })
    }
  }

  const handleRemove = async (username: string) => {
    try {
      await removeUserOverride({ username, flagName }).unwrap()
      issueAlert({
        message: t("adminUi.featureFlags.overrideRemoved"),
        severity: "success",
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("adminUi.featureFlags.failed")
      issueAlert({ message, severity: "error" })
    }
  }

  return (
    <Box>
      {/* Config */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textTransform: "capitalize" }}
          >
            {t("adminUi.featureFlags.configurationTitle", { label })}
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>{t("adminUi.featureFlags.enabled")}</Typography>
                <Switch
                  checked={enabled}
                  onChange={(e) => setLocalEnabled(e.target.checked)}
                  inputProps={{
                    "aria-label": t("adminUi.featureFlags.enabled"),
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {t("adminUi.featureFlags.enabledHint")}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="admin-feature-flag-detail-view-default-label">
                  {t("adminUi.featureFlags.default")}
                </InputLabel>
                <Select
                  labelId="admin-feature-flag-detail-view-default-label"
                  value={defaultVersion}
                  label={t("adminUi.featureFlags.default")}
                  onChange={(e) =>
                    setLocalDefault(e.target.value as MarketVersion)
                  }
                >
                  <MenuItem value="V1">
                    {t("adminUi.featureFlags.v1Off")}
                  </MenuItem>
                  <MenuItem value="V2">
                    {t("adminUi.featureFlags.v2On")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" gutterBottom>
                {t("adminUi.featureFlags.rollout", { percent: rollout })}
              </Typography>
              {!enabled && rollout > 0 && (
                <Stack spacing={0.5} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="warning.main">
                    {t("adminUi.featureFlags.notInEffect")}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ alignSelf: "flex-start" }}
                    onClick={() => setLocalEnabled(true)}
                  >
                    {t("adminUi.featureFlags.turnOnEnabled")}
                  </Button>
                </Stack>
              )}
              <Slider
                aria-label={t("adminUi.featureFlags.rolloutPercentage")}
                value={rollout}
                onChange={(_, v) => setLocalRollout(v as number)}
                min={0}
                max={100}
                step={5}
                valueLabelDisplay="auto"
                size="small"
                marks={[
                  { value: 0, label: "0%" },
                  { value: 50, label: "50%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Grid>
            {hasEdits && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? t("adminUi.featureFlags.saving") : t("common.save")}
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Overrides */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">
          {t("adminUi.featureFlags.perUserOverrides")}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAddRounded />}
          onClick={() => setAddOpen(true)}
          size="small"
        >
          {t("adminUi.featureFlags.addOverride")}
        </Button>
      </Stack>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("adminUi.featureFlags.username")}</TableCell>
              <TableCell>{t("adminUi.featureFlags.enabled")}</TableCell>
              <TableCell>{t("adminUi.featureFlags.updated")}</TableCell>
              <TableCell align="right">{t("admin.alerts.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overrides.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    {t("adminUi.featureFlags.noOverrides")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {overrides.map((o) => (
              <TableRow key={o.user_id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {o.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      o.enabled
                        ? t("adminUi.featureFlags.on")
                        : t("adminUi.featureFlags.off")
                    }
                    color={o.enabled ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{fmt.dateTime(o.updated_at)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(o.username)}
                    color="error"
                    aria-label={t("adminUi.featureFlags.removeOverrideFor", {
                      username: o.username,
                    })}
                  >
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add dialog */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {t("adminUi.featureFlags.addOverrideFor", { label })}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <UserSearch
              onUserSelect={(user) => setNewUsername(user.username)}
              placeholder={t("adminUi.featureFlags.searchByUsername")}
            />
            {newUsername && (
              <Chip label={newUsername} onDelete={() => setNewUsername("")} />
            )}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                {t("adminUi.featureFlags.enabled")}
              </Typography>
              <Switch
                checked={newEnabled}
                onChange={(e) => setNewEnabled(e.target.checked)}
                inputProps={{
                  "aria-label": t("adminUi.featureFlags.enabledForUser"),
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddOpen(false)
              setNewUsername("")
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!newUsername.trim()}
          >
            {t("adminUi.featureFlags.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
