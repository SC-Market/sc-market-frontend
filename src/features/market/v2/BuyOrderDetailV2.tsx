import React, { useMemo, useState } from "react"
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import {
  useGetBuyOrderDetailQuery,
} from "../../../store/api/v2/market"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { ImagePreviewPaper } from "../../../components/paper/ImagePreviewPaper"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { useTranslation } from "react-i18next"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"
import {
  PersonRounded,
  AccessTimeRounded,
  ShoppingCartRounded,
  VisibilityRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { ClockAlert } from "mdi-material-ui"
import { MARKET_PATHS, PATHS, USER_PATHS } from "../../../routes/paths"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { FulfillBuyOrderDialog } from "./components/FulfillBuyOrderDialog"
import { HelpLink } from "../../help/components/HelpLink"
import { remainingQuantity } from "../domain/buyOrders"
import { useFormatters, useNow } from "../../../util/format"

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "default"> = {
  active: "success",
  fulfilled: "default",
  expired: "warning",
  cancelled: "error",
}

export function BuyOrderDetailV2() {
  const fmt = useFormatters()
  const now = useNow()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const { data: buyOrder, isLoading, error } = useGetBuyOrderDetailQuery({ id: id! })
  const { data: profile } = useGetUserProfileQuery()
  const navigate = useNavigate()
  const [fulfillOpen, setFulfillOpen] = useState(false)
  const isOwnBuyOrder = !!profile && buyOrder?.buyer_name === profile.username

  const photos = useMemo(() => {
    if (buyOrder?.photos?.length) return buyOrder.photos.map((p) => p.url)
    return [FALLBACK_IMAGE_URL]
  }, [buyOrder])

  const remaining = remainingQuantity(buyOrder ?? {})
  const progress = buyOrder?.quantity ? ((buyOrder.quantity_fulfilled ?? 0) / buyOrder.quantity) * 100 : 0

  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      { label: t("sidebar.buyOrders", "Buy Orders"), href: MARKET_PATHS.buyOrders },
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
                      <CardHeader
                        disableTypography
                        title={
                          <Stack direction="column" spacing={theme.layoutSpacing.text}>
                            <Breadcrumbs separator="›" sx={{ fontSize: "0.85rem" }}>
                              {breadcrumbs.map((crumb, i) =>
                                crumb.href && i < breadcrumbs.length - 1 ? (
                                  <Link
                                    key={i}
                                    component={RouterLink}
                                    to={crumb.href}
                                    underline="hover"
                                    color="text.secondary"
                                    variant="body2"
                                  >
                                    {crumb.label}
                                  </Link>
                                ) : (
                                  <Typography key={i} variant="body2" color="text.secondary">
                                    {crumb.label}
                                  </Typography>
                                ),
                              )}
                            </Breadcrumbs>

                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="h5" fontWeight="bold">
                                {buyOrder.game_item_name}
                              </Typography>
                              <Chip
                                label={buyOrder.status.toUpperCase()}
                                color={STATUS_COLORS[buyOrder.status] || "default"}
                                size="small"
                                variant="outlined"
                              />
                              {buyOrder.negotiable && (
                                <Chip label="NEGOTIABLE" size="small" color="info" variant="outlined" />
                              )}
                            </Stack>
                          </Stack>
                        }
                        subheader={
                          <Stack direction="column" spacing={0.5} sx={{ mt: 1.5 }}>
                            {/* Buyer */}
                            <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
                              <Link
                                component={RouterLink}
                                to={USER_PATHS.profile(buyOrder.buyer_name)}
                                underline="hover"
                                color="text.primary"
                                variant="subtitle2"
                              >
                                {buyOrder.buyer_name}
                              </Link>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                {t("marketV2.isLookingFor")}
                              </Typography>
                            </ListingDetailItem>

                            {/* Visibility */}
                            {buyOrder.visibility && buyOrder.visibility !== "public" && (
                              <ListingDetailItem icon={<VisibilityRounded fontSize="small" />}>
                                <Chip
                                  label={buyOrder.visibility === "roster_only" ? t("marketV2.rosterOnly") : t("marketV2.private")}
                                  size="small"
                                  variant="outlined"
                                />
                              </ListingDetailItem>
                            )}

                            {/* Created */}
                            <ListingDetailItem icon={<AccessTimeRounded fontSize="small" />}>
                              {t("marketV2.posted", { time: fmt.relative(new Date(buyOrder.created_at), now) })}
                            </ListingDetailItem>

                            {/* Expires */}
                            {buyOrder.expires_at && (
                              <ListingDetailItem icon={<ClockAlert fontSize="small" />}>
                                {t("marketV2.expires", { time: fmt.relative(new Date(buyOrder.expires_at), now) })}
                              </ListingDetailItem>
                            )}
                          </Stack>
                        }
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
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                              {t("marketV2.offering")}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="secondary.main">
                              {priceDisplay}
                            </Typography>
                            {!buyOrder.negotiable && buyOrder.quantity > 1 && (
                              <Typography variant="body2" color="text.secondary">
                                {t("marketV2.totalForRemaining", { total: fmt.number(buyOrder.price_per_unit * remaining) })}
                              </Typography>
                            )}
                          </Paper>

                          {/* Quantity + Progress */}
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                {t("marketV2.quantity")}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {t("marketV2.remaining", { n: fmt.number(remaining) })}
                                {buyOrder.quantity_fulfilled > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    {t("marketV2.ofRequested", { n: fmt.number(buyOrder.quantity) })}
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
                          {(buyOrder.quality_tier_min || buyOrder.quality_value_min != null) && (
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {t("marketV2.qualityRequirements")}
                              </Typography>
                              {buyOrder.quality_tier_min && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <QualityBadge tier={buyOrder.quality_tier_min} size="small" />
                                  {buyOrder.quality_tier_max && buyOrder.quality_tier_max !== buyOrder.quality_tier_min && (
                                    <>
                                      <Typography variant="caption" color="text.secondary">{t("marketV2.rangeTo")}</Typography>
                                      <QualityBadge tier={buyOrder.quality_tier_max} size="small" />
                                    </>
                                  )}
                                </Stack>
                              )}
                              {buyOrder.quality_value_min != null && (
                                <Typography variant="body2">
                                  {buyOrder.quality_value_min}
                                  {buyOrder.quality_value_max != null && buyOrder.quality_value_max !== buyOrder.quality_value_min
                                    ? ` – ${buyOrder.quality_value_max}`
                                    : "+"} / 1000 quality
                                </Typography>
                              )}
                            </Box>
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
                      {t("marketV2.canYouSupplyBody", { item: buyOrder.game_item_name })}
                    </Typography>
                    <HelpLink guide="fillBuyOrder" />
                  </Box>
                  <Button
                    onClick={() => (profile ? setFulfillOpen(true) : navigate(PATHS.login))}
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
                startIcon={<ShoppingCartRounded />}
              >
                {t("marketV2.viewAllListingsFor", { item: buyOrder.game_item_name })}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}
