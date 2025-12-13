import React, { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  OrderSetting,
  CreateOrderSettingRequest,
  UpdateOrderSettingRequest,
  useGetUserOrderSettingsQuery,
  useCreateUserOrderSettingMutation,
  useUpdateUserOrderSettingMutation,
  useDeleteUserOrderSettingMutation,
  useGetContractorOrderSettingsQuery,
  useCreateContractorOrderSettingMutation,
  useUpdateContractorOrderSettingMutation,
  useDeleteContractorOrderSettingMutation,
} from "../../store/orderSettings"

interface OrderSettingsProps {
  entityType: "user" | "contractor"
  entityId?: string // Required for contractor, optional for user
}

export function OrderSettings({ entityType, entityId }: OrderSettingsProps) {
  const { t } = useTranslation()
  const [offerMessage, setOfferMessage] = useState("")
  const [orderMessage, setOrderMessage] = useState("")
  const [offerEnabled, setOfferEnabled] = useState(true)
  const [orderEnabled, setOrderEnabled] = useState(true)
  const [requireAvailabilityEnabled, setRequireAvailabilityEnabled] =
    useState(false)
  const [offerSettingId, setOfferSettingId] = useState<string | null>(null)
  const [orderSettingId, setOrderSettingId] = useState<string | null>(null)
  const [requireAvailabilitySettingId, setRequireAvailabilitySettingId] =
    useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // User settings queries
  const {
    data: userSettings = [],
    isLoading: userLoading,
    error: userError,
  } = useGetUserOrderSettingsQuery(undefined, {
    skip: entityType !== "user",
  })

  // Contractor settings queries
  const {
    data: contractorSettings = [],
    isLoading: contractorLoading,
    error: contractorError,
  } = useGetContractorOrderSettingsQuery(entityId!, {
    skip: entityType !== "contractor" || !entityId,
  })

  // User mutations
  const [createUserSetting] = useCreateUserOrderSettingMutation()
  const [updateUserSetting] = useUpdateUserOrderSettingMutation()
  const [deleteUserSetting] = useDeleteUserOrderSettingMutation()

  // Contractor mutations
  const [createContractorSetting] = useCreateContractorOrderSettingMutation()
  const [updateContractorSetting] = useUpdateContractorOrderSettingMutation()
  const [deleteContractorSetting] = useDeleteContractorOrderSettingMutation()

  const isLoading = userLoading || contractorLoading
  const settings = entityType === "user" ? userSettings : contractorSettings

  // Initialize form with existing settings
  useEffect(() => {
    if (settings.length > 0) {
      const offerSetting = settings.find(
        (s) => s.setting_type === "offer_message",
      )
      const orderSetting = settings.find(
        (s) => s.setting_type === "order_message",
      )

      if (offerSetting) {
        setOfferMessage(offerSetting.message_content)
        setOfferEnabled(offerSetting.enabled)
        setOfferSettingId(offerSetting.id)
      }

      if (orderSetting) {
        setOrderMessage(orderSetting.message_content)
        setOrderEnabled(orderSetting.enabled)
        setOrderSettingId(orderSetting.id)
      }

      const requireAvailabilitySetting = settings.find(
        (s) => s.setting_type === "require_availability",
      )

      if (requireAvailabilitySetting) {
        setRequireAvailabilityEnabled(requireAvailabilitySetting.enabled)
        setRequireAvailabilitySettingId(requireAvailabilitySetting.id)
      }
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Handle offer message
      if (offerSettingId) {
        // Update existing
        if (entityType === "user") {
          await updateUserSetting({
            id: offerSettingId,
            message_content: offerMessage,
            enabled: offerEnabled,
          }).unwrap()
        } else {
          await updateContractorSetting({
            contractorId: entityId!,
            id: offerSettingId,
            message_content: offerMessage,
            enabled: offerEnabled,
          }).unwrap()
        }
      } else if (offerMessage.trim()) {
        // Create new
        const request: CreateOrderSettingRequest = {
          setting_type: "offer_message",
          message_content: offerMessage,
          enabled: offerEnabled,
        }

        if (entityType === "user") {
          await createUserSetting(request).unwrap()
        } else {
          await createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap()
        }
      }

      // Handle order message
      if (orderSettingId) {
        // Update existing
        if (entityType === "user") {
          await updateUserSetting({
            id: orderSettingId,
            message_content: orderMessage,
            enabled: orderEnabled,
          }).unwrap()
        } else {
          await updateContractorSetting({
            contractorId: entityId!,
            id: orderSettingId,
            message_content: orderMessage,
            enabled: orderEnabled,
          }).unwrap()
        }
      } else if (orderMessage.trim()) {
        // Create new
        const request: CreateOrderSettingRequest = {
          setting_type: "order_message",
          message_content: orderMessage,
          enabled: orderEnabled,
        }

        if (entityType === "user") {
          await createUserSetting(request).unwrap()
        } else {
          await createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap()
        }
      }

      // Handle availability requirement
      if (requireAvailabilitySettingId) {
        // Update existing
        if (entityType === "user") {
          await updateUserSetting({
            id: requireAvailabilitySettingId,
            message_content: "", // Not used for require_availability
            enabled: requireAvailabilityEnabled,
          }).unwrap()
        } else {
          await updateContractorSetting({
            contractorId: entityId!,
            id: requireAvailabilitySettingId,
            message_content: "", // Not used for require_availability
            enabled: requireAvailabilityEnabled,
          }).unwrap()
        }
      } else if (requireAvailabilityEnabled) {
        // Create new
        const request: CreateOrderSettingRequest = {
          setting_type: "require_availability",
          message_content: "", // Not used for require_availability
          enabled: requireAvailabilityEnabled,
        }

        if (entityType === "user") {
          await createUserSetting(request).unwrap()
        } else {
          await createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap()
        }
      } else if (requireAvailabilitySettingId && !requireAvailabilityEnabled) {
        // Setting exists but is disabled - delete it
        if (entityType === "user") {
          await deleteUserSetting(requireAvailabilitySettingId).unwrap()
        } else {
          await deleteContractorSetting({
            contractorId: entityId!,
            id: requireAvailabilitySettingId,
          }).unwrap()
        }
        setRequireAvailabilitySettingId(null)
      }

      setSuccess(t("OrderSettings.savedSuccessfully"))
    } catch (err: any) {
      const errorMessage =
        err?.data?.error?.error ||
        err?.data?.error ||
        err?.message ||
        t("OrderSettings.saveError")
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : t("OrderSettings.saveError"),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    settingType: "offer_message" | "order_message" | "require_availability",
  ) => {
    if (!confirm(t("OrderSettings.confirmDelete"))) return

    setSaving(true)
    setError(null)

    try {
      const settingId =
        settingType === "offer_message"
          ? offerSettingId
          : settingType === "order_message"
            ? orderSettingId
            : requireAvailabilitySettingId

      if (settingId) {
        if (entityType === "user") {
          await deleteUserSetting(settingId).unwrap()
        } else {
          await deleteContractorSetting({
            contractorId: entityId!,
            id: settingId,
          }).unwrap()
        }

        // Reset form
        if (settingType === "offer_message") {
          setOfferMessage("")
          setOfferEnabled(true)
          setOfferSettingId(null)
        } else if (settingType === "order_message") {
          setOrderMessage("")
          setOrderEnabled(true)
          setOrderSettingId(null)
        } else {
          setRequireAvailabilityEnabled(false)
          setRequireAvailabilitySettingId(null)
        }

        setSuccess(t("OrderSettings.deletedSuccessfully"))
      }
    } catch (err: any) {
      const errorMessage =
        err?.data?.error?.error ||
        err?.data?.error ||
        err?.message ||
        t("OrderSettings.deleteError")
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : t("OrderSettings.deleteError"),
      )
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (userError || contractorError) {
    return <Alert severity="error">{t("OrderSettings.loadError")}</Alert>
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("OrderSettings.title")}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {t("OrderSettings.description")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Offer Message Setting */}
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

        <Divider sx={{ my: 2 }} />

        {/* Order Message Setting */}
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

        <Divider sx={{ my: 2 }} />

        {/* Availability Requirement Setting */}
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

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? t("OrderSettings.saving") : t("OrderSettings.save")}
        </Button>
      </CardContent>
    </Card>
  )
}
