import React from "react"
import { Alert } from "@mui/material"
import { useTranslation } from "react-i18next"

/**
 * Shown on an org shop's listings and stock pages to members who can see
 * them but not change them: the create, edit and stock actions are hidden
 * instead of failing with a 403 when saved. Listings need Manage Market;
 * stock lots need Manage Market or Manage Stock (`area="stock"`).
 */
export function ShopManageAccessNotice({
  area = "listings",
}: {
  area?: "listings" | "stock"
}) {
  const { t } = useTranslation()
  return (
    <Alert severity="info">
      {area === "stock"
        ? t(
            "ItemStock.stockAccessNotice",
            "You can view this shop's stock. To add or change lots, ask an org admin for the Manage Stock permission.",
          )
        : t(
            "ItemStock.manageAccessNotice",
            "You can view this shop's listings and stock. To create or change them, ask an org admin for the Manage Market permission.",
          )}
    </Alert>
  )
}
