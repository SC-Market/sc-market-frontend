import React from "react"
import { Button, type ButtonProps } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GUIDE_LINKS } from "../../help/guideLinks"

/**
 * "Enquire about a branded storefront" on public pages (the Storefronts hub,
 * an org's storefront): opens the white-label guide, which explains the
 * enquiry form in org settings › Storefront and in shop settings. The form
 * itself (StorefrontEnquiryCard) lives there, for the org's officers and
 * the shop's managers.
 */
export function EnquireBrandedStorefront(props: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const { t } = useTranslation()
  return (
    <Button
      variant={props.variant ?? "outlined"}
      size={props.size ?? "small"}
      component={Link}
      to={GUIDE_LINKS.orgWhiteLabel}
      data-testid="enquire-branded-storefront"
    >
      {t("storefront.enquire", "Enquire about a branded storefront")}
    </Button>
  )
}
