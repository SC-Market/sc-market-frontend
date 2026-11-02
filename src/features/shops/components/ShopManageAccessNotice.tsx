import React from "react"
import { Alert } from "@mui/material"
import { useTranslation } from "react-i18next"

/**
 * Shown on an org shop's listings and stock pages to members who can see
 * them but not change them (no manage_market): the create, edit and stock
 * actions are hidden instead of failing with a 403 when saved.
 */
export function ShopManageAccessNotice() {
  const { t } = useTranslation()
  return (
    <Alert severity="info">
      {t(
        "ItemStock.manageAccessNotice",
        "You can view this shop's listings and stock. To create or change them, ask an org admin for the Manage Market permission.",
      )}
    </Alert>
  )
}
