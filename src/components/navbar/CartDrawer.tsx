import React from "react"
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material"
import {
  Close,
  DeleteOutlineRounded,
  ShoppingCartCheckoutRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../mobile/BottomSheet"
import {
  useGetCartQuery,
  useRemoveCartItemMutation,
} from "../../store/api/v2/market"
import { formatQuantity } from "../../util/formatQuantity"
import { EmptyCart } from "../empty-states"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !open })
  const [removeItem] = useRemoveCartItemMutation()

  const items = (cart as any)?.data?.items || (cart as any)?.items || []
  const totalPrice = (cart as any)?.data?.total_price || (cart as any)?.total_price || 0
  const itemCount = items.length

  const handleCheckout = () => {
    onClose()
    navigate("/market/cart")
  }

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeItem({ id: cartItemId }).unwrap()
    } catch { /* silent */ }
  }

  const content = (
    <Stack sx={{ height: "100%", p: isMobile ? 0 : 2, minWidth: isMobile ? undefined : 380 }}>
      {!isMobile && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {t("cart.title", "Cart")}
            {itemCount > 0 && (
              <Chip label={itemCount} size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : itemCount === 0 ? (
        <EmptyCart
          sx={{ minHeight: 200, py: 3, px: 2 }}
          action={{
            label: t("cart.browseMarket", "Browse Market"),
            onClick: () => { onClose(); navigate("/market"); },
            variant: "contained",
          }}
        />
      ) : (
        <>
          <Stack spacing={1} sx={{ flex: 1, overflow: "auto", mb: 2 }}>
            {items.map((item: any) => (
              <Box
                key={item.cart_item_id}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: item.price_changed ? "warning.main" : "divider",
                  borderRadius: 1,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {item.listing?.title || "Listing"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.variant?.display_name || "Standard"}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                      <Typography variant="body2">
                        {item.quantity} × {item.price_per_unit?.toLocaleString()} aUEC
                      </Typography>
                    </Box>
                    {item.price_changed && (
                      <Typography variant="caption" color="warning.main">
                        {t("cart.priceChanged", "Price changed")}
                      </Typography>
                    )}
                    {!item.available && (
                      <Typography variant="caption" color="error">
                        {t("cart.unavailable", "Unavailable")}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {item.subtotal?.toLocaleString()} aUEC
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemove(item.cart_item_id)}>
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t("cart.total", "Total")}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {totalPrice.toLocaleString()} aUEC
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartCheckoutRounded />}
            onClick={handleCheckout}
          >
            {t("cart.checkout", "Checkout")} ({itemCount} {itemCount === 1 ? "item" : "items"})
          </Button>
        </>
      )}
    </Stack>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={onClose} title={t("cart.title", "Cart")}>
        {content}
      </BottomSheet>
    )
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, maxWidth: "90vw" } }}
    >
      {content}
    </Drawer>
  )
}
