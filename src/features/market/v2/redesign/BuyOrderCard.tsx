import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Fade,
  Stack,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme, cardFadeGradient } from "../../../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../../../routes/paths"
import type { StandingBuyOrder } from "../../../../store/api/v2/market"
import { ListingWrapper } from "../../components/listings/ListingWrapper"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { remainingQuantity } from "../../domain/buyOrders"
import { useFormatters } from "../../../../util/format"

/**
 * Card for an individual active buy order. Matches BuyOrdersViewV2's card
 * sizing and per-theme visual treatment (dark = full-bleed image + gradient +
 * overlaid text; light = fixed-height image + content below) via ListingWrapper.
 */
export function BuyOrderCard({
  order,
  index,
}: {
  order: StandingBuyOrder
  index: number
}) {
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const remaining = remainingQuantity(order)
  const imageUrl = order.photos?.[0]?.url || FALLBACK_IMAGE_URL
  const isDark = theme.palette.mode === "dark"

  // A negotiable order may be posted without a price (price_per_unit 0):
  // the buyer takes offers instead of naming one.
  const priceLabel =
    order.price_per_unit > 0
      ? fmt.price(order.price_per_unit)
      : order.negotiable
        ? t("BuyOrdersRedesign.priceNegotiable", "Make an offer")
        : t("BuyOrdersRedesign.priceUnset", "No price set")

  const accessibleName = t(
    "BuyOrdersRedesign.cardLabel",
    "Buy order: {{item}}, {{price}}, {{remaining}} of {{quantity}} requested",
    {
      item: order.game_item_name,
      price: priceLabel,
      remaining: fmt.number(remaining),
      quantity: fmt.number(order.quantity ?? 0),
    },
  )

  const visibilityLabel =
    order.visibility === "roster_only"
      ? t("BuyOrdersRedesign.rosterOnly", "Roster")
      : order.visibility === "private"
        ? t("BuyOrdersRedesign.targeted", "Targeted")
        : t("BuyOrdersRedesign.public", "Public")

  return (
    <ListingWrapper
      useFixedWidth={false}
      data-testid="buy-order-card"
      data-id={order.buy_order_id}
    >
      <Fade
        in
        timeout={500}
        style={{ transitionDelay: `${50 + 50 * index}ms` }}
      >
        <Card sx={{ height: 300, position: "relative" }}>
          <CardActionArea
            component={Link}
            to={MARKET_PATHS.buyOrder(order.buy_order_id)}
            aria-label={accessibleName}
            sx={{ height: "100%", position: "relative", display: "block" }}
          >
            <CardMedia
              component="img"
              loading="lazy"
              image={imageUrl}
              sx={{
                width: "100%",
                objectFit: "cover",
                ...(isDark
                  ? { height: "100%", aspectRatio: "16/9" }
                  : { height: 180, aspectRatio: "16/9" }),
                overflow: "hidden",
              }}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src = FALLBACK_IMAGE_URL
              }}
              alt={t("marketV2.imageOf", { name: order.game_item_name })}
            />
            <Box
              sx={{
                ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                position: "absolute",
                zIndex: 3,
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                background: cardFadeGradient(theme, 50, 60),
              }}
            />
            <CardContent
              sx={{
                ...(isDark
                  ? {
                      position: "absolute",
                      bottom: 0,
                      zIndex: 4,
                      width: "100%",
                    }
                  : {}),
                maxWidth: "100%",
                padding: "8px 12px !important",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: "0.95rem" }}
                >
                  {priceLabel}
                </Typography>
                <Chip
                  label={visibilityLabel}
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{
                    height: 20,
                    "& .MuiChip-label": { fontSize: "0.65rem", px: 0.75 },
                  }}
                />
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.3,
                  maxHeight: 36,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  mb: 0.5,
                }}
                title={order.game_item_name}
              >
                {order.game_item_name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem", lineHeight: 1, display: "block" }}
              >
                {fmt.number(remaining)} / {fmt.number(order.quantity ?? 0)}{" "}
                {t("market.requested", "requested")}
              </Typography>
              {/* Fulfilment is not wired in Phase 0. Rather than show a disabled
                button (dead affordance), we hide it — it'll be added back as a
                real action when the fulfil flow is wired. */}
            </CardContent>
          </CardActionArea>
        </Card>
      </Fade>
    </ListingWrapper>
  )
}
