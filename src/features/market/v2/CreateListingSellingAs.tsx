import { Grid } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FormPaper } from "../../../components/paper/FormPaper"
import { SHOP_PATHS } from "../../../routes/paths"
import type { ShopResponse } from "../../../store/api/v2/market"
import { ShopSelector } from "../../shops/components/ShopSelector"
import { useSellingAsShop } from "../quick-list/useSellingAsShop"

/**
 * "Selling as": which shop the listing is created in, for sellers with more
 * than one. The shop is in the URL, so choosing another opens its create
 * page (the query string, i.e. any prefill, is kept).
 */
export function SellingAsSection({
  shop,
}: {
  shop: Pick<ShopResponse, "shop_id" | "slug">
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { shops } = useSellingAsShop()
  if (shops.length < 2) return null
  return (
    <FormPaper title={t("CreateListingV2.sellingAs", "Selling as")}>
      <Grid item xs={12}>
        <ShopSelector
          id="create-listing-shop"
          value={shop.shop_id}
          onChange={(shopId) => {
            const next = shops.find((s) => s.shop_id === shopId)
            if (next && next.slug !== shop.slug) {
              navigate(`${SHOP_PATHS.create(next.slug)}${search}`, {
                replace: true,
              })
            }
          }}
          helperText={t(
            "CreateListingV2.sellingAsHelp",
            "The listing is shown under this shop's name, and its orders go to the shop.",
          )}
        />
      </Grid>
    </FormPaper>
  )
}
