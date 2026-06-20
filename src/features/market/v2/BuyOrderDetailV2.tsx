import React, { useMemo } from "react"
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
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useParams, Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import {
  useGetBuyOrderDetailQuery,
  useGetMatchesForSellerQuery,
} from "../../../store/api/v2/market"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { ImagePreviewPaper } from "../../../components/paper/ImagePreviewPaper"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { getRelativeTime } from "../../../util/time"
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

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "default"> = {
  active: "success",
  fulfilled: "default",
  expired: "warning",
  cancelled: "error",
}

export function BuyOrderDetailV2() {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme<ExtendedTheme>()
  const { t, i18n } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const { data: buyOrder, isLoading, error } = useGetBuyOrderDetailQuery({ id: id! })

  const photos = useMemo(() => {
    if (buyOrder?.photos?.length) return buyOrder.photos.map((p) => p.url)
    return [FALLBACK_IMAGE_URL]
  }, [buyOrder])

  const remaining = (buyOrder?.quantity ?? 0) - (buyOrder?.quantity_fulfilled ?? 0)
  const progress = buyOrder?.quantity ? ((buyOrder.quantity_fulfilled ?? 0) / buyOrder.quantity) * 100 : 0

  const breadcrumbs = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [
      { label: t("sidebar.buyOrders", "Buy Orders"), href: "/buyorders" },
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
        ? `Negotiable (~${buyOrder.price_per_unit.toLocaleString(i18n.language)} aUEC)`
        : "Negotiable"
    }
    return `${buyOrder.price_per_unit.toLocaleString(i18n.language)} aUEC per unit`
  }, [buyOrder, i18n.language])

  return (
    <StandardPageLayout
      title={buyOrder?.game_item_name || "Buy Order"}
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
                        borderTop: `3px solid ${theme.palette.warning.main}`,
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
                                to={`/user/${buyOrder.buyer_name}`}
                                underline="hover"
                                color="text.primary"
                                variant="subtitle2"
                              >
                                {buyOrder.buyer_name}
                              </Link>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                is looking for this item
                              </Typography>
                            </ListingDetailItem>

                            {/* Visibility */}
                            {buyOrder.visibility && buyOrder.visibility !== "public" && (
                              <ListingDetailItem icon={<VisibilityRounded fontSize="small" />}>
                                <Chip
                                  label={buyOrder.visibility === "roster_only" ? "Roster Only" : "Private"}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              </ListingDetailItem>
                            )}

                            {/* Created */}
                            <ListingDetailItem icon={<AccessTimeRounded fontSize="small" />}>
                              Posted {getRelativeTime(new Date(buyOrder.created_at))}
                            </ListingDetailItem>

                            {/* Expires */}
                            {buyOrder.expires_at && (
                              <ListingDetailItem icon={<ClockAlert fontSize="small" />}>
                                Expires {getRelativeTime(new Date(buyOrder.expires_at))}
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
                              background: theme.palette.mode === "dark"
                                ? "rgba(255, 167, 38, 0.04)"
                                : "rgba(255, 167, 38, 0.06)",
                              borderColor: "warning.main",
                              borderStyle: "dashed",
                            }}
                          >
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5 }}>
                              Offering
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                              {priceDisplay}
                            </Typography>
                            {!buyOrder.negotiable && buyOrder.quantity > 1 && (
                              <Typography variant="body2" color="text.secondary">
                                Total: {(buyOrder.price_per_unit * remaining).toLocaleString(i18n.language)} aUEC for remaining quantity
                              </Typography>
                            )}
                          </Paper>

                          {/* Quantity + Progress */}
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Quantity
                              </Typography>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {remaining.toLocaleString(i18n.language)} remaining
                                {buyOrder.quantity_fulfilled > 0 && (
                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                    of {buyOrder.quantity.toLocaleString(i18n.language)} requested
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
                                Quality Requirements
                              </Typography>
                              {buyOrder.quality_tier_min && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <QualityBadge tier={buyOrder.quality_tier_min} size="small" />
                                  {buyOrder.quality_tier_max && buyOrder.quality_tier_max !== buyOrder.quality_tier_min && (
                                    <>
                                      <Typography variant="caption" color="text.secondary">to</Typography>
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
            {buyOrder.status === "active" && (
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
                      Can you supply this?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      If you have {buyOrder.game_item_name} in stock, you can fulfill this buy order directly.
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to={`/market/aggregate/${buyOrder.game_item_id}`}
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<StorefrontRounded />}
                    sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                  >
                    Fulfill Order
                  </Button>
                </Paper>
              </Grid>
            )}

            {/* Link to aggregate */}
            <Grid item xs={12}>
              <Button
                component={RouterLink}
                to={`/market/aggregate/${buyOrder.game_item_id}`}
                variant="text"
                color="secondary"
                startIcon={<ShoppingCartRounded />}
              >
                View all listings for {buyOrder.game_item_name}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}
