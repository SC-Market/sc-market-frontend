/**
 * On a public shop page (/shops/:slug), the actions for someone who runs the
 * shop: create a listing in it, and manage its listings. Nothing for anyone
 * else, or while signed out.
 */
import { Button, Stack } from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useSession } from "../../../hooks/login/useSession"
import { SHOP_PATHS } from "../../../routes/paths"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { canEditShopListings } from "../domain/shopPermissions"

export function ShopOwnerActions({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
  const session = useSession()
  const { data: myShops } = useGetMyShopsQuery(undefined, {
    skip: session.status !== "authenticated",
  })
  const shop = myShops?.find((s) => s.shop_id === shopId)
  if (!shop || shop.status === "archived" || !canEditShopListings(shop)) {
    return null
  }
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
      <Button
        variant="contained"
        startIcon={<AddRounded />}
        component={Link}
        to={SHOP_PATHS.create(shop.slug)}
      >
        {t("shops.mine.createListing", "Create listing")}
      </Button>
      <Button
        variant="outlined"
        color="neutral"
        component={Link}
        to={SHOP_PATHS.listings(shop.slug)}
      >
        {t("shops.profile.manageListings", "Manage listings")}
      </Button>
    </Stack>
  )
}
