/**
 * Fulfill a standing buy order from one of the seller's own listings.
 *
 * The backend contract (POST /buy-orders/{id}/fulfill) needs a listing_id and
 * variant_id from a shop the seller can manage; GET
 * /buy-orders/{id}/fulfillment-options lists the seller's listing variants of
 * the item with listed stock, each with the `problem` fulfill would reject it
 * for (above the buyer's maximum price, outside the quality range, order
 * directed at another supplier, ...) or null. Only problem-free options can be
 * picked. The order is created at that listing's price, in that shop.
 */
import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import {
  useGetFulfillmentOptionsQuery,
  type StandingBuyOrder,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { MARKET_PATHS, ORDER_PATHS } from "../../../../routes/paths"
import { remainingQuantity } from "../../domain/buyOrders"
import {
  fulfilMaxQuantity,
  usableFulfilOptions,
  validateFulfil,
} from "../../domain/fulfilBuyOrder"
import { useFormatters } from "../../../../util/format"
import { useFulfillBuyOrder } from "../../hooks/useBuyOrderActions"
import { ResponsiveDialog } from "../../../../components/dialog/ResponsiveDialog"

export interface FulfillBuyOrderDialogProps {
  buyOrder: Pick<
    StandingBuyOrder,
    "buy_order_id" | "game_item_name" | "quantity" | "quantity_fulfilled"
  >
  open: boolean
  onClose: () => void
}

const optionKey = (o: { listing_id: string; variant_id: string }) =>
  `${o.listing_id}:${o.variant_id}`

export function FulfillBuyOrderDialog({
  buyOrder,
  open,
  onClose,
}: FulfillBuyOrderDialogProps) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const remaining = remainingQuantity(buyOrder)

  const { data, isLoading, isError } = useGetFulfillmentOptionsQuery(
    { id: buyOrder.buy_order_id },
    { skip: !open },
  )
  const options = useMemo(() => data?.options ?? [], [data])

  const [selectedKey, setSelectedKey] = useState("")
  const usable = useMemo(() => usableFulfilOptions(options), [options])
  const selected = usable.find((o) => optionKey(o) === selectedKey)
  const maxQuantity = fulfilMaxQuantity(buyOrder, selected)
  const [quantity, setQuantity] = useState(remaining)

  // Preselect the best (cheapest) usable option when the list arrives
  useEffect(() => {
    if (usable.length && !usable.some((o) => optionKey(o) === selectedKey)) {
      setSelectedKey(optionKey(usable[0]))
    }
  }, [usable, selectedKey])
  useEffect(() => setQuantity(maxQuantity), [maxQuantity])

  const { fulfill, isLoading: submitting } = useFulfillBuyOrder()

  const submit = async () => {
    if (!selected) return
    const error = validateFulfil({ buyOrder, option: selected, quantity })
    if (error === "quantity_range") {
      issueAlert({
        message: t(
          "buyorder.fulfillQuantityRange",
          "Quantity must be between 1 and {{max}}",
          {
            max: maxQuantity,
          },
        ),
        severity: "error",
      })
      return
    }
    if (error) return
    const orderId = await fulfill(buyOrder.buy_order_id, {
      listing_id: selected.listing_id,
      variant_id: selected.variant_id,
      quantity,
    })
    if (!orderId) return
    onClose()
    navigate(ORDER_PATHS.detail(orderId))
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={t("buyorder.fulfillTitle", "Fulfill Buy Order")}
      disableClose={submitting}
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel", "Cancel")}</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!selected || submitting}
          >
            {t("MarketAggregateView.fulfill", "Fulfill")}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          {t(
            "buyorder.fulfillOptionsError",
            "Couldn't load your listings. Try again.",
          )}
        </Alert>
      ) : options.length === 0 ? (
        <Stack spacing={2}>
          <Alert severity="info">
            {t(
              "buyorder.noFulfillOptions",
              "None of your shops has an active listing of {{item}} with listed stock.",
              { item: buyOrder.game_item_name },
            )}
          </Alert>
          <Box>
            <Button
              component={RouterLink}
              to={MARKET_PATHS.create}
              variant="outlined"
            >
              {t("buyorder.createListingToFulfill", "Create a listing")}
            </Button>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {usable.length === 0 && (
            <Alert severity="warning">
              {t(
                "buyorder.noUsableFulfillOptions",
                "None of your listings can fill this buy order. The reason is shown under each one.",
              )}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            {t(
              "buyorder.fulfillFromListing",
              "Pick the listing to fill it from. The order uses that listing's price and comes out of its listed stock.",
            )}
          </Typography>
          <RadioGroup
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {options.map((o) => (
              <FormControlLabel
                key={optionKey(o)}
                value={optionKey(o)}
                disabled={o.problem != null}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {o.listing_title} · {o.variant_display_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t(
                        "buyorder.fulfillOptionDetail",
                        "{{price}} aUEC each · {{available}} listed · {{shop}}",
                        {
                          price: fmt.number(o.price_per_unit),
                          available: fmt.number(o.available),
                          shop: o.shop_name,
                        },
                      )}
                    </Typography>
                    {o.problem != null && (
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        {o.problem}
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </RadioGroup>
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={t("buyorder.fulfillQuantity", "Quantity to fulfill")}
            value={quantity}
            onValueChange={(values) => setQuantity(values.floatValue ?? 0)}
            helperText={t(
              "buyorder.fulfillQuantityHelper",
              "Up to {{max}} ({{remaining}} still wanted)",
              {
                max: fmt.number(maxQuantity),
                remaining: fmt.number(remaining),
              },
            )}
          />
          {selected && (
            <Typography variant="subtitle2">
              {t("buyorder.fulfillTotal", "Order total: {{total}} aUEC", {
                total: fmt.number(selected.price_per_unit * quantity),
              })}
            </Typography>
          )}
        </Stack>
      )}
    </ResponsiveDialog>
  )
}
