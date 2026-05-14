/**
 * Admin: Supplier Roster
 * Lets admin users manage their supplier relationships — add, tier, remove.
 * Gated to admin role via SiteAdminRoute in App.tsx.
 * Will be moved to /seller/suppliers once the feature is stable.
 */

import React, { useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  PersonRounded,
  BusinessRounded,
} from "@mui/icons-material"
import {
  useGetMySuppliersQuery,
  useGetMyAggregatorsQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useRemoveSupplierMutation,
} from "../../store/api/v2/market"
import type {
  SupplierRelationship,
  SupplierTier,
  SupplierStatus,
} from "../../store/api/v2/market"

const TIER_COLORS: Record<string, "success" | "primary" | "warning" | "default"> = {
  preferred: "success",
  approved: "primary",
  restricted: "warning",
}
const TIER_LABELS: Record<string, string> = {
  preferred: "Preferred",
  approved: "Approved",
  restricted: "Restricted",
}
const STATUS_COLORS: Record<string, "success" | "default" | "error"> = {
  active: "success",
  suspended: "default",
  removed: "error",
}

// ---------------------------------------------------------------------------
// Add Supplier Dialog
// ---------------------------------------------------------------------------

function AddSupplierDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [addSupplier, { isLoading, error }] = useAddSupplierMutation()
  const [kind, setKind] = useState<"user" | "contractor">("user")
  const [id, setId] = useState("")
  const [tier, setTier] = useState<SupplierTier | "">("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async () => {
    try {
      await addSupplier({
        addSupplierRequest: {
          supplier_id: kind === "user" ? id : undefined,
          supplier_contractor_id: kind === "contractor" ? id : undefined,
          tier: (tier as SupplierTier) || undefined,
          notes: notes || undefined,
        },
      }).unwrap()
      setId("")
      setTier("")
      setNotes("")
      onClose()
    } catch {}
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Supplier type</InputLabel>
            <Select
              value={kind}
              label="Supplier type"
              onChange={(e) => setKind(e.target.value as "user" | "contractor")}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="contractor">Organisation</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={kind === "user" ? "User UUID" : "Contractor UUID"}
            placeholder={kind === "user" ? "user_id (UUID)" : "contractor_id (UUID)"}
            value={id}
            onChange={(e) => setId(e.target.value)}
            fullWidth
            helperText="Paste the UUID from the user/org profile"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Tier (optional)</InputLabel>
            <Select
              value={tier}
              label="Tier (optional)"
              onChange={(e) => setTier(e.target.value as SupplierTier)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="preferred">Preferred</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Notes (optional)"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          {error && (
            <Alert severity="error">
              {(error as any)?.data?.message || "Failed to add supplier"}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!id || isLoading}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Edit Supplier Dialog
// ---------------------------------------------------------------------------

function EditSupplierDialog({
  rel,
  onClose,
}: {
  rel: SupplierRelationship | null
  onClose: () => void
}) {
  const [updateSupplier, { isLoading, error }] = useUpdateSupplierMutation()
  const [tier, setTier] = useState<SupplierTier | "">(rel?.tier || "")
  const [notes, setNotes] = useState(rel?.notes || "")
  const [status, setStatus] = useState<SupplierStatus>(rel?.status || "active")

  React.useEffect(() => {
    if (rel) {
      setTier(rel.tier || "")
      setNotes(rel.notes || "")
      setStatus(rel.status)
    }
  }, [rel])

  const handleSave = async () => {
    if (!rel) return
    try {
      await updateSupplier({
        relationshipId: rel.relationship_id,
        updateSupplierRequest: {
          tier: (tier as SupplierTier) || null,
          notes: notes || null,
          status,
        },
      }).unwrap()
      onClose()
    } catch {}
  }

  return (
    <Dialog open={!!rel} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32 }}>
              {rel?.supplier.kind === "contractor" ? (
                <BusinessRounded fontSize="small" />
              ) : (
                <PersonRounded fontSize="small" />
              )}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{rel?.supplier.display_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {rel?.supplier.username}
              </Typography>
            </Box>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Tier</InputLabel>
            <Select
              value={tier}
              label="Tier"
              onChange={(e) => setTier(e.target.value as SupplierTier)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="preferred">Preferred</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as SupplierStatus)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="removed">Removed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Notes"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          {error && (
            <Alert severity="error">
              {(error as any)?.data?.message || "Failed to update supplier"}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Supplier Table Row
// ---------------------------------------------------------------------------

function SupplierRow({
  rel,
  onEdit,
  onRemove,
}: {
  rel: SupplierRelationship
  onEdit: (r: SupplierRelationship) => void
  onRemove: (r: SupplierRelationship) => void
}) {
  const { supplier } = rel
  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={supplier.avatar || undefined}
            sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
          >
            {supplier.kind === "contractor" ? (
              <BusinessRounded fontSize="small" />
            ) : (
              supplier.display_name?.[0]?.toUpperCase()
            )}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {supplier.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{supplier.username}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Chip
          label={supplier.kind === "contractor" ? "Org" : "User"}
          size="small"
          variant="outlined"
          icon={
            supplier.kind === "contractor" ? (
              <BusinessRounded />
            ) : (
              <PersonRounded />
            )
          }
        />
      </TableCell>
      <TableCell>
        {rel.tier ? (
          <Chip
            label={TIER_LABELS[rel.tier]}
            size="small"
            color={TIER_COLORS[rel.tier] || "default"}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Chip
          label={rel.status}
          size="small"
          color={STATUS_COLORS[rel.status] || "default"}
          variant={rel.status === "active" ? "filled" : "outlined"}
        />
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {rel.notes || "—"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(rel.created_at).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(rel)}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(rel)}
            >
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AdminSupplierRoster() {
  const [tab, setTab] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editRel, setEditRel] = useState<SupplierRelationship | null>(null)
  const [removeSupplier] = useRemoveSupplierMutation()

  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetMySuppliersQuery({})
  const { data: aggregatorsData, isLoading: aggregatorsLoading } =
    useGetMyAggregatorsQuery({})

  const suppliers = suppliersData?.suppliers || []
  const aggregators = aggregatorsData?.suppliers || []

  const handleRemove = async (rel: SupplierRelationship) => {
    if (
      !window.confirm(
        `Remove ${rel.supplier.display_name} from your roster?`,
      )
    )
      return
    await removeSupplier({ relationshipId: rel.relationship_id })
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Supplier Roster
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your trusted suppliers. Preferred suppliers get priority
            visibility on targeted buy orders.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setAddOpen(true)}
        >
          Add Supplier
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label={`My Suppliers (${suppliers.length})`} />
        <Tab label={`I'm a Supplier For (${aggregators.length})`} />
      </Tabs>

      {tab === 0 && (
        <Paper>
          {suppliersLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">Loading…</Typography>
            </Box>
          ) : suppliers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" gutterBottom>
                No suppliers yet.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => setAddOpen(true)}
              >
                Add your first supplier
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((rel) => (
                  <SupplierRow
                    key={rel.relationship_id}
                    rel={rel}
                    onEdit={setEditRel}
                    onRemove={handleRemove}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {tab === 1 && (
        <Paper>
          {aggregatorsLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">Loading…</Typography>
            </Box>
          ) : aggregators.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                You're not on anyone's supplier roster yet.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Aggregator</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Tier they assigned you</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Their notes</TableCell>
                  <TableCell>Since</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {aggregators.map((rel) => (
                  <TableRow key={rel.relationship_id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                          {rel.aggregator.display_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {rel.aggregator.display_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{rel.aggregator.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rel.aggregator.kind === "contractor" ? "Org" : "User"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {rel.tier ? (
                        <Chip
                          label={TIER_LABELS[rel.tier]}
                          size="small"
                          color={TIER_COLORS[rel.tier] || "default"}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rel.status}
                        size="small"
                        color={STATUS_COLORS[rel.status] || "default"}
                        variant={rel.status === "active" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {rel.notes || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(rel.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <AddSupplierDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditSupplierDialog rel={editRel} onClose={() => setEditRel(null)} />
    </Box>
  )
}
