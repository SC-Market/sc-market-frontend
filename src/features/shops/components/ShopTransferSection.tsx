import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import {
  Button,
  DialogContentText,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material"
import { useTransferShop } from "../hooks/useShopSettingsActions"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetContractorBySpectrumIDQuery } from "../../contractor/api/contractorApi"
import { FormPaper } from "../../../components/paper/FormPaper"
import { SwapHorizRounded } from "@mui/icons-material"
import { SHOP_PATHS } from "../../../routes/paths"
import type { ShopResponse } from "../../../store/api/v2/market"
import { ConfirmDialog } from "../../../components/dialog/ConfirmDialog"

export function ShopTransferSection({ shop }: { shop: ShopResponse }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()
  const { transfer, isLoading } = useTransferShop(shop.shop_id)

  const [targetType, setTargetType] = useState<"user" | "contractor">(
    "contractor",
  )
  const [contractorSpectrumId, setContractorSpectrumId] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const orgs = profile?.contractors ?? []

  // Only the owner may give a shop away (the API refuses manage_market
  // members): for an org shop, that is the org's owner role.
  const orgSpectrumId = shop.owner_contractor_spectrum_id
  const { data: owningOrg } = useGetContractorBySpectrumIDQuery(
    orgSpectrumId ?? "",
    {
      skip: !orgSpectrumId,
    },
  )
  const membership = orgs.find((c) => c.spectrum_id === orgSpectrumId)
  const canTransfer = orgSpectrumId
    ? !!owningOrg?.owner_role &&
      !!membership?.roles.includes(owningOrg.owner_role)
    : true

  const handleConfirm = async () => {
    const target_id =
      targetType === "user" ? (profile?.username ?? "") : contractorSpectrumId
    // The transfer endpoint expects a user_id for users; profile exposes
    // username, so we transfer to self using the backend's own resolution.
    const slug = await transfer({ target_type: targetType, target_id })
    setConfirmOpen(false)
    // Slug is preserved across transfers; navigate to the shop.
    if (slug) navigate(SHOP_PATHS.listings(slug))
  }

  const canSubmit =
    targetType === "user" ? !!profile?.username : !!contractorSpectrumId

  const targetOrgName = orgs.find(
    (o) => o.spectrum_id === contractorSpectrumId,
  )?.name
  const confirmKey =
    targetType === "user"
      ? "shopsUi.transfer.confirmBodyUser"
      : targetOrgName
        ? "shopsUi.transfer.confirmBodyOrg"
        : "shopsUi.transfer.confirmBodySelectedOrg"

  if (!canTransfer) return null

  return (
    <FormPaper
      title={t("settingsManageContractors.transfer_ownership")}
      subtitle={t("shopsUi.transfer.subtitle")}
    >
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("shopsUi.transfer.transferTo")}
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as "user" | "contractor")
            setContractorSpectrumId("")
          }}
        >
          <MenuItem value="user">{t("shopsUi.transfer.myAccount")}</MenuItem>
          <MenuItem value="contractor" disabled={orgs.length === 0}>
            {t("shopsUi.transfer.anOrganization")}
          </MenuItem>
        </TextField>
      </Grid>

      {targetType === "contractor" && (
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("shops.mine.organization")}
            value={contractorSpectrumId}
            onChange={(e) => setContractorSpectrumId(e.target.value)}
            helperText={t("shopsUi.transfer.orgHelper")}
          >
            <MenuItem value="">{t("shopsUi.form.selectOrganization")}</MenuItem>
            {orgs.map((org) => (
              <MenuItem key={org.spectrum_id} value={org.spectrum_id}>
                {org.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<SwapHorizRounded />}
          disabled={!canSubmit || isLoading}
          onClick={() => setConfirmOpen(true)}
        >
          {t("settingsManageContractors.transfer_ownership")}
        </Button>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={t("shopsUi.transfer.confirmTitle")}
        message={
          <Trans
            i18nKey={confirmKey}
            values={{ shop: shop.name, org: targetOrgName }}
            components={{ strong: <strong /> }}
          />
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("shopsUi.transfer.confirm")}
        confirmColor="warning"
        loading={isLoading}
      >
        <DialogContentText>
          {t("shopsUi.transfer.confirmWarning")}
        </DialogContentText>
      </ConfirmDialog>
    </FormPaper>
  )
}
