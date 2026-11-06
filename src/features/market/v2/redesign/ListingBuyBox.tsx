import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Fade,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import RemoveRounded from "@mui/icons-material/RemoveRounded"
import AddShoppingCartRounded from "@mui/icons-material/AddShoppingCartRounded"
import BoltRounded from "@mui/icons-material/BoltRounded"
import GavelRounded from "@mui/icons-material/GavelRounded"
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../../../util/format"
import { NUMERIC_SX } from "../../../../hooks/styles/theme/fonts"

/** Quantity stepper, subtotal and Buy / Add to cart actions. */
export function ListingBuyBox({
  canTransact,
  effectiveQty,
  minOrder,
  clampedMax,
  maxQty,
  setQty,
  subtotal,
  isNegotiable,
  isBuying,
  isAdding,
  handleBuyNow,
  handleAddToCart,
}: {
  canTransact: boolean
  effectiveQty: number
  minOrder: number
  clampedMax: number
  maxQty: number
  setQty: React.Dispatch<React.SetStateAction<number>>
  subtotal: number
  isNegotiable: boolean
  isBuying: boolean
  isAdding: boolean
  handleBuyNow: () => void
  handleAddToCart: () => void
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: "text.primary", mb: 0.5 }}>
              {t("MarketDetailRedesign.quantityLabel", "Quantity")}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => setQty((q) => Math.max(minOrder, q - 1))}
                aria-label={t(
                  "MarketDetailRedesign.decreaseQuantity",
                  "Decrease quantity",
                )}
                disabled={!canTransact || effectiveQty <= minOrder}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <RemoveRounded />
              </IconButton>
              <TextField
                value={effectiveQty}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  setQty(Number.isFinite(n) ? n : 1)
                }}
                type="number"
                size="small"
                sx={{ width: 100 }}
                inputProps={{
                  min: minOrder,
                  max: clampedMax,
                  style: { textAlign: "center" },
                }}
              />
              <IconButton
                onClick={() => setQty((q) => Math.min(clampedMax, q + 1))}
                aria-label={t(
                  "MarketDetailRedesign.increaseQuantity",
                  "Increase quantity",
                )}
                disabled={!canTransact || effectiveQty >= clampedMax}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <AddRounded />
              </IconButton>
              <Typography variant="body2" sx={{ color: "text.primary", ml: 1 }}>
                {t("MarketDetailRedesign.ofAvailable", "of {{count}}", {
                  count: maxQty,
                })}
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
              {t("MarketDetailRedesign.subtotal", "Subtotal")}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                ...NUMERIC_SX,
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              {fmt.price(subtotal)}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<BoltRounded />}
              disabled={!canTransact || isBuying}
              onClick={handleBuyNow}
            >
              {isNegotiable
                ? t("MarketDetailRedesign.makeOffer", "Make an offer")
                : t("MarketDetailRedesign.buyNow", "Buy now")}
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              size="large"
              fullWidth
              startIcon={<AddShoppingCartRounded />}
              disabled={!canTransact || isAdding}
              onClick={handleAddToCart}
            >
              {t("MarketDetailRedesign.addToCart", "Add to cart")}
            </Button>
          </Stack>

          {/* Phase 0: visual only — messaging/Contact-seller thread UI is
              explicitly deferred; this is a disabled stub per the plan. */}
          <Tooltip
            title={t(
              "MarketDetailRedesign.contactComingSoon",
              "Messaging is coming soon",
            )}
          >
            <span>
              <Button
                variant="text"
                color="inherit"
                fullWidth
                disabled
                startIcon={<ChatBubbleOutlineRounded />}
              >
                {t("MarketDetailRedesign.contactSeller", "Contact seller")}
              </Button>
            </span>
          </Tooltip>

          {!canTransact && (
            <Alert severity="info" variant="outlined">
              {t(
                "MarketDetailRedesign.unavailable",
                "This listing is not currently available to purchase.",
              )}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

/**
 * AuctionPanel — Phase 0: visual only. The existing V2 API exposes bid/auction
 * detail hooks, but wiring live bidding is out of scope for the Phase 0 redesign,
 * so this shows the bid affordance without submitting.
 */
export function AuctionPanel() {
  const { t } = useTranslation()
  const [bid, setBid] = useState("")
  const [placed, setPlaced] = useState(false)

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            {t("MarketDetailRedesign.placeBid", "Place a bid")}
          </Typography>
          <TextField
            fullWidth
            type="number"
            label={t("MarketDetailRedesign.yourBid", "Your bid (aUEC)")}
            value={bid}
            onChange={(e) => setBid(e.target.value)}
          />
          <Button
            variant="contained"
            color="warning"
            size="large"
            startIcon={<GavelRounded />}
            disabled={!bid}
            onClick={() => setPlaced(true)}
          >
            {t("MarketDetailRedesign.submitBid", "Submit bid")}
          </Button>
          <Collapse in={placed}>
            <Fade in={placed}>
              <Alert severity="info" variant="outlined">
                {t(
                  "MarketDetailRedesign.bidPreview",
                  "Bidding is being wired up — your bid was not submitted.",
                )}
              </Alert>
            </Fade>
          </Collapse>
        </Stack>
      </CardContent>
    </Card>
  )
}
