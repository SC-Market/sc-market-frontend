import React from "react"
import { Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Section } from "../../../../components/paper/Section"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useSession } from "../../../../hooks/login/useSession"
import { SHOP_PATHS } from "../../../../routes/paths"
import {
  useGetMyShopsQuery,
  type ShopResponse,
} from "../../../../store/api/v2/market"
import { ShopSelector } from "../../../shops/components/ShopSelector"
import {
  canManageShopServices,
  usableShops,
} from "../../../shops/domain/shopPermissions"

/**
 * "Offering as": which shop a new service is created under, for users who
 * can offer services in more than one (e.g. their own shop and their org's).
 * The shop is in the URL (/shop/:slug/services/create), so choosing another
 * opens its create page; the service belongs to that shop's owner.
 */
export function OfferingAsSection({
  shop,
}: {
  shop: Pick<ShopResponse, "shop_id" | "slug">
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { search } = useLocation()
  const session = useSession()
  const { data: myShops } = useGetMyShopsQuery(undefined, {
    skip: session.status !== "authenticated",
  })
  const shops = usableShops(myShops, canManageShopServices)
  if (shops.length < 2) return null

  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography
          variant="h6"
          align="left"
          color="text.secondary"
          sx={{ fontWeight: "bold" }}
        >
          {t("CreateServiceForm.offeringAs")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <ShopSelector
            id="create-service-shop"
            label={t("CreateServiceForm.offeringAs")}
            canUse={canManageShopServices}
            value={shop.shop_id}
            onChange={(shopId) => {
              const next = shops.find((s) => s.shop_id === shopId)
              if (next && next.slug !== shop.slug) {
                navigate(`${SHOP_PATHS.serviceCreate(next.slug)}${search}`, {
                  replace: true,
                })
              }
            }}
            helperText={t("CreateServiceForm.offeringAsHelp")}
          />
        </Grid>
      </Grid>
    </Section>
  )
}
