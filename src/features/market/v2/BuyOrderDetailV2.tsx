import { useMemo, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { useGetBuyOrderDetailQuery } from "../../../store/api/v2/market"
import { ImagePreviewPaper } from "../../../components/paper/ImagePreviewPaper"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { useTranslation } from "react-i18next"
import { StorefrontRounded } from "@mui/icons-material"
import { MARKET_PATHS, PATHS } from "../../../routes/paths"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { FulfillBuyOrderDialog } from "./components/FulfillBuyOrderDialog"
import { HelpLink } from "../../help/components/HelpLink"
import { remainingQuantity } from "../domain/buyOrders"
import { useFormatters } from "../../../util/format"
import {
  BuyOrderDetailHeader,
  BuyOrderQualityRequirements,
} from "./BuyOrderDetailSections"

export function BuyOrderDetailV2() {
  const fmt = useFormatters()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const {
    data: buyOrder,
    isLoading,
    error,
  } = useGetBuyOrderDetailQuery({ id: id! })
  const { data: profile } = useGetUserProfileQuery()
  const navigate = useNavigate()
  const [fulfillOpen, setFulfillOpen] = useState(false)
  const isOwnBuyOrder = !!profile && buyOrder?.buyer_name === profile.username

  const photos = useMemo(() => {
    if (buyOrder?.photos?.length) return buyOrder.photos.map((p) => p.url)
    return [FALLBACK_IMAGE_URL]
  }, [buyOrder])

  const remaining = remainingQuantity(buyOrder ?? {})
  const progress = buyOrder?.quantity
    ? ((buyOrder.quantity_fulfilled ?? 0) / buyOrder.quantity) * 100
    : 0

  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      {
        label: t("sidebar.buyOrders", "Buy Orders"),
        href: MARKET_PATHS.buyOrders,
      },
    ]
    if (buyOrder?.game_item_name) {
      crumbs.push({ label: buyOrder.game_item_name })
    }
    return crumbs
  }, [buyOrder, t])

  const priceDisplay = useMemo(() => {
    if (!buyOrder) return ""
    if (buyOrder.negotiable) {
      return buyOrder.price_per_unit >= 1
        ? `Negotiable (~${fmt.number(buyOrder.price_per_unit)} aUEC)`
        : "Negotiable"
    }
    return `${fmt.number(buyOrder.price_per_unit)} aUEC per unit`
  }, [buyOrder, fmt])

  return (
    <StandardPageLayout
      title={buyOrder?.game_item_name || t("marketV2.buyOrder")}
      headerTitle={buyOrder?.game_item_name}
      breadcrumbs={breadcrumbs}
      isLoading={isLoading}
      error={error}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {buyOrder && (
        <Grid item xs={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* LEFT COLUMN — Image */}
            <Grid item xs={12} lg={4}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={12}>
                  <ImagePreviewPaper photos={photos} />
                </Grid>
              </Grid>
            </Grid>

            {/* RIGHT COLUMN — Main card */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={theme.layoutSpacing.component}>
                <Grid item xs={12}>
                  <Fade in>
                    <Card
                      sx={{
                        minHeight: 400,
                        borderTop: `${theme.borderWidth.emphasis}px solid ${theme.palette.warning.main}`,
                      }}
                    >
                      <BuyOrderDetailHeader
                        buyOrder={buyOrder}
                        breadcrumbs={breadcrumbs}
                      />
                      <CardContent>
                        <Stack spacing={2.5}>
                          {/* Price */}
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              background: alpha(
                                theme.palette.secondary.main,
                                theme.palette.mode === "dark" ? 0.04 : 0.06,
                              ),
                              borderColor: "secondary.main",
                              borderStyle: "dashed",
                            }}
                          >
                            <Typography
                              variant="overline"
                              color="text.secondary"
                              sx={{ letterSpacing: 1.5 }}
                            >
                              {t("marketV2.offering")}
                            </Typography>
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="secondary.main"
                            >
                              {priceDisplay}
                            </Typography>
                            {!buyOrder.negotiable && buyOrder.quantity > 1 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("marketV2.totalForRemaining", {
                                  total: fmt.number(
                                    buyOrder.price_per_unit * remaining,
                                  ),
                                })}
                              </Typography>
                            )}
                          </Paper>

                          {/* Quantity + Progress */}
                          <Box>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="baseline"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {t("marketV2.quantity")}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {t("marketV2.remaining", {
                                  n: fmt.number(remaining),
                                })}
                                {buyOrder.quantity_fulfilled > 0 && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 0.5 }}
                                  >
                                    {t("marketV2.ofRequested", {
                                      n: fmt.number(buyOrder.quantity),
                                    })}
                                  </Typography>
                                )}
                              </Typography>
                            </Stack>
                            {buyOrder.quantity_fulfilled > 0 && (
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "action.hover",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: "warning.main",
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            )}
                          </Box>

                          {/* Quality Requirements */}
                          {(buyOrder.quality_tier_min ||
                            buyOrder.quality_value_min != null) && (
                            <BuyOrderQualityRequirements buyOrder={buyOrder} />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              </Grid>
            </Grid>

            {/* FULL WIDTH — Actions */}
            {buyOrder.status === "active" && !isOwnBuyOrder && (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {t("marketV2.canYouSupply")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("marketV2.canYouSupplyBody", {
                        item: buyOrder.game_item_name,
                      })}
                    </Typography>
                    <HelpLink guide="fillBuyOrder" />
                  </Box>
                  <Button
                    onClick={() =>
                      profile ? setFulfillOpen(true) : navigate(PATHS.login)
                    }
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<StorefrontRounded />}
                    sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                  >
                    {t("marketV2.fulfillOrder")}
                  </Button>
                </Paper>
                {fulfillOpen && (
                  <FulfillBuyOrderDialog
                    buyOrder={buyOrder}
                    open={fulfillOpen}
                    onClose={() => setFulfillOpen(false)}
                  />
                )}
              </Grid>
            )}

            {/* Link to aggregate */}
            <Grid item xs={12}>
              <Button
                component={RouterLink}
                to={`/market/aggregate/${buyOrder.game_item_id}`}
                variant="text"
                color="neutral"
              >
                {t("marketV2.viewAllListingsFor", {
                  item: buyOrder.game_item_name,
                })}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}
