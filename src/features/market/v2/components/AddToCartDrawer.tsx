import React, { useState, useMemo } from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material"
import { Close, ShoppingCartRounded, DeleteOutline } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { BottomSheet } from "../../../../components/mobile/BottomSheet"
import {
  useGetListingDetailQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveCartItemMutation,
} from "../../../../store/api/v2/market"
import { useAlertHook, type UnwrappedErrorInterface } from "../../../../hooks/alert/AlertHook"
import { formatQuantity } from "../../../../util/formatQuantity"

interface AddToCartDrawerProps {
  open: boolean
  onClose: () => void
  listingId: string
}

export function AddToCartDrawer({ open, onClose, listingId }: AddToCartDrawerProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const issueAlert = useAlertHook()

  const { data: listingData, isLoading } = useGetListingDetailQuery(
    { id: listingId },
    { skip: !open },
  )
  const { data: cartData } = useGetCartQuery(undefined, { skip: !open })
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()
  const [removeCartItem] = useRemoveCartItemMutation()

  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  const variants = useMemo(() => {
    if (!listingData) return []
    return listingData.items.flatMap((item) =>
      item.variants.map((v) => ({ ...v, itemId: item.item_id })),
    )
  }, [listingData])

  React.useEffect(() => {
    if (variants.length === 1 && !selectedVariantId) {
      setSelectedVariantId(variants[0].variant_id)
    }
  }, [variants, selectedVariantId])

  const selectedVariant = variants.find((v) => v.variant_id === selectedVariantId)

  // How many of this variant are already in cart
  const inCartQty = useMemo(() => {
    if (!cartData?.items || !selectedVariantId) return 0
    return cartData.items
      .filter((ci) => ci.variant?.variant_id === selectedVariantId && ci.listing?.listing_id === listingId)
      .reduce((sum, ci) => sum + ci.quantity, 0)
  }, [cartData, selectedVariantId, listingId])

  // All cart items for this listing (any variant)
  const cartItemsForListing = useMemo(() => {
    if (!cartData?.items) return []
    return cartData.items.filter((ci) => ci.listing?.listing_id === listingId)
  }, [cartData, listingId])

  const listing = listingData?.listing
  const subtotal = (selectedVariant?.price ?? 0) * quantity
  const totalAfterAdd = inCartQty + quantity
  const available = selectedVariant?.quantity ?? 0

  const validationError = useMemo(() => {
    if (!selectedVariant) return null
    if (quantity < 1) return t("cart.invalidQty", "Quantity must be at least 1")
    if (totalAfterAdd > available) {
      return t("cart.exceedsStockWithCart", "Only {{available}} available, cart would have {{total}}", { available, total: totalAfterAdd })
    }
    if (listing?.min_order_quantity && totalAfterAdd < listing.min_order_quantity) return t("cart.belowMinQty", "Minimum quantity: {{min}} (cart has {{total}})", { min: listing.min_order_quantity, total: totalAfterAdd })
    if (listing?.max_order_quantity && totalAfterAdd > listing.max_order_quantity) return t("cart.aboveMaxQty", "Maximum quantity: {{max}} (cart would have {{total}})", { max: listing.max_order_quantity, total: totalAfterAdd })
    return null
  }, [selectedVariant, quantity, listing, totalAfterAdd, available, t])

  const handleAdd = async () => {
    if (!selectedVariantId || quantity < 1 || validationError) return
    try {
      await addToCart({
        addToCartRequest: { listing_id: listingId, variant_id: selectedVariantId, quantity },
      }).unwrap()
      issueAlert({ message: t("cart.added", "Added to cart"), severity: "success" })
      setQuantity(1)
    } catch (err) {
      issueAlert(err as UnwrappedErrorInterface)
    }
  }

  const handleRemoveCartItem = async (cartItemId: string) => {
    try {
      await removeCartItem({ id: cartItemId }).unwrap()
    } catch (err) {
      issueAlert(err as UnwrappedErrorInterface)
    }
  }

  const content = (
    <Stack spacing={2} sx={{ p: isMobile ? 0 : 3, minWidth: isMobile ? undefined : 360 }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : listingData ? (
        <>
          {!isMobile && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">{t("cart.addToCart", "Add to Cart")}</Typography>
              <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </Box>
          )}

          <Typography variant="subtitle2" color="text.secondary">{listingData.listing.title}</Typography>

          {/* Variant selector */}
          {variants.length > 1 ? (
            <TextField
              select fullWidth size="small"
              label={t("cart.variant", "Variant")}
              value={selectedVariantId}
              onChange={(e) => { setSelectedVariantId(e.target.value); setQuantity(1) }}
            >
              {variants.map((v) => (
                <MenuItem key={v.variant_id} value={v.variant_id}>
                  {v.display_name || "Standard"} — {Number(v.price).toLocaleString()} aUEC ({formatQuantity(v.quantity, listingData.listing.quantity_unit)} avail.)
                </MenuItem>
              ))}
            </TextField>
          ) : variants.length === 1 ? (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2">
                {variants[0].display_name || "Standard"} — {Number(variants[0].price).toLocaleString()} aUEC
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatQuantity(variants[0].quantity, listingData.listing.quantity_unit)} {t("cart.available", "available")}
              </Typography>
            </Box>
          ) : null}

          {/* Already in cart indicator */}
          {inCartQty > 0 && (
            <Chip
              label={t("cart.alreadyInCart", "{{count}} already in cart", { count: inCartQty })}
              size="small"
              color="info"
              variant="outlined"
            />
          )}

          {/* Quantity */}
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            size="small" fullWidth
            label={t("cart.quantity", "Quantity")}
            value={quantity}
            onValueChange={(v) => setQuantity(v.floatValue || 1)}
            inputProps={{ min: 1, max: Math.max(0, available - inCartQty) }}
          />

          {/* Subtotal */}
          {selectedVariant && (
            <Typography variant="body1" fontWeight="bold" color="primary">
              {t("cart.subtotal", "Subtotal")}: {Number(subtotal).toLocaleString()} aUEC
            </Typography>
          )}

          {validationError && (
            <Typography variant="caption" color="error">{validationError}</Typography>
          )}

          <Button
            variant="contained" fullWidth
            startIcon={<ShoppingCartRounded />}
            onClick={handleAdd}
            disabled={isAdding || !selectedVariantId || quantity < 1 || !!validationError}
          >
            {isAdding ? t("cart.adding", "Adding...") : t("cart.addToCart", "Add to Cart")}
          </Button>

          {/* Current cart for this listing */}
          {cartItemsForListing.length > 0 && (
            <>
              <Divider />
              <Typography variant="subtitle2" color="text.secondary">
                {t("cart.inCart", "In your cart")}
              </Typography>
              <Stack spacing={1}>
                {cartItemsForListing.map((ci) => (
                  <Box
                    key={ci.cart_item_id}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, bgcolor: "action.hover", borderRadius: 1 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>{ci.variant?.display_name || "Standard"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ci.quantity} × {Number(ci.price_per_unit).toLocaleString()} aUEC = {Number(ci.quantity * ci.price_per_unit).toLocaleString()} aUEC
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveCartItem(ci.cart_item_id)} color="error">
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          {/* View Cart — always visible when cart has items */}
          {(cartData?.item_count ?? 0) > 0 && (
            <Button
              component={Link}
              to="/market/cart"
              variant="outlined"
              fullWidth
              size="small"
              onClick={onClose}
            >
              {t("cart.viewCart", "View Cart")} ({cartData?.item_count ?? 0})
            </Button>
          )}
        </>
      ) : null}
    </Stack>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={t("cart.addToCart", "Add to Cart")}>
        {content}
      </BottomSheet>
    )
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400, maxWidth: "90vw", p: 0 } }}>
      {content}
    </Drawer>
  )
}
