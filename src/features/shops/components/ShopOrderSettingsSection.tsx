import { useEffect, useId, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import LoadingButton from "@mui/lab/LoadingButton"
import { useGetShopOrderSettingsQuery } from "../../../store/api/v2/market"
import { useSaveShopOrderSettings } from "../hooks/useShopSettingsActions"
import { orderSettingsOps } from "../domain/orderSettingsPlan"
import { FormPaper } from "../../../components/paper/FormPaper"
import {
  ShopStockSettingsFields,
  type AllocationMode,
  type StockTiming,
} from "./ShopStockSettingsFields"

export function ShopOrderSettingsSection({ shopId }: { shopId: string }) {
  const requireAvailabilityHelpId = useId()
  const { t } = useTranslation()
  const { data: settings = [], isLoading } = useGetShopOrderSettingsQuery({
    shopId,
  })
  const saveOrderSettings = useSaveShopOrderSettings(shopId)
  const [saving, setSaving] = useState(false)

  // Local form state
  const [offerMessage, setOfferMessage] = useState("")
  const [offerEnabled, setOfferEnabled] = useState(true)
  const [orderMessage, setOrderMessage] = useState("")
  const [orderEnabled, setOrderEnabled] = useState(true)
  const [requireAvailability, setRequireAvailability] = useState(false)
  const [stockTiming, setStockTiming] = useState<StockTiming>("on_accepted")
  const [allocationMode, setAllocationMode] = useState<AllocationMode>("auto")
  const [minOrderSize, setMinOrderSize] = useState("")
  const [minOrderSizeEnabled, setMinOrderSizeEnabled] = useState(false)
  const [maxOrderSize, setMaxOrderSize] = useState("")
  const [maxOrderSizeEnabled, setMaxOrderSizeEnabled] = useState(false)
  const [minOrderValue, setMinOrderValue] = useState("")
  const [minOrderValueEnabled, setMinOrderValueEnabled] = useState(false)
  const [maxOrderValue, setMaxOrderValue] = useState("")
  const [maxOrderValueEnabled, setMaxOrderValueEnabled] = useState(false)

  // Hydrate from fetched settings
  useEffect(() => {
    if (settings.length === 0) return
    const find = (type: string) => settings.find((s) => s.setting_type === type)
    const offer = find("offer_message")
    if (offer) {
      setOfferMessage(offer.message_content)
      setOfferEnabled(offer.enabled)
    }
    const order = find("order_message")
    if (order) {
      setOrderMessage(order.message_content)
      setOrderEnabled(order.enabled)
    }
    const avail = find("require_availability")
    if (avail) setRequireAvailability(avail.enabled)
    const timing = find("stock_subtraction_timing")
    // A disabled or unknown row counts as the default, as on the server.
    if (
      timing?.enabled &&
      ["on_received", "dont_subtract"].includes(timing.message_content)
    ) {
      setStockTiming(timing.message_content as typeof stockTiming)
    }
    const alloc = find("allocation_mode")
    if (alloc) setAllocationMode(alloc.message_content as typeof allocationMode)
    const mins = find("min_order_size")
    if (mins) {
      setMinOrderSize(mins.message_content)
      setMinOrderSizeEnabled(mins.enabled)
    }
    const maxs = find("max_order_size")
    if (maxs) {
      setMaxOrderSize(maxs.message_content)
      setMaxOrderSizeEnabled(maxs.enabled)
    }
    const minv = find("min_order_value")
    if (minv) {
      setMinOrderValue(minv.message_content)
      setMinOrderValueEnabled(minv.enabled)
    }
    const maxv = find("max_order_value")
    if (maxv) {
      setMaxOrderValue(maxv.message_content)
      setMaxOrderValueEnabled(maxv.enabled)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    await saveOrderSettings(
      orderSettingsOps(
        {
          offerMessage,
          offerEnabled,
          orderMessage,
          orderEnabled,
          requireAvailability,
          stockTiming,
          allocationMode,
          minOrderSize,
          minOrderSizeEnabled,
          maxOrderSize,
          maxOrderSizeEnabled,
          minOrderValue,
          minOrderValueEnabled,
          maxOrderValue,
          maxOrderValueEnabled,
        },
        settings.map((s) => s.setting_type),
      ),
    )
    setSaving(false)
  }

  if (isLoading) {
    return (
      <FormPaper
        title={t("shopsUi.orderSettings.title")}
        subtitle={t("shops.profile.loading")}
      >
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Grid>
      </FormPaper>
    )
  }

  return (
    <>
      {/* Order Messages */}
      <FormPaper
        title={t("shopsUi.orderSettings.messagesTitle")}
        subtitle={t("shopsUi.orderSettings.messagesSubtitle")}
      >
        <Grid item xs={12}>
          <Box mb={2}>
            <LabeledSwitch
              checked={offerEnabled}
              onChange={setOfferEnabled}
              disabled={saving}
              label={t("shopsUi.orderSettings.offerEnabled")}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label={t("shopsUi.orderSettings.offerMessage")}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              disabled={saving || !offerEnabled}
              placeholder={t("shopsUi.orderSettings.offerPlaceholder")}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={2}>
            <LabeledSwitch
              checked={orderEnabled}
              onChange={setOrderEnabled}
              disabled={saving}
              label={t("shopsUi.orderSettings.orderEnabled")}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label={t("shopsUi.orderSettings.orderMessage")}
              value={orderMessage}
              onChange={(e) => setOrderMessage(e.target.value)}
              disabled={saving || !orderEnabled}
              placeholder={t("shopsUi.orderSettings.orderPlaceholder")}
            />
          </Box>
        </Grid>
      </FormPaper>

      {/* Order Requirements */}
      <FormPaper
        title={t("shopsUi.orderSettings.requirementsTitle")}
        subtitle={t("shopsUi.orderSettings.requirementsSubtitle")}
      >
        <Grid item xs={12}>
          <LabeledSwitch
            checked={requireAvailability}
            onChange={setRequireAvailability}
            disabled={saving}
            label={t("shopsUi.orderSettings.requireAvailability")}
            describedBy={requireAvailabilityHelpId}
          />
          <Typography
            id={requireAvailabilityHelpId}
            variant="body2"
            color="text.secondary"
          >
            {t("shopsUi.orderSettings.requireAvailabilityHelp")}
          </Typography>
        </Grid>
      </FormPaper>

      <ShopStockSettingsFields
        stockTiming={stockTiming}
        setStockTiming={setStockTiming}
        allocationMode={allocationMode}
        setAllocationMode={setAllocationMode}
        saving={saving}
      />

      {/* Order Limits */}
      <FormPaper
        title={t("shopsUi.orderSettings.limitsTitle")}
        subtitle={t("shopsUi.orderSettings.limitsSubtitle")}
      >
        <Grid item xs={12} md={6}>
          <LabeledSwitch
            checked={minOrderSizeEnabled}
            onChange={setMinOrderSizeEnabled}
            disabled={saving}
            label={t("shopsUi.orderSettings.minSize")}
          />
          <TextField
            fullWidth
            type="number"
            size="small"
            inputProps={{
              "aria-label": t("shopsUi.orderSettings.minSizeAria"),
            }}
            value={minOrderSize}
            onChange={(e) => setMinOrderSize(e.target.value)}
            disabled={saving || !minOrderSizeEnabled}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {t("shopsUi.orderSettings.itemsUnit")}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabeledSwitch
            checked={maxOrderSizeEnabled}
            onChange={setMaxOrderSizeEnabled}
            disabled={saving}
            label={t("shopsUi.orderSettings.maxSize")}
          />
          <TextField
            fullWidth
            type="number"
            size="small"
            inputProps={{
              "aria-label": t("shopsUi.orderSettings.maxSizeAria"),
            }}
            value={maxOrderSize}
            onChange={(e) => setMaxOrderSize(e.target.value)}
            disabled={saving || !maxOrderSizeEnabled}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {t("shopsUi.orderSettings.itemsUnit")}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabeledSwitch
            checked={minOrderValueEnabled}
            onChange={setMinOrderValueEnabled}
            disabled={saving}
            label={t("shopsUi.orderSettings.minValue")}
          />
          <TextField
            fullWidth
            type="number"
            size="small"
            inputProps={{
              "aria-label": t("shopsUi.orderSettings.minValueAria"),
            }}
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            disabled={saving || !minOrderValueEnabled}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <LabeledSwitch
            checked={maxOrderValueEnabled}
            onChange={setMaxOrderValueEnabled}
            disabled={saving}
            label={t("shopsUi.orderSettings.maxValue")}
          />
          <TextField
            fullWidth
            type="number"
            size="small"
            inputProps={{
              "aria-label": t("shopsUi.orderSettings.maxValueAria"),
            }}
            value={maxOrderValue}
            onChange={(e) => setMaxOrderValue(e.target.value)}
            disabled={saving || !maxOrderValueEnabled}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            variant="contained"
            loading={saving}
            onClick={handleSave}
          >
            {t("shopsUi.orderSettings.save")}
          </LoadingButton>
        </Grid>
      </FormPaper>
    </>
  )
}
