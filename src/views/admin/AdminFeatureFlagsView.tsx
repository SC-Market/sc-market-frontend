import React, { useState } from "react"
import {
  Alert,
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
  TextField,
  Typography,
} from "@mui/material"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import PersonAddRounded from "@mui/icons-material/PersonAddRounded"
import SaveRounded from "@mui/icons-material/SaveRounded"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  useGetConfigQuery,
  useUpdateConfigMutation,
  useGetStatsQuery,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
} from "../../store/api/v2/market"

import { UserSearch } from "../../components/search/UserSearch"

// ── Types ────────────────────────────────────────────────────────

interface FeatureFlagConfig {
  flag_name: string
  default_version: "V1" | "V2"
  rollout_percentage: number
  enabled: boolean
}

interface UserOverrideWithName {
  user_id: string
  username: string
  market_version: "V1" | "V2"
  updated_at: string
}

// ── Component ────────────────────────────────────────────────────

export function AdminFeatureFlagsView() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: configData, isLoading: configLoading } = useGetConfigQuery()
  const { data: statsData } = useGetStatsQuery()
  const { data: overridesResult } = useGetUserOverridesQuery({ page: 1, pageSize: 100 })

  const config = (configData as any)?.data || configData
  const stats = (statsData as any)?.data || statsData
  const overridesData = (overridesResult as any)?.data || overridesResult

  const [updateConfigMutation] = useUpdateConfigMutation()
  const [setUserOverride] = useSetUserOverrideMutation()
  const [removeUserOverride] = useRemoveUserOverrideMutation()

  const [localConfig, setLocalConfig] = useState<Partial<FeatureFlagConfig>>({})
  const [saving, setSaving] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newVersion, setNewVersion] = useState<"V1" | "V2">("V2")

  // Sync local state when config loads
  React.useEffect(() => {
    if (config) setLocalConfig(config)
  }, [config])

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await updateConfigMutation({
        updateConfigRequest: {
          default_version: localConfig.default_version,
          rollout_percentage: localConfig.rollout_percentage,
          enabled: localConfig.enabled,
        },
      }).unwrap()
      issueAlert({ message: "Config saved", severity: "success" })
    } catch (e: any) {
      issueAlert({ message: e.message || "Failed to save", severity: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleAddOverride = async () => {
    if (!newUsername.trim()) return
    try {
      await setUserOverride({
        setUserOverrideRequest: { username: newUsername.trim(), market_version: newVersion },
      }).unwrap()
      issueAlert({ message: `Override set for ${newUsername}`, severity: "success" })
      setAddDialogOpen(false)
      setNewUsername("")
    } catch (e: any) {
      issueAlert({ message: e?.data?.message || e.message || "User not found", severity: "error" })
    }
  }

  const handleRemoveOverride = async (username: string) => {
    try {
      await removeUserOverride({ username }).unwrap()
      issueAlert({ message: `Override removed for ${username}`, severity: "success" })
    } catch (e: any) {
      issueAlert({ message: e?.data?.message || e.message || "Failed", severity: "error" })
    }
  }

  return (
    <Box>
      {/* ── Stats Dashboard ─────────────────────────────────── */}
      <Typography variant="h5" gutterBottom>
        {t("admin.featureFlags.dashboard", "Rollout Dashboard")}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Status</Typography>
              <Typography variant="h4">
                <Chip
                  label={stats?.enabled ? "Enabled" : "Disabled"}
                  color={stats?.enabled ? "success" : "default"}
                  size="medium"
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Default Version</Typography>
              <Typography variant="h4">{stats?.default_version ?? "V1"}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Rollout %</Typography>
              <Typography variant="h4">{stats?.rollout_percentage ?? 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">User Overrides</Typography>
              <Typography variant="h4">
                {stats?.v2_overrides ?? 0} V2 / {stats?.v1_overrides ?? 0} V1
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* ── Global Config ───────────────────────────────────── */}
      <Typography variant="h5" gutterBottom>
        {t("admin.featureFlags.globalConfig", "Global Configuration")}
      </Typography>

      {configLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>Enabled</Typography>
                  <Switch
                    checked={localConfig.enabled ?? true}
                    onChange={(e) => setLocalConfig((c: any) => ({ ...c, enabled: e.target.checked }))}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Kill switch — when off, all users get V1
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Default Version</InputLabel>
                  <Select
                    value={localConfig.default_version ?? "V1"}
                    label="Default Version"
                    onChange={(e) => setLocalConfig((c: any) => ({ ...c, default_version: e.target.value as "V1" | "V2" }))}
                  >
                    <MenuItem value="V1">V1 (Production)</MenuItem>
                    <MenuItem value="V2">V2 (New)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Typography gutterBottom>
                  Rollout: {localConfig.rollout_percentage ?? 0}%
                </Typography>
                <Slider
                  value={localConfig.rollout_percentage ?? 0}
                  onChange={(_, v) => setLocalConfig((c: any) => ({ ...c, rollout_percentage: v as number }))}
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 25, label: "25%" },
                    { value: 50, label: "50%" },
                    { value: 100, label: "100%" },
                  ]}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  % of users without overrides who get V2 (deterministic by user ID)
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={handleSaveConfig}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* ── Per-User Overrides ──────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          {t("admin.featureFlags.overrides", "Per-User Overrides")}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAddRounded />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Override
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Users with overrides bypass the global config and rollout percentage.
      </Typography>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overridesData?.overrides.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No per-user overrides. All users follow global config.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {overridesData?.overrides.map((o: UserOverrideWithName) => (
              <TableRow key={o.user_id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{o.username}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={o.market_version}
                    color={o.market_version === "V2" ? "secondary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(o.updated_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleRemoveOverride(o.username)} color="error">
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add Override Dialog ──────────────────────────────── */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add User Override</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <UserSearch
              onUserSelect={(user) => setNewUsername(user.username)}
              placeholder="Search by username"
            />
            {newUsername && (
              <Chip label={newUsername} onDelete={() => setNewUsername("")} />
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Version</InputLabel>
              <Select
                value={newVersion}
                label="Version"
                onChange={(e) => setNewVersion(e.target.value as "V1" | "V2")}
              >
                <MenuItem value="V1">V1</MenuItem>
                <MenuItem value="V2">V2</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddDialogOpen(false); setNewUsername("") }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOverride} disabled={!newUsername.trim()}>
            Add Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
