import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import {
  useGetStatsQuery,
  useGetUserOverridesQuery,
  type MarketVersion,
} from "../../store/api/v2/market"
import {
  useFlagUserOverride,
  useSaveFlagConfig,
} from "../../features/admin/hooks/useFeatureFlagAdmin"
import { UserSearch } from "../../components/search/UserSearch"
import { useFormatters } from "../../util/format"
import AddRounded from "@mui/icons-material/AddRounded"

interface Props {
  flagName: string
}

export function AdminFeatureFlagDetailView({ flagName }: Props) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const label = flagName.replace(/_/g, " ").replace(/\bv2\b/i, "V2")

  // Config
  const { data: stats } = useGetStatsQuery()
  const flagConfig = stats?.find((s) => s.flag_name === flagName)

  const { save, saving } = useSaveFlagConfig(flagName)
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null)
  const [localDefault, setLocalDefault] = useState<MarketVersion | null>(null)
  const [localRollout, setLocalRollout] = useState<number | null>(null)

  const enabled = localEnabled ?? flagConfig?.enabled ?? false
  const defaultVersion = localDefault ?? flagConfig?.default_version ?? "V1"
  const rollout = localRollout ?? flagConfig?.rollout_percentage ?? 0
  const hasEdits =
    localEnabled !== null || localDefault !== null || localRollout !== null

  const handleSave = async () => {
    const saved = await save({
      enabled: localEnabled,
      default_version: localDefault,
      rollout_percentage: localRollout,
    })
    if (saved) {
      setLocalEnabled(null)
      setLocalDefault(null)
      setLocalRollout(null)
    }
  }

  // Overrides for this flag
  const { data: overridesData } = useGetUserOverridesQuery({
    page: 1,
    pageSize: 200,
    flagName,
  })
  const overrides = overridesData?.overrides || []

  const userOverride = useFlagUserOverride(flagName)
  const [addOpen, setAddOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newEnabled, setNewEnabled] = useState(true)

  const handleAdd = async () => {
    if (!newUsername.trim()) return
    if (await userOverride.set(newUsername, newEnabled)) {
      setAddOpen(false)
      setNewUsername("")
    }
  }

  const handleRemove = (username: string) => userOverride.remove(username)

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
          startIcon={<AddRounded />}
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
      <ResponsiveDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("adminUi.featureFlags.addOverrideFor", { label })}
        maxWidth="xs"
        actions={
          <>
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
          </>
        }
      >
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
      </ResponsiveDialog>
    </Box>
  )
}
