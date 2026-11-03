/**
 * Admin: Supplier Roster
 * Lets admin users manage their supplier relationships — add, tier, remove.
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
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
import { useTranslation } from "react-i18next"
import { usePageReady } from "../../components/metadata/PageReady"
import { useFormatters } from "../../util/format"

const TIER_COLORS: Record<string, "success" | "primary" | "warning" | "default"> = {
  preferred: "success",
  approved: "primary",
  restricted: "warning",
}
const TIER_LABEL_KEYS: Record<string, string> = {
  preferred: "suppliersUi.tiers.preferred",
  approved: "suppliersUi.tiers.approved",
  restricted: "suppliersUi.tiers.restricted",
}
const STATUS_LABEL_KEYS: Record<string, string> = {
  active: "suppliersUi.roster.statusChip.active",
  suspended: "suppliersUi.roster.statusChip.suspended",
  removed: "suppliersUi.roster.statusChip.removed",
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
  const { t } = useTranslation()
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
      <DialogTitle>{t("suppliersUi.roster.addSupplier")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="admin-supplier-roster-supplier-type-label">
              {t("suppliersUi.roster.supplierType")}
            </InputLabel>
            <Select labelId="admin-supplier-roster-supplier-type-label"
              value={kind}
              label={t("suppliersUi.roster.supplierType")}
              onChange={(e) => setKind(e.target.value as "user" | "contractor")}
            >
              <MenuItem value="user">{t("suppliersUi.kind.user")}</MenuItem>
              <MenuItem value="contractor">{t("suppliersUi.kind.organisation")}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={
              kind === "user"
                ? t("suppliersUi.roster.userUuid")
                : t("suppliersUi.roster.contractorUuid")
            }
            placeholder={kind === "user" ? "user_id (UUID)" : "contractor_id (UUID)"}
            value={id}
            onChange={(e) => setId(e.target.value)}
            fullWidth
            helperText={t("suppliersUi.roster.uuidHelper")}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="admin-supplier-roster-tier-optional-label">{t("suppliersUi.roster.tierOptional")}</InputLabel>
            <Select labelId="admin-supplier-roster-tier-optional-label"
              value={tier}
              label={t("suppliersUi.roster.tierOptional")}
              onChange={(e) => setTier(e.target.value as SupplierTier)}
            >
              <MenuItem value="">{t("common.none")}</MenuItem>
              <MenuItem value="preferred">{t("suppliersUi.tiers.preferred")}</MenuItem>
              <MenuItem value="approved">{t("suppliersUi.tiers.approved")}</MenuItem>
              <MenuItem value="restricted">{t("suppliersUi.tiers.restricted")}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t("suppliersUi.roster.notesOptional")}
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          {error && (
            <Alert severity="error">
              {(error && "data" in error && (error.data as { message?: string })?.message) || t("suppliersUi.roster.addFailed")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!id || isLoading}
        >
          {t("suppliersUi.roster.add")}
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
  const { t } = useTranslation()
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
      <DialogTitle>{t("suppliersUi.roster.editSupplier")}</DialogTitle>
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
            <InputLabel id="admin-supplier-roster-tier-label">{t("suppliersUi.roster.tier")}</InputLabel>
            <Select labelId="admin-supplier-roster-tier-label"
              value={tier}
              label={t("suppliersUi.roster.tier")}
              onChange={(e) => setTier(e.target.value as SupplierTier)}
            >
              <MenuItem value="">{t("common.none")}</MenuItem>
              <MenuItem value="preferred">{t("suppliersUi.tiers.preferred")}</MenuItem>
              <MenuItem value="approved">{t("suppliersUi.tiers.approved")}</MenuItem>
              <MenuItem value="restricted">{t("suppliersUi.tiers.restricted")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="admin-supplier-roster-status-label">{t("suppliersUi.roster.status")}</InputLabel>
            <Select labelId="admin-supplier-roster-status-label"
              value={status}
              label={t("suppliersUi.roster.status")}
              onChange={(e) => setStatus(e.target.value as SupplierStatus)}
            >
              <MenuItem value="active">{t("suppliersUi.roster.statusOption.active")}</MenuItem>
              <MenuItem value="suspended">{t("suppliersUi.roster.statusOption.suspended")}</MenuItem>
              <MenuItem value="removed">{t("suppliersUi.roster.statusOption.removed")}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t("suppliersUi.roster.notes")}
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          {error && (
            <Alert severity="error">
              {(error && "data" in error && (error.data as { message?: string })?.message) || t("suppliersUi.roster.updateFailed")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={isLoading}>
          {t("common.save")}
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
  const fmt = useFormatters()
  const { t } = useTranslation()
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
          label={
            supplier.kind === "contractor"
              ? t("suppliersUi.kind.org")
              : t("suppliersUi.kind.user")
          }
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
            label={t(TIER_LABEL_KEYS[rel.tier] ?? rel.tier)}
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
          label={
            STATUS_LABEL_KEYS[rel.status]
              ? t(STATUS_LABEL_KEYS[rel.status])
              : rel.status
          }
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
          {fmt.date(rel.created_at)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title={t("suppliersUi.roster.edit")}>
            <IconButton size="small" onClick={() => onEdit(rel)}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("suppliersUi.roster.remove")}>
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
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editRel, setEditRel] = useState<SupplierRelationship | null>(null)
  const [removeSupplier] = useRemoveSupplierMutation()

  const { data: suppliersData, isLoading: suppliersLoading } =
    useGetMySuppliersQuery({})
  usePageReady(suppliersLoading)
  const { data: aggregatorsData, isLoading: aggregatorsLoading } =
    useGetMyAggregatorsQuery({})

  const suppliers = suppliersData?.suppliers || []
  const aggregators = aggregatorsData?.suppliers || []

  const handleRemove = async (rel: SupplierRelationship) => {
    if (
      !window.confirm(
        t("suppliersUi.roster.removeConfirm", {
          name: rel.supplier.display_name,
        }),
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
            {t("suppliersUi.roster.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("suppliersUi.roster.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setAddOpen(true)}
        >
          {t("suppliersUi.roster.addSupplier")}
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab
          label={t("suppliersUi.roster.mySuppliersTab", {
            count: suppliers.length,
          })}
        />
        <Tab
          label={t("suppliersUi.roster.supplierForTab", {
            count: aggregators.length,
          })}
        />
      </Tabs>

      {tab === 0 && (
        <Paper>
          {suppliersLoading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("marketV2.loadingEllipsis")}
              </Typography>
            </Box>
          ) : suppliers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary" gutterBottom>
                {t("suppliersUi.roster.empty")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => setAddOpen(true)}
              >
                {t("suppliersUi.roster.addFirst")}
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("suppliersUi.roster.columns.supplier")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.type")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.tier")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.status")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.notes")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.added")}</TableCell>
                  <TableCell align="right">
                    {t("suppliersUi.roster.columns.actions")}
                  </TableCell>
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
              <Typography color="text.secondary">
                {t("marketV2.loadingEllipsis")}
              </Typography>
            </Box>
          ) : aggregators.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("suppliersUi.roster.notOnRoster")}
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("suppliersUi.roster.columns.aggregator")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.type")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.tierAssigned")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.status")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.theirNotes")}</TableCell>
                  <TableCell>{t("suppliersUi.roster.columns.since")}</TableCell>
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
                        label={
                          rel.aggregator.kind === "contractor"
                            ? t("suppliersUi.kind.org")
                            : t("suppliersUi.kind.user")
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {rel.tier ? (
                        <Chip
                          label={t(TIER_LABEL_KEYS[rel.tier] ?? rel.tier)}
                          size="small"
                          color={TIER_COLORS[rel.tier] || "default"}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
            STATUS_LABEL_KEYS[rel.status]
              ? t(STATUS_LABEL_KEYS[rel.status])
              : rel.status
          }
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
                        {fmt.date(rel.created_at)}
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
