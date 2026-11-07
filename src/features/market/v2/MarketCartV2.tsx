import { useCallback, useMemo, useState } from "react"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material"
import { Section } from "../../../components/paper/Section"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import LoadingButton from "@mui/lab/LoadingButton"
import { BackArrow } from "../../../components/button/BackArrow"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { EmptyCart } from "../../../components/empty-states"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import {
  ShoppingCartRounded,
  WarningRounded,
  PlaylistAddRounded,
} from "@mui/icons-material"
import { useGetCartQuery } from "../../../store/api/v2/market"
import { SellerNextAvailable } from "../../../components/market/SellerNextAvailable"
import { ShoppingListPanel } from "../../../components/game-data/ShoppingListPanel"
import { MARKET_PATHS } from "../../../routes/paths"
import { useCartActions } from "../hooks/useCartActions"
import { HelpLink } from "../../help/components/HelpLink"
import { useFormatters } from "../../../util/format"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import { CartItemEntryV2 } from "./CartItemEntryV2"
import { groupCartBySeller } from "./cartSellerGroups"

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
 * - Cart actions go through useCartActions / useCartItemActions
 * - Maintain visual parity with V1 MarketCart component
 */
export function MarketCartV2() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Fetch cart data
  const { data: cartData, isLoading, error } = useGetCartQuery()

  const {
    removeItem: handleRemove,
    checkout,
    isRemoving,
    isCheckingOut,
  } = useCartActions()
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)
  const [checkoutSellerId, setCheckoutSellerId] = useState<string | undefined>()
  const [notes, setNotes] = useState<Record<string, string>>({})

  // Open checkout confirmation dialog
  const handleCheckout = useCallback(
    (sellerId: string) => {
      if (!cartData || cartData.items.length === 0) return
      setCheckoutSellerId(sellerId)
      setCheckoutDialogOpen(true)
    },
    [cartData],
  )

  // Confirm checkout
  const handleConfirmCheckout = useCallback(async () => {
    if (!cartData) return

    // Get note from the first seller group (cart is single-seller)
    const sellerName = cartData.items[0]?.listing.shop_name
    const note = sellerName ? notes[sellerName] : undefined

    await checkout({ items: cartData.items, shopId: checkoutSellerId, note })
    setCheckoutDialogOpen(false)
  }, [cartData, checkout, checkoutSellerId, notes])

  // Check if any items are unavailable
  const hasUnavailableItems = useMemo(
    () => cartData?.items.some((item) => !item.available) ?? false,
    [cartData],
  )

  // Check if any prices changed
  const hasPriceChanges = useMemo(
    () => cartData?.items.some((item) => item.price_changed) ?? false,
    [cartData],
  )

  // Group items by seller
  const sellerGroups = useMemo(
    () => (cartData?.items.length ? groupCartBySeller(cartData.items) : []),
    [cartData],
  )

  // Empty cart state
  if (!isLoading && (!cartData || cartData.items.length === 0)) {
    return (
      <StandardPageLayout
        title={t("marketActions.myCart")}
        breadcrumbs={[
          { label: t("sidebar.market_short"), href: MARKET_PATHS.search },
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
      headerActions={<HelpLink guide="buyAnItem" />}
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
      skeleton={
        <Grid item xs={12}>
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 1 }}
              />
            ))}
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </Grid>
      }
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {sellerGroups.map((group) => (
            <Section
              key={group.sellerName}
              xs={12}
              element_title={
                <UnderlineLink
                  color="text.primary"
                  variant="h6"
                  sx={{ fontWeight: "600" }}
                >
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
                    {fmt.number(group.total)} aUEC
                  </Typography>
                </Box>
              </Grid>

              {/* Note field */}
              <Grid item xs={12}>
                <MarkdownEditor
                  sx={{ marginRight: 2, marginBottom: 1 }}
                  TextFieldProps={{ label: t("cart.note", "Note to seller") }}
                  value={notes[group.sellerName] || ""}
                  onChange={(val: string) =>
                    setNotes((prev) => ({ ...prev, [group.sellerName]: val }))
                  }
                />
              </Grid>

              {/* Offer + Submit */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    "cart.submitOfferDesc",
                    "Submit an offer for this seller's items",
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid
                  container
                  spacing={theme.layoutSpacing.text}
                  justifyContent="right"
                  alignItems="center"
                >
                  <Grid item>
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      size="small"
                      label={t("cart.offerOptional", "Offer (optional)")}
                      value={group.total}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">aUEC</InputAdornment>
                        ),
                      }}
                      inputProps={{ inputMode: "numeric" }}
                    />
                  </Grid>
                  <Grid item>
                    <LoadingButton
                      color="neutral"
                      variant="outlined"
                      startIcon={<ShoppingCartRounded />}
                      loading={isCheckingOut}
                      disabled={hasUnavailableItems || isRemoving}
                      onClick={() => handleCheckout(group.sellerId)}
                      aria-label={t(
                        "cart.submitOfferTo",
                        "Submit offer to {{seller}}",
                        {
                          seller: group.sellerName,
                        },
                      )}
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
              <Alert severity="info" icon={<WarningRounded />}>
                <AlertTitle>
                  {t("cart.pricesChanged", "Prices Have Changed")}
                </AlertTitle>
                {t(
                  "cart.pricesChangedMessage",
                  "Some item prices have changed since you added them to your cart. Please review before checkout.",
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
                  "Some items in your cart are no longer available. Please remove them before checkout.",
                )}
              </Alert>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid item xs={12}>
        {/* Shopping List */}
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            <PlaylistAddRounded
              sx={{ fontSize: 20, mr: 0.5, verticalAlign: "text-bottom" }}
            />
            {t("marketV2.craftingShoppingList")}
          </Typography>
          <ShoppingListPanel />
        </Box>
      </Grid>

      {/* Checkout Confirmation Dialog */}
      <ResponsiveDialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        maxWidth="sm"
        dividers
        title={t("cart.confirmCheckout", "Confirm Checkout")}
        disableClose={isCheckingOut}
        actions={
          <>
            <Button onClick={() => setCheckoutDialogOpen(false)}>
              {t("accessibility.cancel", "Cancel")}
            </Button>
            <LoadingButton
              variant="contained"
              loading={isCheckingOut}
              onClick={handleConfirmCheckout}
            >
              {t("cart.confirmOrder", "Confirm Order")}
            </LoadingButton>
          </>
        }
      >
        {cartData?.items
          .filter((i) => i.listing.shop_id === checkoutSellerId)
          .map((item) => (
            <Box key={item.cart_item_id} sx={{ mb: 1 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {item.listing.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.variant.display_name} × {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {fmt.number(
                    (item.price_changed
                      ? item.current_price!
                      : item.price_per_unit) * item.quantity,
                  )}{" "}
                  aUEC
                </Typography>
              </Box>
              {item.price_changed && (
                <Alert
                  severity="warning"
                  sx={{ mt: 0.5, py: 0 }}
                  icon={<WarningRounded fontSize="small" />}
                >
                  <Typography variant="caption">
                    {t(
                      "cart.priceChangedFrom",
                      "Price changed from {{old}} to {{new}} aUEC",
                      {
                        old: fmt.number(item.price_per_unit),
                        new: fmt.number(item.current_price!),
                      },
                    )}
                  </Typography>
                </Alert>
              )}
            </Box>
          ))}
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{t("cart.total")}</Typography>
          <Typography variant="h6">
            {fmt.number(
              cartData?.items
                .filter((i) => i.listing.shop_id === checkoutSellerId)
                .reduce((s, i) => s + i.subtotal, 0) ?? 0,
            )}{" "}
            aUEC
          </Typography>
        </Box>
        {hasPriceChanges && (
          <Alert severity="info" sx={{ mt: 1 }} icon={<WarningRounded />}>
            {t(
              "cart.confirmPriceChanges",
              "Some prices have changed. By confirming, you accept the updated prices.",
            )}
          </Alert>
        )}
      </ResponsiveDialog>
    </StandardPageLayout>
  )
}
