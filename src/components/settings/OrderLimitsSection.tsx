import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import { FlatSection } from "../paper/Section"
import type { useOrderSettings } from "../../features/orders/hooks/useOrderSettings"

/** Order Settings › Order Limits: min/max order size and value, and Save. */
export function OrderLimitsSection({
  settings,
}: {
  settings: ReturnType<typeof useOrderSettings>
}) {
  const { t } = useTranslation()
  const {
    saving,
    handleDelete,
    handleSave,
    minOrderSize,
    setMinOrderSize,
    minOrderSizeEnabled,
    setMinOrderSizeEnabled,
    maxOrderSize,
    setMaxOrderSize,
    maxOrderSizeEnabled,
    setMaxOrderSizeEnabled,
    minOrderValue,
    setMinOrderValue,
    minOrderValueEnabled,
    setMinOrderValueEnabled,
    maxOrderValue,
    setMaxOrderValue,
    maxOrderValueEnabled,
    setMaxOrderValueEnabled,
    minOrderSizeSettingId,
    minOrderValueSettingId,
    maxOrderValueSettingId,
  } = settings
  return (
    <>
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
                    <InputAdornment position="end">
                      {t("settingsUi.itemsUnit")}
                    </InputAdornment>
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
                  startIcon={<DeleteRounded />}
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
                    <InputAdornment position="end">
                      {t("settingsUi.itemsUnit")}
                    </InputAdornment>
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
                  startIcon={<DeleteRounded />}
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
                  startIcon={<DeleteRounded />}
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
