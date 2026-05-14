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
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  useGetStatsQuery,
  useUpdateConfigMutation,
  useGetUserOverridesQuery,
  useSetUserOverrideMutation,
  useRemoveUserOverrideMutation,
  type UpdateConfigRequest,
} from "../../store/api/v2/market"
import { UserSearch } from "../../components/search/UserSearch"

interface Props {
  flagName: string
}

export function AdminFeatureFlagDetailView({ flagName }: Props) {
  const issueAlert = useAlertHook()
  const label = flagName.replace(/_/g, " ").replace(/\bv2\b/i, "V2")

  // Config
  const { data: stats } = useGetStatsQuery()
  const flagConfig = stats?.find((s) => s.flag_name === flagName)

  const [updateConfig] = useUpdateConfigMutation()
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null)
  const [localDefault, setLocalDefault] = useState<string | null>(null)
  const [localRollout, setLocalRollout] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const enabled = localEnabled ?? flagConfig?.enabled ?? false
  const defaultVersion = localDefault ?? flagConfig?.default_version ?? "V1"
  const rollout = localRollout ?? flagConfig?.rollout_percentage ?? 0
  const hasEdits = localEnabled !== null || localDefault !== null || localRollout !== null

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates: UpdateConfigRequest = { flag_name: flagName }
      if (localEnabled !== null) updates.enabled = localEnabled
      if (localDefault !== null) updates.default_version = localDefault
      if (localRollout !== null) updates.rollout_percentage = localRollout
      await updateConfig({ updateConfigRequest: updates }).unwrap()
      issueAlert({ message: "Config saved", severity: "success" })
      setLocalEnabled(null); setLocalDefault(null); setLocalRollout(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed"
      issueAlert({ message, severity: "error" })
    } finally { setSaving(false) }
  }

  // Overrides for this flag
  const { data: overridesData } = useGetUserOverridesQuery({ page: 1, pageSize: 200, flagName })
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
        setUserOverrideRequest: { username: newUsername.trim(), flag_name: flagName, enabled: newEnabled },
      }).unwrap()
      issueAlert({ message: `Override set for ${newUsername}`, severity: "success" })
      setAddOpen(false); setNewUsername("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "User not found"
      issueAlert({ message, severity: "error" })
    }
  }

  const handleRemove = async (username: string) => {
    try {
      await removeUserOverride({ username, flagName }).unwrap()
      issueAlert({ message: `Override removed`, severity: "success" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed"
      issueAlert({ message, severity: "error" })
    }
  }

  return (
    <Box>
      {/* Config */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ textTransform: "capitalize" }}>{label} Configuration</Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>Enabled</Typography>
                <Switch checked={enabled} onChange={(e) => setLocalEnabled(e.target.checked)} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                When off, all users get the old experience
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Default</InputLabel>
                <Select value={defaultVersion} label="Default" onChange={(e) => setLocalDefault(e.target.value)}>
                  <MenuItem value="V1">V1 (Off)</MenuItem>
                  <MenuItem value="V2">V2 (On)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" gutterBottom>Rollout: {rollout}%</Typography>
              <Slider
                value={rollout} onChange={(_, v) => setLocalRollout(v as number)}
                min={0} max={100} step={5} valueLabelDisplay="auto" size="small"
                marks={[{ value: 0, label: "0%" }, { value: 50, label: "50%" }, { value: 100, label: "100%" }]}
              />
            </Grid>
            {hasEdits && (
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Overrides */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Per-User Overrides</Typography>
        <Button variant="outlined" startIcon={<PersonAddRounded />} onClick={() => setAddOpen(true)} size="small">
          Add Override
        </Button>
      </Stack>

      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overrides.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No overrides for this flag. All users follow global config.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {overrides.map((o) => (
              <TableRow key={o.user_id}>
                <TableCell><Typography variant="body2" fontWeight="bold">{o.username}</Typography></TableCell>
                <TableCell><Chip label={o.enabled ? "ON" : "OFF"} color={o.enabled ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{new Date(o.updated_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleRemove(o.username)} color="error">
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Override for {label}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <UserSearch onUserSelect={(user) => setNewUsername(user.username)} placeholder="Search by username" />
            {newUsername && <Chip label={newUsername} onDelete={() => setNewUsername("")} />}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Enabled</Typography>
              <Switch checked={newEnabled} onChange={(e) => setNewEnabled(e.target.checked)} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddOpen(false); setNewUsername("") }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={!newUsername.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
