import { useState } from "react"
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material"
import { useAddSupplierMutation } from "../../store/api/v2/market"
import type { SupplierTier } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

// ---------------------------------------------------------------------------
// Add Supplier Dialog
// ---------------------------------------------------------------------------

export function AddSupplierDialog({
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
    } catch {
      // The dialog shows the request's error (the mutation's `error`).
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={t("suppliersUi.roster.addSupplier")}
      mobile="fullScreen"
      disableClose={isLoading}
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!id || isLoading}
          >
            {t("suppliersUi.roster.add")}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="admin-supplier-roster-supplier-type-label">
            {t("suppliersUi.roster.supplierType")}
          </InputLabel>
          <Select
            labelId="admin-supplier-roster-supplier-type-label"
            value={kind}
            label={t("suppliersUi.roster.supplierType")}
            onChange={(e) => setKind(e.target.value as "user" | "contractor")}
          >
            <MenuItem value="user">{t("suppliersUi.kind.user")}</MenuItem>
            <MenuItem value="contractor">
              {t("suppliersUi.kind.organisation")}
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label={
            kind === "user"
              ? t("suppliersUi.roster.userUuid")
              : t("suppliersUi.roster.contractorUuid")
          }
          placeholder={
            kind === "user" ? "user_id (UUID)" : "contractor_id (UUID)"
          }
          value={id}
          onChange={(e) => setId(e.target.value)}
          fullWidth
          helperText={t("suppliersUi.roster.uuidHelper")}
        />

        <FormControl fullWidth size="small">
          <InputLabel id="admin-supplier-roster-tier-optional-label">
            {t("suppliersUi.roster.tierOptional")}
          </InputLabel>
          <Select
            labelId="admin-supplier-roster-tier-optional-label"
            value={tier}
            label={t("suppliersUi.roster.tierOptional")}
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
            {(error &&
              "data" in error &&
              (error.data as { message?: string })?.message) ||
              t("suppliersUi.roster.addFailed")}
          </Alert>
        )}
      </Stack>
    </ResponsiveDialog>
  )
}
