import React, { useState, useEffect } from "react"
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
import { useAlertHook } from "../../hooks/alert/AlertHook"
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
  const issueAlert = useAlertHook()
  const [offerMessage, setOfferMessage] = useState("")
  const [orderMessage, setOrderMessage] = useState("")
  const [offerEnabled, setOfferEnabled] = useState(true)
  const [orderEnabled, setOrderEnabled] = useState(true)
  const [requireAvailabilityEnabled, setRequireAvailabilityEnabled] =
    useState(false)
  const [stockSubtractionTiming, setStockSubtractionTiming] = useState<
    "on_accepted" | "on_received" | "dont_subtract"
  >("on_accepted")
  const [allocationMode, setAllocationMode] = useState<
    "auto" | "manual" | "none"
  >("auto")
  const [offerSettingId, setOfferSettingId] = useState<string | null>(null)
  const [orderSettingId, setOrderSettingId] = useState<string | null>(null)
  const [requireAvailabilitySettingId, setRequireAvailabilitySettingId] =
    useState<string | null>(null)
  const [stockSubtractionTimingSettingId, setStockSubtractionTimingSettingId] =
    useState<string | null>(null)
  const [allocationModeSettingId, setAllocationModeSettingId] = useState<
    string | null
  >(null)
  const [minOrderSize, setMinOrderSize] = useState<string>("")
  const [maxOrderSize, setMaxOrderSize] = useState<string>("")
  const [minOrderValue, setMinOrderValue] = useState<string>("")
  const [maxOrderValue, setMaxOrderValue] = useState<string>("")
  const [minOrderSizeEnabled, setMinOrderSizeEnabled] = useState(false)
  const [maxOrderSizeEnabled, setMaxOrderSizeEnabled] = useState(false)
  const [minOrderValueEnabled, setMinOrderValueEnabled] = useState(false)
  const [maxOrderValueEnabled, setMaxOrderValueEnabled] = useState(false)
  const [minOrderSizeSettingId, setMinOrderSizeSettingId] = useState<
    string | null
  >(null)
  const [maxOrderSizeSettingId, setMaxOrderSizeSettingId] = useState<
    string | null
  >(null)
  const [minOrderValueSettingId, setMinOrderValueSettingId] = useState<
    string | null
  >(null)
  const [maxOrderValueSettingId, setMaxOrderValueSettingId] = useState<
    string | null
  >(null)
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

      const stockSubtractionTimingSetting = settings.find(
        (s) => s.setting_type === "stock_subtraction_timing",
      )

      if (stockSubtractionTimingSetting) {
        // If setting exists, use its value (on_received or dont_subtract)
        setStockSubtractionTiming(
          (stockSubtractionTimingSetting.message_content as
            | "on_received"
            | "dont_subtract") || "on_received",
        )
        setStockSubtractionTimingSettingId(stockSubtractionTimingSetting.id)
      } else {
        // No setting = default to "on_accepted"
        setStockSubtractionTiming("on_accepted")
        setStockSubtractionTimingSettingId(null)
      }

      const allocationModeSetting = settings.find(
        (s) => s.setting_type === "allocation_mode",
      )

      if (allocationModeSetting) {
        // If setting exists, use its value
        setAllocationMode(
          (allocationModeSetting.message_content as
            | "auto"
            | "manual"
            | "none") || "auto",
        )
        setAllocationModeSettingId(allocationModeSetting.id)
      } else {
        // No setting = default to "auto"
        setAllocationMode("auto")
        setAllocationModeSettingId(null)
      }

      // Initialize order limits
      const minSizeSetting = settings.find(
        (s) => s.setting_type === "min_order_size",
      )
      if (minSizeSetting) {
        setMinOrderSize(minSizeSetting.message_content)
        setMinOrderSizeEnabled(minSizeSetting.enabled)
        setMinOrderSizeSettingId(minSizeSetting.id)
      }

      const maxSizeSetting = settings.find(
        (s) => s.setting_type === "max_order_size",
      )
      if (maxSizeSetting) {
        setMaxOrderSize(maxSizeSetting.message_content)
        setMaxOrderSizeEnabled(maxSizeSetting.enabled)
        setMaxOrderSizeSettingId(maxSizeSetting.id)
      }

      const minValueSetting = settings.find(
        (s) => s.setting_type === "min_order_value",
      )
      if (minValueSetting) {
        setMinOrderValue(minValueSetting.message_content)
        setMinOrderValueEnabled(minValueSetting.enabled)
        setMinOrderValueSettingId(minValueSetting.id)
      }

      const maxValueSetting = settings.find(
        (s) => s.setting_type === "max_order_value",
      )
      if (maxValueSetting) {
        setMaxOrderValue(maxValueSetting.message_content)
        setMaxOrderValueEnabled(maxValueSetting.enabled)
        setMaxOrderValueSettingId(maxValueSetting.id)
      }
    }
  }, [settings])

  const handleLimitSetting = (
    settingType:
      | "min_order_size"
      | "max_order_size"
      | "min_order_value"
      | "max_order_value",
    value: string,
    enabled: boolean,
    settingId: string | null,
    setSettingId: (id: string | null) => void,
  ): Promise<void> => {
    if (settingId) {
      // Update existing
      if (enabled && value.trim()) {
        if (entityType === "user") {
          return updateUserSetting({
            id: settingId,
            message_content: value.trim(),
            enabled: true,
          })
            .unwrap()
            .then(() => {})
        } else {
          return updateContractorSetting({
            contractorId: entityId!,
            id: settingId,
            message_content: value.trim(),
            enabled: true,
          })
            .unwrap()
            .then(() => {})
        }
      } else {
        // Disabled or empty - delete
        if (entityType === "user") {
          return deleteUserSetting(settingId)
            .unwrap()
            .then(() => {
              setSettingId(null)
            })
        } else {
          return deleteContractorSetting({
            contractorId: entityId!,
            id: settingId,
          })
            .unwrap()
            .then(() => {
              setSettingId(null)
            })
        }
      }
    } else if (enabled && value.trim()) {
      // Create new
      const request: CreateOrderSettingRequest = {
        setting_type: settingType,
        message_content: value.trim(),
        enabled: true,
      }

      if (entityType === "user") {
        return createUserSetting(request)
          .unwrap()
          .then((result) => {
            setSettingId(result.setting.id)
          })
      } else {
        return createContractorSetting({
          contractorId: entityId!,
          ...request,
        })
          .unwrap()
          .then((result) => {
            setSettingId(result.setting.id)
          })
      }
    }
    return Promise.resolve()
  }

  const handleSave = () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    // Build promise chain for all operations
    let promise: Promise<unknown> = Promise.resolve()

    // Handle offer message
    if (offerSettingId) {
      // Update existing
      if (entityType === "user") {
        promise = promise.then(() =>
          updateUserSetting({
            id: offerSettingId,
            message_content: offerMessage,
            enabled: offerEnabled,
          }).unwrap(),
        )
      } else {
        promise = promise.then(() =>
          updateContractorSetting({
            contractorId: entityId!,
            id: offerSettingId,
            message_content: offerMessage,
            enabled: offerEnabled,
          }).unwrap(),
        )
      }
    } else if (offerMessage.trim()) {
      // Create new
      const request: CreateOrderSettingRequest = {
        setting_type: "offer_message",
        message_content: offerMessage,
        enabled: offerEnabled,
      }

      if (entityType === "user") {
        promise = promise.then(() => createUserSetting(request).unwrap())
      } else {
        promise = promise.then(() =>
          createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap(),
        )
      }
    }

    // Handle order message
    if (orderSettingId) {
      // Update existing
      if (entityType === "user") {
        promise = promise.then(() =>
          updateUserSetting({
            id: orderSettingId,
            message_content: orderMessage,
            enabled: orderEnabled,
          }).unwrap(),
        )
      } else {
        promise = promise.then(() =>
          updateContractorSetting({
            contractorId: entityId!,
            id: orderSettingId,
            message_content: orderMessage,
            enabled: orderEnabled,
          }).unwrap(),
        )
      }
    } else if (orderMessage.trim()) {
      // Create new
      const request: CreateOrderSettingRequest = {
        setting_type: "order_message",
        message_content: orderMessage,
        enabled: orderEnabled,
      }

      if (entityType === "user") {
        promise = promise.then(() => createUserSetting(request).unwrap())
      } else {
        promise = promise.then(() =>
          createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap(),
        )
      }
    }

    // Handle availability requirement
    if (requireAvailabilitySettingId) {
      // Update existing
      if (entityType === "user") {
        promise = promise.then(() =>
          updateUserSetting({
            id: requireAvailabilitySettingId,
            message_content: "", // Not used for require_availability
            enabled: requireAvailabilityEnabled,
          }).unwrap(),
        )
      } else {
        promise = promise.then(() =>
          updateContractorSetting({
            contractorId: entityId!,
            id: requireAvailabilitySettingId,
            message_content: "", // Not used for require_availability
            enabled: requireAvailabilityEnabled,
          }).unwrap(),
        )
      }
    } else if (requireAvailabilityEnabled) {
      // Create new
      const request: CreateOrderSettingRequest = {
        setting_type: "require_availability",
        message_content: "", // Not used for require_availability
        enabled: requireAvailabilityEnabled,
      }

      if (entityType === "user") {
        promise = promise.then(() => createUserSetting(request).unwrap())
      } else {
        promise = promise.then(() =>
          createContractorSetting({
            contractorId: entityId!,
            ...request,
          }).unwrap(),
        )
      }
    } else if (requireAvailabilitySettingId && !requireAvailabilityEnabled) {
      // Setting exists but is disabled - delete it
      if (entityType === "user") {
        promise = promise
          .then(() => deleteUserSetting(requireAvailabilitySettingId).unwrap())
          .then(() => {
            setRequireAvailabilitySettingId(null)
          })
      } else {
        promise = promise
          .then(() =>
            deleteContractorSetting({
              contractorId: entityId!,
              id: requireAvailabilitySettingId,
            }).unwrap(),
          )
          .then(() => {
            setRequireAvailabilitySettingId(null)
          })
      }
    }

    // Handle stock subtraction timing
    if (stockSubtractionTiming === "on_accepted") {
      // "on_accepted" is the default - delete setting if it exists
      if (stockSubtractionTimingSettingId) {
        if (entityType === "user") {
          promise = promise
            .then(() =>
              deleteUserSetting(stockSubtractionTimingSettingId).unwrap(),
            )
            .then(() => {
              setStockSubtractionTimingSettingId(null)
            })
        } else {
          promise = promise
            .then(() =>
              deleteContractorSetting({
                contractorId: entityId!,
                id: stockSubtractionTimingSettingId,
              }).unwrap(),
            )
            .then(() => {
              setStockSubtractionTimingSettingId(null)
            })
        }
      }
      // If no setting exists, nothing to do (already at default)
    } else {
      // "on_received" or "dont_subtract" - create or update setting
      const request: CreateOrderSettingRequest = {
        setting_type: "stock_subtraction_timing",
        message_content: stockSubtractionTiming,
        enabled: true,
      }

      if (stockSubtractionTimingSettingId) {
        // Update existing
        if (entityType === "user") {
          promise = promise.then(() =>
            updateUserSetting({
              id: stockSubtractionTimingSettingId,
              message_content: stockSubtractionTiming,
              enabled: true,
            }).unwrap(),
          )
        } else {
          promise = promise.then(() =>
            updateContractorSetting({
              contractorId: entityId!,
              id: stockSubtractionTimingSettingId,
              message_content: stockSubtractionTiming,
              enabled: true,
            }).unwrap(),
          )
        }
      } else {
        // Create new
        if (entityType === "user") {
          promise = promise
            .then(() => createUserSetting(request).unwrap())
            .then((result) => {
              setStockSubtractionTimingSettingId(result.setting.id)
            })
        } else {
          promise = promise
            .then(() =>
              createContractorSetting({
                contractorId: entityId!,
                ...request,
              }).unwrap(),
            )
            .then((result) => {
              setStockSubtractionTimingSettingId(result.setting.id)
            })
        }
      }

      // Handle order size limits
      promise = promise.then(() =>
        handleLimitSetting(
          "min_order_size",
          minOrderSize,
          minOrderSizeEnabled,
          minOrderSizeSettingId,
          setMinOrderSizeSettingId,
        ),
      )
      promise = promise.then(() =>
        handleLimitSetting(
          "max_order_size",
          maxOrderSize,
          maxOrderSizeEnabled,
          maxOrderSizeSettingId,
          setMaxOrderSizeSettingId,
        ),
      )
      promise = promise.then(() =>
        handleLimitSetting(
          "min_order_value",
          minOrderValue,
          minOrderValueEnabled,
          minOrderValueSettingId,
          setMinOrderValueSettingId,
        ),
      )
      promise = promise.then(() =>
        handleLimitSetting(
          "max_order_value",
          maxOrderValue,
          maxOrderValueEnabled,
          maxOrderValueSettingId,
          setMaxOrderValueSettingId,
        ),
      )
    }

    // Handle allocation mode
    if (allocationMode === "auto") {
      // "auto" is the default - delete setting if it exists
      if (allocationModeSettingId) {
        if (entityType === "user") {
          promise = promise
            .then(() => deleteUserSetting(allocationModeSettingId).unwrap())
            .then(() => {
              setAllocationModeSettingId(null)
            })
        } else {
          promise = promise
            .then(() =>
              deleteContractorSetting({
                contractorId: entityId!,
                id: allocationModeSettingId,
              }).unwrap(),
            )
            .then(() => {
              setAllocationModeSettingId(null)
            })
        }
      }
      // If no setting exists, nothing to do (already at default)
    } else {
      // "manual" or "none" - create or update setting
      const request: CreateOrderSettingRequest = {
        setting_type: "allocation_mode",
        message_content: allocationMode,
        enabled: true,
      }

      if (allocationModeSettingId) {
        // Update existing
        if (entityType === "user") {
          promise = promise.then(() =>
            updateUserSetting({
              id: allocationModeSettingId,
              message_content: allocationMode,
              enabled: true,
            }).unwrap(),
          )
        } else {
          promise = promise.then(() =>
            updateContractorSetting({
              contractorId: entityId!,
              id: allocationModeSettingId,
              message_content: allocationMode,
              enabled: true,
            }).unwrap(),
          )
        }
      } else {
        // Create new
        if (entityType === "user") {
          promise = promise
            .then(() => createUserSetting(request).unwrap())
            .then((result) => {
              setAllocationModeSettingId(result.setting.id)
            })
        } else {
          promise = promise
            .then(() =>
              createContractorSetting({
                contractorId: entityId!,
                ...request,
              }).unwrap(),
            )
            .then((result) => {
              setAllocationModeSettingId(result.setting.id)
            })
        }
      }
    }

    promise
      .then(() => {
        issueAlert({
          message: t("OrderSettings.savedSuccessfully"),
          severity: "success",
        })
        setSuccess(t("OrderSettings.savedSuccessfully"))
        setSaving(false)
      })
      .catch((err) => {
        issueAlert(err)
        // Extract error message for local state (issueAlert already handles the toast)
        const errorMessage =
          (err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "error" in err.data
            ? typeof err.data.error === "object" &&
              err.data.error &&
              "error" in err.data.error &&
              typeof err.data.error.error === "string"
              ? err.data.error.error
              : typeof err.data.error === "string"
                ? err.data.error
                : undefined
            : undefined) ||
          (err &&
          typeof err === "object" &&
          "message" in err &&
          typeof err.message === "string"
            ? err.message
            : undefined) ||
          t("OrderSettings.saveError")
        setError(errorMessage)
        setSaving(false)
      })
  }

  const handleDelete = (
    settingType:
      | "offer_message"
      | "order_message"
      | "require_availability"
      | "stock_subtraction_timing"
      | "allocation_mode"
      | "min_order_size"
      | "max_order_size"
      | "min_order_value"
      | "max_order_value",
  ) => {
    if (!confirm(t("OrderSettings.confirmDelete"))) return

    setSaving(true)
    setError(null)

    const settingId =
      settingType === "offer_message"
        ? offerSettingId
        : settingType === "order_message"
          ? orderSettingId
          : settingType === "require_availability"
            ? requireAvailabilitySettingId
            : settingType === "stock_subtraction_timing"
              ? stockSubtractionTimingSettingId
              : settingType === "allocation_mode"
                ? allocationModeSettingId
                : settingType === "min_order_size"
                  ? minOrderSizeSettingId
                  : settingType === "max_order_size"
                    ? maxOrderSizeSettingId
                    : settingType === "min_order_value"
                      ? minOrderValueSettingId
                      : maxOrderValueSettingId

    if (!settingId) {
      setSaving(false)
      return
    }

    const deletePromise =
      entityType === "user"
        ? deleteUserSetting(settingId).unwrap()
        : deleteContractorSetting({
            contractorId: entityId!,
            id: settingId,
          }).unwrap()

    deletePromise
      .then(() => {
        // Reset form
        if (settingType === "offer_message") {
          setOfferMessage("")
          setOfferEnabled(true)
          setOfferSettingId(null)
        } else if (settingType === "order_message") {
          setOrderMessage("")
          setOrderEnabled(true)
          setOrderSettingId(null)
        } else if (settingType === "require_availability") {
          setRequireAvailabilityEnabled(false)
          setRequireAvailabilitySettingId(null)
        } else if (settingType === "stock_subtraction_timing") {
          setStockSubtractionTiming("on_accepted")
          setStockSubtractionTimingSettingId(null)
        } else if (settingType === "allocation_mode") {
          setAllocationMode("auto")
          setAllocationModeSettingId(null)
        } else if (settingType === "min_order_size") {
          setMinOrderSize("")
          setMinOrderSizeEnabled(false)
          setMinOrderSizeSettingId(null)
        } else if (settingType === "max_order_size") {
          setMaxOrderSize("")
          setMaxOrderSizeEnabled(false)
          setMaxOrderSizeSettingId(null)
        } else if (settingType === "min_order_value") {
          setMinOrderValue("")
          setMinOrderValueEnabled(false)
          setMinOrderValueSettingId(null)
        } else if (settingType === "max_order_value") {
          setMaxOrderValue("")
          setMaxOrderValueEnabled(false)
          setMaxOrderValueSettingId(null)
        }

        issueAlert({
          message: t("OrderSettings.deletedSuccessfully"),
          severity: "success",
        })
        setSuccess(t("OrderSettings.deletedSuccessfully"))
        setSaving(false)
      })
      .catch((err) => {
        issueAlert(err)
        // Extract error message for local state (issueAlert already handles the toast)
        const errorMessage =
          (err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "error" in err.data
            ? typeof err.data.error === "object" &&
              err.data.error &&
              "error" in err.data.error &&
              typeof err.data.error.error === "string"
              ? err.data.error.error
              : typeof err.data.error === "string"
                ? err.data.error
                : undefined
            : undefined) ||
          (err &&
          typeof err === "object" &&
          "message" in err &&
          typeof err.message === "string"
            ? err.message
            : undefined) ||
          t("OrderSettings.deleteError")
        setError(errorMessage)
        setSaving(false)
      })
  }

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
