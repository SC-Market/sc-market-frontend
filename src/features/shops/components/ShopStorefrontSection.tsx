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
 * Shop settings › Branded storefront: the branded storefront enquiry form
 * and, for an org's shop, "Show in the public storefront directory", for
 * the shop's managers (the settings page already needs Manage Market).
 * Personal shops have no directory setting (the directory lists orgs).
 */
export function ShopStorefrontSection({ shop }: { shop: ShopResponse }) {
  const { t } = useTranslation()
  const orgShop = shop.is_org_owned
  const { data: directory } = useGetShopStorefrontDirectoryQuery({ shopId: shop.shop_id }, { skip: !orgShop })
  const [setDirectory, state] = useSetShopStorefrontDirectoryMutation()

  return (
    <FormPaper
      title={t("storefront.shopSection.title", "Branded storefront")}
      subtitle={
        orgShop
          ? t(
              "storefront.shopSection.subtitle",
              "Ask for your shop's own sc-market.space subdomain, and choose whether it's in the storefront directory",
            )
          : t("storefront.shopSection.subtitlePersonal", "Ask for your shop's own sc-market.space subdomain")
      }
    >
      <Grid item xs={12}>
        <Typography variant="subtitle1" color="text.secondary" component="h3">
          {t("storefront.enquiry.title", "Enquire about a branded storefront")}
        </Typography>
        <StorefrontEnquiryCard targetType="shop" targetId={shop.shop_id} handle={shop.slug} bare />
      </Grid>
      {orgShop && directory && (
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
