/**
 * Shop-picker pages for the shop-less URLs of pages that live in a shop:
 * - /market/create, /market/create/:tab → /shop/:slug/listings/create
 * - /market/manage, /market/stock/:listingId → /shop/:slug/listings
 * - /market/manage-stock → /shop/:slug/stock
 * - /order/services → /shop/:slug/services
 * - /order/service/create → /shop/:slug/services/create
 *
 * Only the shops you can do that in count (shopPermissions):
 * - one: straight there;
 * - several: a list to choose from;
 * - none: create your shop, then on to its page.
 * The query string and hash (e.g. ?game_item_id=…&game_item_name=… prefills)
 * are kept.
 */
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded"
import StorefrontRounded from "@mui/icons-material/StorefrontRounded"
import LoadingButton from "@mui/lab/LoadingButton"
import { useMemo } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { usePageReady } from "../../../components/metadata/PageReady"
import { useSession } from "../../../hooks/login/useSession"
import { SHOP_PATHS } from "../../../routes/paths"
import {
  useGetMyShopsQuery,
  type ShopResponse,
} from "../../../store/api/v2/market"
import {
  canEditShopListings,
  canEditShopStockLots,
  canManageShopServices,
  usableShops,
} from "../domain/shopPermissions"
import { useQuickCreateShop } from "../hooks/useShopActions"

export type ShopPick =
  | "createListing"
  | "manageListings"
  | "manageStock"
  | "services"
  | "createService"

/** Where each pick goes in the chosen shop, and who can go there. */
export const SHOP_PICKS: Record<
  ShopPick,
  { to: (slug: string) => string; canUse: (shop: ShopResponse) => boolean }
> = {
  createListing: { to: SHOP_PATHS.create, canUse: canEditShopListings },
  manageListings: { to: SHOP_PATHS.listings, canUse: canEditShopListings },
  manageStock: { to: SHOP_PATHS.stock, canUse: canEditShopStockLots },
  services: { to: SHOP_PATHS.services, canUse: canManageShopServices },
  createService: {
    to: SHOP_PATHS.serviceCreate,
    canUse: canManageShopServices,
  },
}

export function ChooseShop({ pick }: { pick: ShopPick }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search, hash } = useLocation()
  const session = useSession()
  const {
    data: myShops,
    isLoading: shopsLoading,
    isError,
    refetch,
  } = useGetMyShopsQuery(undefined, {
    skip: session.status !== "authenticated",
  })
  const { to, canUse } = SHOP_PICKS[pick]
  const shops = useMemo(() => usableShops(myShops, canUse), [myShops, canUse])
  const isLoading = session.status === "unknown" || shopsLoading
  const { create: quickCreateShop, isLoading: isCreating } =
    useQuickCreateShop()
  usePageReady(isLoading)

  const target = (slug: string) => `${to(slug)}${search}${hash}`

  if (!isLoading && !isError && shops.length === 1) {
    return <Navigate to={target(shops[0].slug)} replace />
  }

  const handleCreateShop = async () => {
    const shop = await quickCreateShop(true)
    if (shop) navigate(target(shop.slug), { replace: true })
  }

  const copy = `chooseShop.${pick}`

  return (
    <StandardPageLayout
      title={t(`${copy}.pageTitle`)}
      headerTitle={
        <Typography
          variant="h4"
          component="span"
          fontWeight="bold"
          color="text.secondary"
        >
          {t(`${copy}.heading`)}
        </Typography>
      }
      sidebarOpen={true}
      maxWidth="sm"
    >
      <Box sx={{ width: "100%" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                {t("ShopSelector.retry", "Retry")}
              </Button>
            }
          >
            {t("ShopSelector.error", "Failed to load shops.")}
          </Alert>
        ) : shops.length === 0 ? (
          <Card variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6">{t(`${copy}.noShopTitle`)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t(`${copy}.noShopBody`)}
              </Typography>
              <LoadingButton
                variant="contained"
                startIcon={<AddRounded />}
                loading={isCreating}
                onClick={handleCreateShop}
              >
                {t("chooseShop.createShop")}
              </LoadingButton>
            </Stack>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {t(`${copy}.body`)}
            </Typography>
            {shops.map((shop) => (
              <Card key={shop.shop_id} variant="outlined">
                <CardActionArea
                  component={Link}
                  to={target(shop.slug)}
                  sx={{ p: 2 }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ImageAvatar
                      alt=""
                      src={shop.logo_url || undefined}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      <StorefrontRounded />
                    </ImageAvatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {shop.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shop.is_org_owned
                          ? t("shops.mine.organization")
                          : t("shops.mine.personal")}
                      </Typography>
                    </Box>
                    <ChevronRightRounded color="action" />
                  </Stack>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </StandardPageLayout>
  )
}

/** /market/create */
export function ChooseShopToSell() {
  return <ChooseShop pick="createListing" />
}

/** /market/manage, /market/stock/:listingId */
export function ChooseShopToManageListings() {
  return <ChooseShop pick="manageListings" />
}

/** /market/manage-stock */
export function ChooseShopToManageStock() {
  return <ChooseShop pick="manageStock" />
}

/** /order/services */
export function ChooseShopForServices() {
  return <ChooseShop pick="services" />
}

/** /order/service/create */
export function ChooseShopToCreateService() {
  return <ChooseShop pick="createService" />
}
