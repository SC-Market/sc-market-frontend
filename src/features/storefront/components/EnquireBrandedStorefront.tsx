import React from "react"
import { Button, type ButtonProps } from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import { useTranslation } from "react-i18next"
import { DISCORD_INVITE } from "../../../util/constants"

/**
 * "Enquire about a branded storefront": opens the SC Market Discord, where
 * staff set up an org's <sid>.sc-market.space subdomain. No form, no data
 * sent.
 */
export function EnquireBrandedStorefront(props: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const { t } = useTranslation()
  return (
    <Button
      variant={props.variant ?? "outlined"}
      size={props.size ?? "small"}
      href={DISCORD_INVITE}
      target="_blank"
      rel="noopener"
      endIcon={<OpenInNewRounded />}
      data-testid="enquire-branded-storefront"
    >
      {t("storefront.enquire", "Enquire about a branded storefront")}
    </Button>
  )
}
