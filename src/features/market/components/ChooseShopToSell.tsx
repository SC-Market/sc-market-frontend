/**
 * /market/create: "Create Listing" from anywhere that isn't a shop page (the
 * market header, empty states, the landing page). Listings are created in a
 * shop (/shop/:slug/listings/create), so this page picks the shop:
 * - one shop you can list in: straight to its create page;
 * - several: a list to choose from;
 * - none: create your shop, then on to its create page.
 * The query string (e.g. ?game_item_id=…&game_item_name=… prefills) is kept.
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
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { usePageReady } from "../../../components/metadata/PageReady"
import { SHOP_PATHS } from "../../../routes/paths"
import { useQuickCreateShop } from "../../shops/hooks/useShopActions"
import { useSellingAsShop } from "../quick-list/useSellingAsShop"

export function ChooseShopToSell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { shops, isLoading, isError, refetch } = useSellingAsShop()
  const { create: quickCreateShop, isLoading: isCreating } =
    useQuickCreateShop()
  usePageReady(isLoading)

  const createIn = (slug: string) => `${SHOP_PATHS.create(slug)}${search}`

  if (!isLoading && !isError && shops.length === 1) {
    return <Navigate to={createIn(shops[0].slug)} replace />
  }

  const handleCreateShop = async () => {
    const shop = await quickCreateShop(true)
    if (shop) navigate(createIn(shop.slug), { replace: true })
  }

  return (
    <StandardPageLayout
      title={t("chooseShopToSell.pageTitle", "Create Listing")}
      headerTitle={
        <Typography
          variant="h4"
          component="span"
          fontWeight="bold"
          color="text.secondary"
        >
          {t("chooseShopToSell.heading", "Which shop are you selling from?")}
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
              <Typography variant="h6">
                {t("chooseShopToSell.noShopTitle", "You need a shop to sell")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "chooseShopToSell.noShopBody",
                  "Your listings are shown under your shop's name. Create your shop and we'll take you straight to your first listing. You can rename and customize it later.",
                )}
              </Typography>
              <LoadingButton
                variant="contained"
                startIcon={<AddRounded />}
                loading={isCreating}
                onClick={handleCreateShop}
              >
                {t("chooseShopToSell.createShop", "Create my shop")}
              </LoadingButton>
            </Stack>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {t(
                "chooseShopToSell.body",
                "The listing is shown under this shop's name, and its orders go to the shop.",
              )}
            </Typography>
            {shops.map((shop) => (
              <Card key={shop.shop_id} variant="outlined">
                <CardActionArea
                  component={Link}
                  to={createIn(shop.slug)}
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
