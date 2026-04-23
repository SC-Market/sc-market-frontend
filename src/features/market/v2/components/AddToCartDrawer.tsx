import React, { useState, useMemo } from "react"
import {
  Box,
  Button,
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
import { Close, ShoppingCartRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { BottomSheet } from "../../../../components/mobile/BottomSheet"
import {
  useGetListingDetailQuery,
  useAddToCartMutation,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
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
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation()

  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  // Flatten all variants from all items
  const variants = useMemo(() => {
    if (!listingData) return []
    return listingData.items.flatMap((item: any) =>
      item.variants.map((v: any) => ({ ...v, itemId: item.item_id })),
    )
  }, [listingData])

  // Auto-select first variant
  React.useEffect(() => {
    if (variants.length === 1 && !selectedVariantId) {
      setSelectedVariantId(variants[0].variant_id)
    }
  }, [variants, selectedVariantId])

  const selectedVariant = variants.find((v: any) => v.variant_id === selectedVariantId)

  // Client-side validation
  const listing = listingData?.listing
  const subtotal = (selectedVariant?.price ?? 0) * quantity
  const validationError = useMemo(() => {
    if (!selectedVariant) return null
    if (quantity < 1) return t("cart.invalidQty", "Quantity must be at least 1")
    if (quantity > selectedVariant.quantity) return t("cart.exceedsStock", "Only {{available}} available", { available: selectedVariant.quantity })
    if (listing?.min_order_quantity && quantity < listing.min_order_quantity) return t("cart.belowMinQty", "Minimum quantity: {{min}}", { min: listing.min_order_quantity })
    if (listing?.max_order_quantity && quantity > listing.max_order_quantity) return t("cart.aboveMaxQty", "Maximum quantity: {{max}}", { max: listing.max_order_quantity })
    return null
  }, [selectedVariant, quantity, listing, subtotal, t])

  const handleAdd = async () => {
    if (!selectedVariantId) {
      issueAlert({ message: t("cart.selectVariant", "Please select a variant"), severity: "warning" })
      return
    }
    if (quantity < 1) {
      issueAlert({ message: t("cart.invalidQty", "Quantity must be at least 1"), severity: "warning" })
      return
    }
    if (selectedVariant && quantity > selectedVariant.quantity) {
      issueAlert({ message: t("cart.exceedsStock", "Only {{available}} available", { available: selectedVariant.quantity }), severity: "warning" })
      return
    }
    const listing = listingData?.listing
    if (listing?.min_order_quantity && quantity < listing.min_order_quantity) {
      issueAlert({ message: t("cart.belowMinQty", "Minimum quantity: {{min}}", { min: listing.min_order_quantity }), severity: "warning" })
      return
    }
    if (listing?.max_order_quantity && quantity > listing.max_order_quantity) {
      issueAlert({ message: t("cart.aboveMaxQty", "Maximum quantity: {{max}}", { max: listing.max_order_quantity }), severity: "warning" })
      return
    }
    // Order value limits are checked at checkout, not when adding to cart
    // (users can make offers at different amounts)
    }
    try {
      await addToCart({
        addToCartRequest: {
          listing_id: listingId,
          variant_id: selectedVariantId,
          quantity,
        },
      }).unwrap()
      issueAlert({ message: t("cart.added", "Added to cart"), severity: "success" })
      onClose()
      setQuantity(1)
      setSelectedVariantId("")
    } catch (err: any) {
      issueAlert(err)
    }
  }

  const content = (
    <Stack spacing={2} sx={{ p: isMobile ? 0 : 3, minWidth: isMobile ? undefined : 360 }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : listingData ? (
        <>
          {!isMobile && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {t("cart.addToCart", "Add to Cart")}
              </Typography>
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          )}

          <Typography variant="subtitle2" color="text.secondary">
            {listingData.listing.title}
          </Typography>

          {/* Variant selector — only if multiple */}
          {variants.length > 1 ? (
            <TextField
              select
              fullWidth
              size="small"
              label={t("cart.variant", "Variant")}
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              required
            >
              {variants.map((v: any) => (
                <MenuItem key={v.variant_id} value={v.variant_id}>
                  {v.display_name} — {v.price.toLocaleString()} aUEC ({formatQuantity(v.quantity, listingData.listing.quantity_unit)} avail.)
                </MenuItem>
              ))}
            </TextField>
          ) : variants.length === 1 ? (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body2">
                {variants[0].display_name} — {variants[0].price.toLocaleString()} aUEC
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatQuantity(variants[0].quantity, listingData.listing.quantity_unit)} {t("cart.available", "available")}
              </Typography>
            </Box>
          ) : null}

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
            inputProps={{ min: 1, max: selectedVariant?.quantity }}
            required
          />

          {/* Subtotal */}
          {selectedVariant && (
            <Typography variant="body1" fontWeight="bold" color="primary">
              {t("cart.subtotal", "Subtotal")}: {(selectedVariant.price * quantity).toLocaleString()} aUEC
            </Typography>
          )}

          {/* Validation error */}
          {validationError && (
            <Typography variant="caption" color="error">
              {validationError}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartRounded />}
            onClick={handleAdd}
            disabled={isAdding || !selectedVariantId || quantity < 1 || !!validationError}
          >
            {isAdding ? t("cart.adding", "Adding...") : t("cart.addToCart", "Add to Cart")}
          </Button>
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: "90vw",
          p: 0,
        },
      }}
    >
      {content}
    </Drawer>
  )
}
