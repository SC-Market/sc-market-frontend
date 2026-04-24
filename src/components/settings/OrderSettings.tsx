import React from "react"
import {
  Box,
  Grid,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment,
} from "@mui/material"
import { FlatSection } from "../paper/Section"
import { useTranslation } from "react-i18next"
import { useOrderSettings } from "../../features/orders/hooks/useOrderSettings"

interface OrderSettingsProps {
  entityType: "user" | "contractor"
  entityId?: string
}

export function OrderSettings({ entityType, entityId }: OrderSettingsProps) {
  const { t } = useTranslation()
  const {
    isLoading, userError, contractorError,
    offerMessage, setOfferMessage, offerEnabled, setOfferEnabled,
    orderMessage, setOrderMessage, orderEnabled, setOrderEnabled,
    requireAvailabilityEnabled, setRequireAvailabilityEnabled,
    stockSubtractionTiming, setStockSubtractionTiming,
    allocationMode, setAllocationMode,
    minOrderSize, setMinOrderSize, minOrderSizeEnabled, setMinOrderSizeEnabled,
    maxOrderSize, setMaxOrderSize, maxOrderSizeEnabled, setMaxOrderSizeEnabled,
    minOrderValue, setMinOrderValue, minOrderValueEnabled, setMinOrderValueEnabled,
    maxOrderValue, setMaxOrderValue, maxOrderValueEnabled, setMaxOrderValueEnabled,
    saving, error, success,
    handleSave, handleDelete,
    offerSettingId, orderSettingId,
    minOrderSizeSettingId, maxOrderSizeSettingId, minOrderValueSettingId, maxOrderValueSettingId,
  } = useOrderSettings(entityType, entityId)
  if (isLoading) {
    return (
      <FlatSection title={t("OrderSettings.title")}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Grid>
      </FlatSection>
    )
  }

  if (userError || contractorError) {
    return (
      <FlatSection title={t("OrderSettings.title")}>
        <Grid item xs={12}>
          <Alert severity="error">{t("OrderSettings.loadError")}</Alert>
        </Grid>
      </FlatSection>
    )
  }

  return (
    <>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Grid>
      )}

      {success && (
        <Grid item xs={12}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* Order Messages Section */}
      <FlatSection title={t("OrderSettings.messagesTitle", "Order Messages")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "OrderSettings.messagesDescription",
              "Configure automated messages sent with offers and orders.",
            )}
          </Typography>
        </Grid>

        {/* Offer Message Setting */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.offerMessage")}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={offerEnabled}
                  onChange={(e) => setOfferEnabled(e.target.checked)}
                  disabled={saving}
                />
              }
              label={t("OrderSettings.enabled")}
              sx={{ mb: 1 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              placeholder={t("OrderSettings.offerMessagePlaceholder")}
              disabled={saving || !offerEnabled}
              sx={{ mb: 1 }}
            />

            {offerSettingId && (
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete("offer_message")}
                disabled={saving}
              >
                {t("OrderSettings.delete")}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Order Message Setting */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.orderMessage")}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={orderEnabled}
                  onChange={(e) => setOrderEnabled(e.target.checked)}
                  disabled={saving}
                />
              }
              label={t("OrderSettings.enabled")}
              sx={{ mb: 1 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              value={orderMessage}
              onChange={(e) => setOrderMessage(e.target.value)}
              placeholder={t("OrderSettings.orderMessagePlaceholder")}
              disabled={saving || !orderEnabled}
              sx={{ mb: 1 }}
            />

            {orderSettingId && (
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete("order_message")}
                disabled={saving}
              >
                {t("OrderSettings.delete")}
              </Button>
            )}
          </Box>
        </Grid>
      </FlatSection>

      {/* Order Requirements Section */}
      <FlatSection
        title={t("OrderSettings.requirementsTitle", "Order Requirements")}
      >
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "OrderSettings.requirementsDescription",
              "Configure requirements that must be met before orders can be placed.",
            )}
          </Typography>
        </Grid>

        {/* Availability Requirement Setting */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.availabilityRequirement")}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={requireAvailabilityEnabled}
                  onChange={(e) =>
                    setRequireAvailabilityEnabled(e.target.checked)
                  }
                  disabled={saving}
                />
              }
              label={t("OrderSettings.requireAvailabilityLabel")}
              sx={{ mb: 1 }}
            />

            <Typography variant="body2" color="text.secondary">
              {t("OrderSettings.requireAvailabilityDescription")}
            </Typography>
          </Box>
        </Grid>
      </FlatSection>

      {/* Stock Management Section */}
      <FlatSection title={t("OrderSettings.stockTitle", "Stock Management")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "OrderSettings.stockDescription",
              "Configure when stock is subtracted from your inventory.",
            )}
          </Typography>
        </Grid>

        {/* Stock Subtraction Timing Setting */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.stockSubtractionTiming")}
            </Typography>

            <FormControl component="fieldset" disabled={saving} sx={{ mb: 1 }}>
              <FormLabel component="legend">
                {t("OrderSettings.stockSubtractionTimingLabel")}
              </FormLabel>
              <RadioGroup
                value={stockSubtractionTiming}
                onChange={(e) =>
                  setStockSubtractionTiming(
                    e.target.value as
                      | "on_accepted"
                      | "on_received"
                      | "dont_subtract",
                  )
                }
              >
                <FormControlLabel
                  value="on_accepted"
                  control={<Radio />}
                  label={t("OrderSettings.stockSubtractionOnAccepted")}
                />
                <FormControlLabel
                  value="on_received"
                  control={<Radio />}
                  label={t("OrderSettings.stockSubtractionOnReceived")}
                />
                <FormControlLabel
                  value="dont_subtract"
                  control={<Radio />}
                  label={t("OrderSettings.stockSubtractionDontSubtract")}
                />
              </RadioGroup>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {t("OrderSettings.stockSubtractionTimingDescription")}
            </Typography>
          </Box>
        </Grid>

        {/* Allocation Mode Setting */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.allocationMode", "Stock Allocation Mode")}
            </Typography>

            <FormControl component="fieldset" disabled={saving} sx={{ mb: 1 }}>
              <FormLabel component="legend">
                {t(
                  "OrderSettings.allocationModeLabel",
                  "How should stock be allocated to orders?",
                )}
              </FormLabel>
              <RadioGroup
                value={allocationMode}
                onChange={(e) =>
                  setAllocationMode(
                    e.target.value as "auto" | "manual" | "none",
                  )
                }
              >
                <FormControlLabel
                  value="auto"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">
                        {t(
                          "OrderSettings.allocationModeAuto",
                          "Automatic (Recommended)",
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "OrderSettings.allocationModeAutoDescription",
                          "Stock is automatically allocated when orders are created using FIFO (oldest stock first)",
                        )}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">
                        {t("OrderSettings.allocationModeManual", "Manual")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "OrderSettings.allocationModeManualDescription",
                          "You manually select which stock lots to allocate to each order",
                        )}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="none"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">
                        {t("OrderSettings.allocationModeNone", "None (Legacy)")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t(
                          "OrderSettings.allocationModeNoneDescription",
                          "No physical allocation - stock is tracked at listing level only",
                        )}
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t(
                  "OrderSettings.allocationModeNote",
                  "Note: This setting controls how stock is physically allocated to orders. It is independent of the stock subtraction timing setting above, which controls when stock becomes visible to buyers.",
                )}
              </Typography>
            </Alert>
          </Box>
        </Grid>
      </FlatSection>

      {/* Order Limits Section */}
      <FlatSection title={t("OrderSettings.limitsTitle", "Order Limits")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t(
              "OrderSettings.limitsDescription",
              "Set minimum and maximum limits for order sizes and values. Only applies when you are the seller.",
            )}
          </Typography>
        </Grid>

        {/* Order Size Limits */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.orderSizeLimits", "Order Size Limits")}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                "OrderSettings.orderSizeLimitsDescription",
                "Set minimum and maximum order sizes (total quantity of items).",
              )}
            </Typography>

            {/* Minimum Order Size */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={minOrderSizeEnabled}
                    onChange={(e) => setMinOrderSizeEnabled(e.target.checked)}
                    disabled={saving}
                  />
                }
                label={t("OrderSettings.minOrderSize", "Minimum Order Size")}
                sx={{ mb: 1 }}
              />

              <TextField
                fullWidth
                type="number"
                value={minOrderSize}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setMinOrderSize(val)
                  }
                }}
                placeholder={t(
                  "OrderSettings.minOrderSizePlaceholder",
                  "e.g., 10",
                )}
                disabled={saving || !minOrderSizeEnabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">items</InputAdornment>
                  ),
                }}
                helperText={t(
                  "OrderSettings.minOrderSizeHelper",
                  "Minimum total quantity of items required",
                )}
                sx={{ mb: 1 }}
              />
              {minOrderSizeSettingId && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete("min_order_size")}
                  disabled={saving}
                  sx={{ mt: 1 }}
                >
                  {t("OrderSettings.delete")}
                </Button>
              )}
            </Box>

            {/* Maximum Order Size */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={maxOrderSizeEnabled}
                    onChange={(e) => setMaxOrderSizeEnabled(e.target.checked)}
                    disabled={saving}
                  />
                }
                label={t("OrderSettings.maxOrderSize", "Maximum Order Size")}
                sx={{ mb: 1 }}
              />

              <TextField
                fullWidth
                type="number"
                value={maxOrderSize}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setMaxOrderSize(val)
                  }
                }}
                placeholder={t(
                  "OrderSettings.maxOrderSizePlaceholder",
                  "e.g., 100",
                )}
                disabled={saving || !maxOrderSizeEnabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">items</InputAdornment>
                  ),
                }}
                helperText={t(
                  "OrderSettings.maxOrderSizeHelper",
                  "Maximum total quantity of items allowed",
                )}
                error={
                  !!(
                    maxOrderSizeEnabled &&
                    minOrderSizeEnabled &&
                    maxOrderSize &&
                    minOrderSize &&
                    parseInt(maxOrderSize, 10) < parseInt(minOrderSize, 10)
                  )
                }
                sx={{ mb: 1 }}
              />
              {maxOrderSizeEnabled &&
                minOrderSizeEnabled &&
                maxOrderSize &&
                minOrderSize &&
                parseInt(maxOrderSize, 10) < parseInt(minOrderSize, 10) && (
                  <Typography variant="caption" color="error">
                    {t(
                      "OrderSettings.maxLessThanMin",
                      "Maximum must be greater than or equal to minimum",
                    )}
                  </Typography>
                )}
            </Box>
          </Box>
        </Grid>

        {/* Order Value Limits */}
        <Grid item xs={12}>
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              {t("OrderSettings.orderValueLimits", "Order Value Limits")}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                "OrderSettings.orderValueLimitsDescription",
                "Set minimum and maximum order values (in aUEC).",
              )}
            </Typography>

            {/* Minimum Order Value */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={minOrderValueEnabled}
                    onChange={(e) => setMinOrderValueEnabled(e.target.checked)}
                    disabled={saving}
                  />
                }
                label={t("OrderSettings.minOrderValue", "Minimum Order Value")}
                sx={{ mb: 1 }}
              />

              <TextField
                fullWidth
                type="number"
                value={minOrderValue}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setMinOrderValue(val)
                  }
                }}
                placeholder={t(
                  "OrderSettings.minOrderValuePlaceholder",
                  "e.g., 50000",
                )}
                disabled={saving || !minOrderValueEnabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">aUEC</InputAdornment>
                  ),
                }}
                helperText={t(
                  "OrderSettings.minOrderValueHelper",
                  "Minimum order value required",
                )}
                sx={{ mb: 1 }}
              />
              {minOrderValueSettingId && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete("min_order_value")}
                  disabled={saving}
                  sx={{ mt: 1 }}
                >
                  {t("OrderSettings.delete")}
                </Button>
              )}
            </Box>

            {/* Maximum Order Value */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={maxOrderValueEnabled}
                    onChange={(e) => setMaxOrderValueEnabled(e.target.checked)}
                    disabled={saving}
                  />
                }
                label={t("OrderSettings.maxOrderValue", "Maximum Order Value")}
                sx={{ mb: 1 }}
              />

              <TextField
                fullWidth
                type="number"
                value={maxOrderValue}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setMaxOrderValue(val)
                  }
                }}
                placeholder={t(
                  "OrderSettings.maxOrderValuePlaceholder",
                  "e.g., 500000",
                )}
                disabled={saving || !maxOrderValueEnabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">aUEC</InputAdornment>
                  ),
                }}
                helperText={t(
                  "OrderSettings.maxOrderValueHelper",
                  "Maximum order value allowed",
                )}
                error={
                  !!(
                    maxOrderValueEnabled &&
                    minOrderValueEnabled &&
                    maxOrderValue &&
                    minOrderValue &&
                    parseInt(maxOrderValue, 10) < parseInt(minOrderValue, 10)
                  )
                }
                sx={{ mb: 1 }}
              />
              {maxOrderValueEnabled &&
                minOrderValueEnabled &&
                maxOrderValue &&
                minOrderValue &&
                parseInt(maxOrderValue, 10) < parseInt(minOrderValue, 10) && (
                  <Typography variant="caption" color="error">
                    {t(
                      "OrderSettings.maxLessThanMin",
                      "Maximum must be greater than or equal to minimum",
                    )}
                  </Typography>
                )}
              {maxOrderValueSettingId && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete("max_order_value")}
                  disabled={saving}
                  sx={{ mt: 1 }}
                >
                  {t("OrderSettings.delete")}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? t("OrderSettings.saving") : t("OrderSettings.save")}
          </Button>
        </Grid>
      </FlatSection>
    </>
  )
}
