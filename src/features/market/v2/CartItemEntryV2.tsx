import { WarningRounded } from "@mui/icons-material"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Link as MaterialLink,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { Link } from "react-router-dom"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { CartItemDetail } from "../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { useFormatters } from "../../../util/format"
import {
  formatCraftedSource,
  hasDisplayableSource,
} from "../../../util/variantDisplay"
import { formatMarketUrl } from "../domain/urls"
import { useCartItemActions } from "../hooks/useCartActions"

/**
 * CartItemEntryV2 - Individual cart item with variant details
 *
 * Requirements: 31.4-31.12
 * - Display variant details with quality tier badge
 * - Provide variant selector for changing selection
 * - Inline quantity editing with availability constraint
 * - Show price changes since add-to-cart
 * - Display availability warnings
 * - Remove button functionality
 */
export function CartItemEntryV2(props: {
  item: CartItemDetail
  onRemove: (cartItemId: string) => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { item, onRemove } = props
  const { changeQuantity: handleQuantityChange, isUpdating } =
    useCartItemActions(item.cart_item_id)

  // Price change indicator
  const priceChanged = item.price_changed && item.current_price !== undefined
  const priceDifference = priceChanged
    ? item.current_price! - item.price_per_unit
    : 0

  return (
    <Grid item xs={12} data-testid="cart-item" data-id={item.cart_item_id}>
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"space-between"}
      >
        {/* Avatar */}
        <Grid item>
          <ImageAvatar
            src={FALLBACK_IMAGE_URL}
            alt={item.listing.title}
            variant="rounded"
            sx={{ width: 48, height: 48 }}
            imgProps={{
              loading: "lazy",
              onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = FALLBACK_IMAGE_URL
              },
            }}
          />
        </Grid>

        {/* Item Info Section */}
        <Grid item sx={{ "& > *": { marginBottom: 1 } }}>
          <Box>
            <MaterialLink
              component={Link}
              to={formatMarketUrl(item.listing)}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <UnderlineLink
                color={"text.secondary"}
                variant={"h6"}
                sx={{
                  fontWeight: "600",
                }}
              >
                {item.listing.title}
              </UnderlineLink>
            </MaterialLink>
          </Box>

          {/* Variant Display — rich chips, no duplicates */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexWrap: "wrap",
            }}
          >
            {item.variant.attributes.quality_tier && (
              <QualityBadge
                tier={item.variant.attributes.quality_tier}
                size="small"
              />
            )}
            {item.variant.attributes.quality_value != null && (
              <Chip
                label={`${item.variant.attributes.quality_value}/1000`}
                size="small"
                variant="outlined"
              />
            )}
            {hasDisplayableSource(item.variant.attributes.crafted_source) && (
              <Chip
                label={formatCraftedSource(
                  item.variant.attributes.crafted_source!,
                )}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {/* Others in cart */}
          {(item.others_in_cart ?? 0) > 0 && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ mt: 1, display: "block" }}
            >
              {t(
                "cart.othersInCart",
                "{{count}} other people have this in their cart",
                { count: item.others_in_cart },
              )}
            </Typography>
          )}

          {/* Availability Warning */}
          {!item.available && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <AlertTitle>{t("cart.unavailable", "Unavailable")}</AlertTitle>
              {t(
                "cart.unavailableMessage",
                "This variant is no longer available",
              )}
            </Alert>
          )}

          {/* Price Change Warning */}
          {priceChanged && (
            <Alert severity="info" icon={<WarningRounded />} sx={{ mt: 1 }}>
              <AlertTitle>{t("cart.priceChanged", "Price Changed")}</AlertTitle>
              <Typography variant="body2">
                {priceDifference > 0
                  ? t("cart.priceIncreased", {
                      old: fmt.number(item.price_per_unit),
                      new: fmt.number(item.current_price!),
                    })
                  : t("cart.priceDecreased", {
                      old: fmt.number(item.price_per_unit),
                      new: fmt.number(item.current_price!),
                    })}
              </Typography>
            </Alert>
          )}

          {/* Quantity Input */}
          <Box>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values) => {
                const newQuantity = +(values.floatValue || 1)
                if (newQuantity !== item.quantity) {
                  await handleQuantityChange(newQuantity)
                }
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {t("cart.ofAvailable", {
                      available: fmt.number(item.quantity_available ?? 0),
                    })}
                  </InputAdornment>
                ),
                inputMode: "numeric",
              }}
              size="small"
              label={t("cart.quantity")}
              value={item.quantity}
              disabled={isUpdating || !item.available}
            />
          </Box>
        </Grid>

        {/* Price Section */}
        <Grid item>
          <Box display={"flex"} justifyContent={"space-between"} width={240}>
            <Box sx={{ width: 120 }}>
              <Typography>{t("cart.price")}</Typography>
              <Typography>{t("cart.quantity")}</Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ textAlign: "right" }}>
                {fmt.number(
                  priceChanged ? item.current_price! : item.price_per_unit,
                )}{" "}
                aUEC
              </Typography>
              <Typography sx={{ textAlign: "right" }}>
                x {fmt.number(item.quantity)}
              </Typography>
            </Box>
          </Box>
          <Divider light />
          <Box display={"flex"} justifyContent={"space-between"} width={240}>
            <Box sx={{ width: 120 }}>
              <Typography>{t("cart.subtotal")}</Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ textAlign: "right" }}>
                {fmt.number(item.subtotal)} aUEC
              </Typography>
            </Box>
          </Box>

          {/* Remove Button */}
          <Box>
            <Button
              color={"error"}
              variant={"text"}
              startIcon={<DeleteRounded />}
              size={"small"}
              onClick={() => onRemove(item.cart_item_id)}
              disabled={isUpdating}
              aria-label={t("cart.removeItem", "Remove {{title}} from cart", {
                title: item.listing.title,
              })}
            >
              {t("cart.remove")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}
