import React from "react"
import { Divider, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { FormPaper } from "../../../components/paper/FormPaper"
import {
  useGetShopStorefrontDirectoryQuery,
  useSetShopStorefrontDirectoryMutation,
  type ShopResponse,
} from "../../../store/api/v2/market"
import { StorefrontDirectoryCard } from "../../storefront/components/StorefrontDirectoryCard"
import { StorefrontEnquiryCard } from "../../storefront/components/StorefrontEnquiryCard"

/**
 * Shop settings › Branded storefront: "Show in the public storefront
 * directory" and the branded storefront enquiry form, for the shop's
 * managers (the settings page already needs Manage Market).
 */
export function ShopStorefrontSection({ shop }: { shop: ShopResponse }) {
  const { t } = useTranslation()
  const { data: directory } = useGetShopStorefrontDirectoryQuery({ shopId: shop.shop_id })
  const [setDirectory, state] = useSetShopStorefrontDirectoryMutation()

  return (
    <FormPaper
      title={t("storefront.shopSection.title", "Branded storefront")}
      subtitle={t(
        "storefront.shopSection.subtitle",
        "Ask for your shop's own sc-market.space subdomain, and choose whether it's in the storefront directory",
      )}
    >
      <Grid item xs={12}>
        <Typography variant="subtitle1" color="text.secondary" component="h3">
          {t("storefront.enquiry.title", "Enquire about a branded storefront")}
        </Typography>
        <StorefrontEnquiryCard targetType="shop" targetId={shop.shop_id} handle={shop.slug} bare />
      </Grid>
      {directory && (
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" component="h3">
            {t("storefront.directory.title", "Storefront directory")}
          </Typography>
          <StorefrontDirectoryCard
            kind="shop"
            status={directory}
            saving={state.isLoading}
            error={state.error}
            onChange={(show) =>
              void setDirectory({ shopId: shop.shop_id, storefrontDirectoryRequest: { show_in_directory: show } })
            }
            bare
          />
        </Grid>
      )}
    </FormPaper>
  )
}
