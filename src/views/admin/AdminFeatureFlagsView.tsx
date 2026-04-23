import React, { useState } from "react"
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
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  useGetStatsQuery,
  useUpdateConfigMutation,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
} from "../../store/api/v2/market"
import { UserSearch } from "../../components/search/UserSearch"

export function AdminFeatureFlagsView() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const { data: statsRaw } = useGetStatsQuery()
  const { data: overridesRaw } = useGetUserOverridesQuery({ page: 1, pageSize: 100 })
  const [updateConfig] = useUpdateConfigMutation()
  const [setUserOverride] = useSetUserOverrideMutation()
  const [removeUserOverride] = useRemoveUserOverrideMutation()

  const stats = ((statsRaw as any)?.data || statsRaw) as any[] | undefined
  const overridesData = (overridesRaw as any)?.data || overridesRaw

  // Local edits per flag
  const [edits, setEdits] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)

  // Add override dialog
  const [addOpen, setAddOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newFlagName, setNewFlagName] = useState("market_v2")
  const [newEnabled, setNewEnabled] = useState(true)

  const flagNames = (stats || []).map((s: any) => s.flag_name)

  const handleSaveFlag = async (flagName: string) => {
    const e = edits[flagName]
    if (!e) return
    setSaving(flagName)
    try {
      await updateConfig({
        updateConfigRequest: { flag_name: flagName, ...e },
      }).unwrap()
      issueAlert({ message: `${flagName} config saved`, severity: "success" })
      setEdits((prev) => { const n = { ...prev }; delete n[flagName]; return n })
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed to save", severity: "error" })
    } finally {
      setSaving(null)
    }
  }

  const handleAddOverride = async () => {
    if (!newUsername.trim()) return
    try {
      await setUserOverride({
        setUserOverrideRequest: { username: newUsername.trim(), flag_name: newFlagName, enabled: newEnabled },
      }).unwrap()
      issueAlert({ message: `Override set for ${newUsername} (${newFlagName}=${newEnabled})`, severity: "success" })
      setAddOpen(false)
      setNewUsername("")
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "User not found", severity: "error" })
    }
  }

  const handleRemoveOverride = async (username: string, flagName?: string) => {
    try {
      await removeUserOverride({ username, flagName }).unwrap()
      issueAlert({ message: `Override removed for ${username}`, severity: "success" })
    } catch (err: any) {
      issueAlert({ message: err?.data?.message || "Failed", severity: "error" })
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Feature Flags</Typography>

      {/* ── Per-Flag Config Cards ─────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(stats || []).map((flag: any) => {
          const e = edits[flag.flag_name] || {}
          const enabled = e.enabled ?? flag.enabled
          const defaultVersion = e.default_version ?? flag.default_version
          const rollout = e.rollout_percentage ?? flag.rollout_percentage
          const hasEdits = Object.keys(e).length > 0
          const label = flag.flag_name.replace(/_/g, " ").replace(/\bv2\b/i, "V2")

          return (
            <Grid item xs={12} md={4} key={flag.flag_name}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ textTransform: "capitalize" }}>{label}</Typography>
                    <Switch
                      checked={enabled}
                      onChange={(ev) => setEdits((p) => ({ ...p, [flag.flag_name]: { ...e, enabled: ev.target.checked } }))}
                    />
                  </Stack>

                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Default</InputLabel>
                    <Select
                      value={defaultVersion}
                      label="Default"
                      onChange={(ev) => setEdits((p) => ({ ...p, [flag.flag_name]: { ...e, default_version: ev.target.value } }))}
                    >
                      <MenuItem value="V1">V1</MenuItem>
                      <MenuItem value="V2">V2</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="body2" gutterBottom>Rollout: {rollout}%</Typography>
                  <Slider
                    value={rollout}
                    onChange={(_, v) => setEdits((p) => ({ ...p, [flag.flag_name]: { ...e, rollout_percentage: v as number } }))}
                    min={0} max={100} step={5}
                    marks={[{ value: 0, label: "0%" }, { value: 50, label: "50%" }, { value: 100, label: "100%" }]}
                    valueLabelDisplay="auto"
                    size="small"
                  />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {flag.override_count} overrides ({flag.enabled_overrides} on / {flag.disabled_overrides} off)
                    </Typography>
                    {hasEdits && (
                      <Button
                        size="small" variant="contained" startIcon={<SaveRounded />}
                        onClick={() => handleSaveFlag(flag.flag_name)}
                        disabled={saving === flag.flag_name}
                      >
                        Save
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* ── Per-User Overrides ──────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Per-User Overrides</Typography>
        <Button variant="outlined" startIcon={<PersonAddRounded />} onClick={() => setAddOpen(true)}>
          Add Override
        </Button>
      </Stack>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Flag</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!overridesData?.overrides || overridesData.overrides.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>No overrides</Typography>
                </TableCell>
              </TableRow>
            )}
            {overridesData?.overrides?.map((o: any, i: number) => (
              <TableRow key={`${o.user_id}-${o.flag_name}-${i}`}>
                <TableCell><Typography variant="body2" fontWeight="bold">{o.username}</Typography></TableCell>
                <TableCell><Chip label={o.flag_name} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Chip label={o.enabled ? "ON" : "OFF"} color={o.enabled ? "success" : "default"} size="small" />
                </TableCell>
                <TableCell>{new Date(o.updated_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleRemoveOverride(o.username, o.flag_name)} color="error">
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add Override Dialog ──────────────────────────────── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add User Override</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <UserSearch onUserSelect={(user) => setNewUsername(user.username)} placeholder="Search by username" />
            {newUsername && <Chip label={newUsername} onDelete={() => setNewUsername("")} />}
            <FormControl fullWidth size="small">
              <InputLabel>Version</InputLabel>
              <Select value={newVersion} label="Version" onChange={(ev) => setNewVersion(ev.target.value as "V1" | "V2")}>
                <MenuItem value="V1">V1</MenuItem>
                <MenuItem value="V2">V2</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddOpen(false); setNewUsername("") }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOverride} disabled={!newUsername.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
