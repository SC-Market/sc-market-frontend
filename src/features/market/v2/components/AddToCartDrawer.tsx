import React, { useState, useMemo } from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"
import {
  AddShoppingCartRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { MobileSidebarWrapper } from "../../../../components/mobile/MobileSidebarWrapper"
import { useGetListingDetailQuery } from "../../../../store/api/v2/market"
import { useDomainCart } from "../../hooks/useDomainCart"
import { MARKET_PATHS } from "../../../../routes/paths"

import { useFormatters } from "../../../../util/format"
import { useAddToCart, useRemoveCartItem } from "../../hooks/useCartActions"
interface AddToCartDrawerProps {
  open: boolean
  onClose: () => void
  listingId: string
}

export function AddToCartDrawer({
  open,
  onClose,
  listingId,
}: AddToCartDrawerProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()

  const { data: listingData, isLoading } = useGetListingDetailQuery(
    { id: listingId },
    { skip: !open },
  )
  const { data: cartData } = useDomainCart({ skip: !open })
  const { add: addToCart, isAdding } = useAddToCart()
  const handleRemoveCartItem = useRemoveCartItem()

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

  const selectedVariant = variants.find(
    (v) => v.variant_id === selectedVariantId,
  )

  // How many of this variant are already in cart
  const inCartQty = useMemo(() => {
    if (!cartData?.items || !selectedVariantId) return 0
    return cartData.items
      .filter(
        (ci) =>
          ci.variant?.variant_id === selectedVariantId &&
          ci.listing?.listing_id === listingId,
      )
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
      return t(
        "cart.exceedsStockWithCart",
        "Only {{available}} available, cart would have {{total}}",
        { available, total: totalAfterAdd },
      )
    }
    if (
      listing?.min_order_quantity &&
      totalAfterAdd < listing.min_order_quantity
    )
      return t(
        "cart.belowMinQty",
        "Minimum quantity: {{min}} (cart has {{total}})",
        { min: listing.min_order_quantity, total: totalAfterAdd },
      )
    if (
      listing?.max_order_quantity &&
      totalAfterAdd > listing.max_order_quantity
    )
      return t(
        "cart.aboveMaxQty",
        "Maximum quantity: {{max}} (cart would have {{total}})",
        { max: listing.max_order_quantity, total: totalAfterAdd },
      )
    return null
  }, [selectedVariant, quantity, listing, totalAfterAdd, available, t])

  const handleAdd = async () => {
    if (!selectedVariantId || quantity < 1 || validationError) return
    const added = await addToCart(
      { listing_id: listingId, variant_id: selectedVariantId, quantity },
      t("cart.added", "Added to cart"),
    )
    if (added) setQuantity(1)
  }

  const content = (
    <Stack spacing={2}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : listingData ? (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            {listingData.listing.title}
          </Typography>

          {/* Variant selector */}
          {variants.length > 1 ? (
            <TextField
              select
              fullWidth
              size="small"
              label={t("cart.variant", "Variant")}
              value={selectedVariantId}
              onChange={(e) => {
                setSelectedVariantId(e.target.value)
                setQuantity(1)
              }}
            >
              {variants.map((v) => (
                <MenuItem key={v.variant_id} value={v.variant_id}>
                  {v.display_name || t("marketV2.standardVariant")} —{" "}
                  {fmt.number(v.price)} aUEC (
                  {t("marketV2.availShort", {
                    quantity: fmt.quantity(
                      v.quantity,
                      listingData.listing.quantity_unit,
                    ),
                  })}
                  )
                </MenuItem>
              ))}
            </TextField>
          ) : variants.length === 1 ? (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2">
                {variants[0].display_name || t("marketV2.standardVariant")} —{" "}
                {fmt.number(variants[0].price)} aUEC
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmt.quantity(
                  variants[0].quantity,
                  listingData.listing.quantity_unit,
                )}{" "}
                {t("cart.available", "available")}
              </Typography>
            </Box>
          ) : null}

          {/* Already in cart indicator */}
          {inCartQty > 0 && (
            <Chip
              label={t("cart.alreadyInCart", "{{count}} already in cart", {
                count: inCartQty,
              })}
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
            size="small"
            fullWidth
            label={t("cart.quantity", "Quantity")}
            value={quantity}
            onValueChange={(v) => setQuantity(v.floatValue || 1)}
            inputProps={{ min: 1, max: Math.max(0, available - inCartQty) }}
          />

          {/* Subtotal */}
          {selectedVariant && (
            <Typography variant="body1" fontWeight="bold" color="primary">
              {t("cart.subtotal", "Subtotal")}: {fmt.number(subtotal)} aUEC
            </Typography>
          )}

          {validationError && (
            <Typography variant="caption" color="error">
              {validationError}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddShoppingCartRounded />}
            onClick={handleAdd}
            disabled={
              isAdding ||
              !selectedVariantId ||
              quantity < 1 ||
              !!validationError
            }
          >
            {isAdding
              ? t("cart.adding", "Adding...")
              : t("cart.addToCart", "Add to Cart")}
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
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {ci.variant?.display_name ||
                          t("marketV2.standardVariant")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ci.quantity} × {fmt.number(ci.price_per_unit)} aUEC ={" "}
                        {fmt.number(ci.quantity * ci.price_per_unit)} aUEC
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveCartItem(ci.cart_item_id)}
                      color="error"
                      aria-label={t(
                        "cart.removeItem",
                        "Remove {{title}} from cart",
                        {
                          title: `${listingData.listing.title} (${ci.variant?.display_name || t("marketV2.standardVariant")})`,
                        },
                      )}
                    >
                      <DeleteOutlineRounded fontSize="small" />
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
              to={MARKET_PATHS.cart}
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

  // Bottom sheet on phones, a right-hand drawer on desktop
  return (
    <MobileSidebarWrapper
      open={open}
      onClose={onClose}
      title={t("cart.addToCart", "Add to Cart")}
      anchor="right"
      drawerWidth={400}
      contentPadding={3}
    >
      {content}
    </MobileSidebarWrapper>
  )
}
