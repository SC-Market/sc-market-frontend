import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { PersonRounded, BusinessRounded } from "@mui/icons-material"
import { useUpdateSupplierMutation } from "../../store/api/v2/market"
import type {
  SupplierRelationship,
  SupplierTier,
  SupplierStatus,
} from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

// ---------------------------------------------------------------------------
// Edit Supplier Dialog
// ---------------------------------------------------------------------------

export function EditSupplierDialog({
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
    } catch {
      // The dialog shows the request's error (the mutation's `error`).
    }
  }

  return (
    <ResponsiveDialog
      open={!!rel}
      onClose={onClose}
      maxWidth="sm"
      title={t("suppliersUi.roster.editSupplier")}
      mobile="fullScreen"
      disableClose={isLoading}
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSave} disabled={isLoading}>
            {t("common.save")}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ImageAvatar alt="" sx={{ width: 32, height: 32 }}>
            {rel?.supplier.kind === "contractor" ? (
              <BusinessRounded fontSize="small" />
            ) : (
              <PersonRounded fontSize="small" />
            )}
          </ImageAvatar>
          <Box>
            <Typography variant="subtitle2">
              {rel?.supplier.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rel?.supplier.username}
            </Typography>
          </Box>
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel id="admin-supplier-roster-tier-label">
            {t("suppliersUi.roster.tier")}
          </InputLabel>
          <Select
            labelId="admin-supplier-roster-tier-label"
            value={tier}
            label={t("suppliersUi.roster.tier")}
            onChange={(e) => setTier(e.target.value as SupplierTier)}
          >
            <MenuItem value="">{t("common.none")}</MenuItem>
            <MenuItem value="preferred">
              {t("suppliersUi.tiers.preferred")}
            </MenuItem>
            <MenuItem value="approved">
              {t("suppliersUi.tiers.approved")}
            </MenuItem>
            <MenuItem value="restricted">
              {t("suppliersUi.tiers.restricted")}
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="admin-supplier-roster-status-label">
            {t("suppliersUi.roster.status")}
          </InputLabel>
          <Select
            labelId="admin-supplier-roster-status-label"
            value={status}
            label={t("suppliersUi.roster.status")}
            onChange={(e) => setStatus(e.target.value as SupplierStatus)}
          >
            <MenuItem value="active">
              {t("suppliersUi.roster.statusOption.active")}
            </MenuItem>
            <MenuItem value="suspended">
              {t("suppliersUi.roster.statusOption.suspended")}
            </MenuItem>
            <MenuItem value="removed">
              {t("suppliersUi.roster.statusOption.removed")}
            </MenuItem>
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
            {(error &&
              "data" in error &&
              (error.data as { message?: string })?.message) ||
              t("suppliersUi.roster.updateFailed")}
          </Alert>
        )}
      </Stack>
    </ResponsiveDialog>
  )
}
