import React from "react"
import { Chip, Tooltip } from "@mui/material"
import VerifiedRounded from "@mui/icons-material/VerifiedRounded"
import { useTranslation } from "react-i18next"

/**
 * "Verified org": the org registered on SC Market through its RSI org page
 * (SC Market's own RSI verification; see isRsiVerifiedSpectrumId).
 */
export function VerifiedOrgBadge(props: { size?: "small" | "medium" }) {
  const { t } = useTranslation()
  return (
    <Tooltip title={t("storefront.verified.tooltip", "This org proved it runs its RSI org page when it registered on SC Market.")}>
      <Chip
        icon={<VerifiedRounded />}
        label={t("storefront.verified.label", "Verified org")}
        color="primary"
        variant="outlined"
        size={props.size ?? "small"}
        data-testid="verified-org-badge"
      />
    </Tooltip>
  )
}
