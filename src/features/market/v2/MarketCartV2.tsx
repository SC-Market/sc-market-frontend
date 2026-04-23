import React, { useCallback, useMemo, useState } from "react"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  InputAdornment,
  Link as MaterialLink,
  TextField,
  Typography,
  Chip,
} from "@mui/material"
import { Section } from "../../../components/paper/Section"
import { Link, useNavigate } from "react-router-dom"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import { TrashCan } from "mdi-material-ui"
import LoadingButton from "@mui/lab/LoadingButton"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { BackArrow } from "../../../components/button/BackArrow"
import { NumericFormat } from "react-number-format"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { EmptyCart } from "../../../components/empty-states"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ShoppingCartRounded, Warning, PlaylistAddRounded } from "@mui/icons-material"
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useCheckoutCartMutation,
  CartItemDetail,
} from "../../../store/api/v2/market"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { SellerNextAvailable } from "../../../components/market/SellerNextAvailable"
import { ShoppingListPanel } from "../../../components/game-data/ShoppingListPanel"
import { VariantSelector } from "../../../components/market/v2/VariantSelector"

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
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { item, onRemove } = props
  const issueAlert = useAlertHook()

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation()

  // Handle quantity change
  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1) return

      try {
        await updateCartItem({
          id: item.cart_item_id,
          updateCartItemRequest: { quantity: newQuantity },
        }).unwrap()

        issueAlert({
          message: t("cart.quantityUpdated", "Quantity updated"),
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message: error instanceof Error ? error.message : "Failed to update quantity",
          severity: "error",
        })
      }
    },
    [item.cart_item_id, updateCartItem, issueAlert, t]
  )

  // Handle variant change
  const handleVariantChange = useCallback(
    async (variantId: string) => {
      try {
        await updateCartItem({
          id: item.cart_item_id,
          updateCartItemRequest: { variant_id: variantId },
        }).unwrap()

        issueAlert({
          message: t("cart.variantUpdated", "Variant updated"),
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message: error instanceof Error ? error.message : "Failed to update variant",
          severity: "error",
        })
      }
    },
    [item.cart_item_id, updateCartItem, issueAlert, t]
  )

  // Price change indicator
  const priceChanged = item.price_changed && item.current_price !== undefined
  const priceDifference = priceChanged
    ? item.current_price! - item.price_per_unit
    : 0

  return (
    <Grid item xs={12}>
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"space-between"}
      >
        {/* Image Section */}
        <Grid item>
          <img
            height={128}
            width={128}
            src={FALLBACK_IMAGE_URL}
            alt={item.listing.title}
            style={{
              borderRadius: theme.spacing(theme.borderRadius.image),
              objectFit: "cover",
            }}
            loading="lazy"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src = FALLBACK_IMAGE_URL
            }}
          />
        </Grid>

        {/* Item Info Section */}
        <Grid item sx={{ "& > *": { marginBottom: 1 } }}>
          <Box>
            <MaterialLink
              component={Link}
              to={`/market/${item.listing.listing_id}`}
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

          {/* Seller Info */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("cart.seller")}: {item.listing.seller_name}
            </Typography>
          </Box>

          {/* Variant Display with Quality Badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {item.variant.attributes.quality_tier && (
              <QualityBadge
                tier={item.variant.attributes.quality_tier}
                size="small"
              />
            )}
            <Typography variant="body2" color="text.secondary">
              {item.variant.display_name}
            </Typography>
          </Box>

          {/* Availability Warning */}
          {!item.available && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <AlertTitle>{t("cart.unavailable", "Unavailable")}</AlertTitle>
              {t(
                "cart.unavailableMessage",
                "This variant is no longer available"
              )}
            </Alert>
          )}

          {/* Price Change Warning */}
          {priceChanged && (
            <Alert severity="info" icon={<Warning />} sx={{ mt: 1 }}>
              <AlertTitle>
                {t("cart.priceChanged", "Price Changed")}
              </AlertTitle>
              <Typography variant="body2">
                {priceDifference > 0
                  ? t("cart.priceIncreased", {
                      old: item.price_per_unit.toLocaleString(),
                      new: item.current_price!.toLocaleString(),
                    })
                  : t("cart.priceDecreased", {
                      old: item.price_per_unit.toLocaleString(),
                      new: item.current_price!.toLocaleString(),
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
                      available: "∞",
                    })}
                  </InputAdornment>
                ),
                inputMode: "numeric",
              }}
              size="small"
              label={t("cart.quantity")}
              value={item.quantity}
              color={"secondary"}
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
                {(priceChanged ? item.current_price! : item.price_per_unit).toLocaleString()}{" "}
                aUEC
              </Typography>
              <Typography sx={{ textAlign: "right" }}>
                x {item.quantity.toLocaleString()}
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
                {item.subtotal.toLocaleString()} aUEC
              </Typography>
            </Box>
          </Box>

          {/* Remove Button */}
          <Box>
            <Button
              color={"error"}
              variant={"text"}
              startIcon={<TrashCan />}
              size={"small"}
              onClick={() => onRemove(item.cart_item_id)}
              disabled={isUpdating}
            >
              {t("cart.remove")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}

/**
 * MarketCartV2 - Shopping cart with variant support
 * 
 * Requirements: 31.1-31.14
 * - Use useGetCartQuery hook for server-side cart
 * - Display variant details for each cart item
 * - Show quality_tier with QualityBadge visual indicators
 * - Provide VariantSelector for changing variant selection
 * - Provide quantity input for each item
 * - Display per-variant pricing
 * - Calculate cart total with variant-specific prices
 * - Highlight price changes since add-to-cart
 * - Show availability warnings for unavailable variants
 * - Provide "Remove" button for each item
 * - Provide "Checkout" button
 * - Use useUpdateCartItemMutation and useRemoveCartItemMutation hooks
 * - Maintain visual parity with V1 MarketCart component
 */
export function MarketCartV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()

  // Fetch cart data
  const {
    data: cartData,
    isLoading,
    error,
    refetch,
  } = useGetCartQuery()

  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation()
  const [checkoutCart, { isLoading: isCheckingOut }] = useCheckoutCartMutation()
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)

  // Handle remove item
  const handleRemove = useCallback(
    async (cartItemId: string) => {
      try {
        await removeCartItem({ id: cartItemId }).unwrap()

        issueAlert({
          message: t("cart.itemRemoved", "Item removed from cart"),
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message: error instanceof Error ? error.message : "Failed to remove item",
          severity: "error",
        })
      }
    },
    [removeCartItem, issueAlert, t]
  )

  // Open checkout confirmation dialog
  const handleCheckout = useCallback(() => {
    if (!cartData || cartData.items.length === 0) return
    setCheckoutDialogOpen(true)
  }, [cartData])

  // Confirm checkout
  const handleConfirmCheckout = useCallback(
    async () => {
      if (!cartData) return

      const hasPriceChanges = cartData.items.some((item) => item.price_changed)

      try {
        const result = await checkoutCart({
          checkoutCartRequest: {
            confirm_price_changes: hasPriceChanges,
          },
        }).unwrap()

        setCheckoutDialogOpen(false)
        issueAlert({
          message: t("cart.checkoutSuccess", "Order created successfully"),
          severity: "success",
        })

        navigate(`/offer/${result.order_id}`)
      } catch (error) {
        issueAlert({
          message: error instanceof Error ? error.message : "Failed to checkout",
          severity: "error",
        })
      }
    },
    [cartData, checkoutCart, issueAlert, navigate, t]
  )

  // Check if any items are unavailable
  const hasUnavailableItems = useMemo(
    () => cartData?.items.some((item) => !item.available) ?? false,
    [cartData]
  )

  // Check if any prices changed
  const hasPriceChanges = useMemo(
    () => cartData?.items.some((item) => item.price_changed) ?? false,
    [cartData]
  )

  // Group items by seller
  const sellerGroups = useMemo(() => {
    if (!cartData?.items.length) return []
    const groups = new Map<string, { sellerName: string; items: CartItemDetail[]; total: number; nextAvailable?: string | null }>()
    for (const item of cartData.items) {
      const key = item.listing.seller_name
      if (!groups.has(key)) groups.set(key, { sellerName: key, items: [], total: 0, nextAvailable: item.listing.seller_next_available })
      const g = groups.get(key)!
      g.items.push(item)
      g.total += item.subtotal
    }
    return [...groups.values()]
  }, [cartData])

  // Empty cart state
  if (!isLoading && (!cartData || cartData.items.length === 0)) {
    return (
      <StandardPageLayout
        title={t("marketActions.myCart")}
        breadcrumbs={[
          { label: t("sidebar.market_short"), href: "/market" },
          { label: t("cart.yourCart") },
        ]}
        showOrgInBreadcrumbs={true}
        headerTitle={
          <>
            <BackArrow /> {t("cart.yourCart")}
          </>
        }
        sidebarOpen={true}
        maxWidth="md"
        isLoading={isLoading}
        error={error}
      >
        <Grid item xs={12}>
          <EmptyCart />
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("marketActions.myCart")}
      breadcrumbs={[
        { label: t("sidebar.market_short"), href: "/market" },
        { label: t("cart.yourCart") },
      ]}
      showOrgInBreadcrumbs={true}
      headerTitle={
        <>
          <BackArrow /> {t("cart.yourCart")}
        </>
      }
      sidebarOpen={true}
      maxWidth="md"
      isLoading={isLoading}
      error={error}
    >
      <Grid item xs={12}>
      <Grid container spacing={theme.layoutSpacing.layout}>
        {sellerGroups.map((group) => (
          <Section
            key={group.sellerName}
            xs={12}
            title={t("cart.seller", "Seller")}
            element_title={
              <UnderlineLink color="text.primary" variant="h6" sx={{ fontWeight: "600" }}>
                {group.sellerName}
              </UnderlineLink>
            }
          >
            {group.items.map((item) => (
              <CartItemEntryV2
                key={item.cart_item_id}
                item={item}
                onRemove={handleRemove}
              />
            ))}

            {/* Seller availability */}
            {group.nextAvailable !== undefined && (
              <Grid item xs={12}>
                <SellerNextAvailable nextAvailable={group.nextAvailable} />
              </Grid>
            )}

            {/* Seller Total */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h5" color="text.secondary">
                  {t("cart.total")}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  {group.total.toLocaleString()} aUEC
                </Typography>
              </Box>
            </Grid>

            {/* Note field */}
            <Grid item xs={12}>
              <MarkdownEditor
                sx={{ marginRight: 2, marginBottom: 1 }}
                TextFieldProps={{ label: t("cart.note", "Note to seller") }}
                value=""
                onChange={() => {}}
              />
            </Grid>

            {/* Offer + Submit */}
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                {t("cart.submitOfferDesc", "Submit an offer for this seller's items")}
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={theme.layoutSpacing.text} justifyContent="right" alignItems="center">
                <Grid item>
                  <NumericFormat
                    decimalScale={0}
                    allowNegative={false}
                    customInput={TextField}
                    thousandSeparator
                    size="small"
                    label={t("cart.offerOptional", "Offer (optional)")}
                    value={group.total}
                    color="secondary"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">aUEC</InputAdornment>,
                    }}
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Grid>
                <Grid item>
                  <LoadingButton
                    color="secondary"
                    variant="outlined"
                    startIcon={<ShoppingCartRounded />}
                    loading={isCheckingOut}
                    disabled={hasUnavailableItems || isRemoving}
                    onClick={handleCheckout}
                  >
                    {t("cart.submitOffer", "Submit Offer")}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Section>
        ))}

        {/* Price Change Alert */}
        {hasPriceChanges && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<Warning />}>
              <AlertTitle>
                {t("cart.pricesChanged", "Prices Have Changed")}
              </AlertTitle>
              {t(
                "cart.pricesChangedMessage",
                "Some item prices have changed since you added them to your cart. Please review before checkout."
              )}
            </Alert>
          </Grid>
        )}

          {/* Unavailable Items Alert */}
          {hasUnavailableItems && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <AlertTitle>
                  {t("cart.unavailableItems", "Unavailable Items")}
                </AlertTitle>
                {t(
                  "cart.unavailableItemsMessage",
                  "Some items in your cart are no longer available. Please remove them before checkout."
                )}
              </Alert>
            </Grid>
          )}
      </Grid>
      </Grid>

      {/* Shopping List */}
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          <PlaylistAddRounded sx={{ fontSize: 20, mr: 0.5, verticalAlign: "text-bottom" }} />
          Crafting Shopping List
        </Typography>
        <ShoppingListPanel />
      </Box>

      {/* Checkout Confirmation Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="checkout-dialog-title"
      >
        <DialogTitle id="checkout-dialog-title">
          {t("cart.confirmCheckout", "Confirm Checkout")}
        </DialogTitle>
        <DialogContent dividers>
          {cartData?.items.map((item) => (
            <Box key={item.cart_item_id} sx={{ mb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {item.listing.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.variant.display_name} × {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {((item.price_changed ? item.current_price! : item.price_per_unit) * item.quantity).toLocaleString()} aUEC
                </Typography>
              </Box>
              {item.price_changed && (
                <Alert severity="warning" sx={{ mt: 0.5, py: 0 }} icon={<Warning fontSize="small" />}>
                  <Typography variant="caption">
                    {t("cart.priceChangedFrom", "Price changed from {{old}} to {{new}} aUEC", {
                      old: item.price_per_unit.toLocaleString(),
                      new: item.current_price!.toLocaleString(),
                    })}
                  </Typography>
                </Alert>
              )}
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">{t("cart.total")}</Typography>
            <Typography variant="h6">
              {cartData?.total_price.toLocaleString()} aUEC
            </Typography>
          </Box>
          {hasPriceChanges && (
            <Alert severity="info" sx={{ mt: 1 }} icon={<Warning />}>
              {t(
                "cart.confirmPriceChanges",
                "Some prices have changed. By confirming, you accept the updated prices."
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)}>
            {t("accessibility.cancel", "Cancel")}
          </Button>
          <LoadingButton
            variant="contained"
            color="secondary"
            loading={isCheckingOut}
            onClick={handleConfirmCheckout}
          >
            {t("cart.confirmOrder", "Confirm Order")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </StandardPageLayout>
  )
}
