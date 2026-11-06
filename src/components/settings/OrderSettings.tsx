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
} from "@mui/material"
import { FlatSection } from "../paper/Section"
import { useTranslation } from "react-i18next"
import { useOrderSettings } from "../../features/orders/hooks/useOrderSettings"
import DeleteRounded from "@mui/icons-material/DeleteRounded"
import { OrderLimitsSection } from "./OrderLimitsSection"
import { OrderStockNotices } from "./OrderStockNotices"

interface OrderSettingsProps {
  entityType: "user" | "contractor"
  entityId?: string
}

export function OrderSettings({ entityType, entityId }: OrderSettingsProps) {
  const { t } = useTranslation()
  const settings = useOrderSettings(entityType, entityId)
  const {
    isLoading,
    userError,
    contractorError,
    offerMessage,
    setOfferMessage,
    offerEnabled,
    setOfferEnabled,
    orderMessage,
    setOrderMessage,
    orderEnabled,
    setOrderEnabled,
    requireAvailabilityEnabled,
    setRequireAvailabilityEnabled,
    saving,
    error,
    success,
    handleDelete,
    offerSettingId,
    orderSettingId,
  } = settings
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
                startIcon={<DeleteRounded />}
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
                startIcon={<DeleteRounded />}
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
      <OrderStockNotices />

      {/* Order Limits Section */}
      <OrderLimitsSection settings={settings} />
    </>
  )
}
