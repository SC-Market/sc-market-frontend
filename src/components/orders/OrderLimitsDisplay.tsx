import React from "react"
import { Alert, Box, Typography } from "@mui/material"
import {
  InfoRounded,
  WarningRounded,
  CheckCircleRounded,
  ErrorRounded as ErrorIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import type { OrderLimits } from "../../features/orders/domain/types"

import { useFormatters } from "../../util/format"
interface OrderLimitsDisplayProps {
  limits: OrderLimits
  currentSize?: number // Current order size (sum of quantities)
  currentValue?: number // Current order value (cost)
  showValidation?: boolean // Show real-time validation feedback
}

type ValidationState = "info" | "warning" | "error" | "success"

function getSizeValidationState(
  limits: OrderLimits,
  currentSize: number,
  showValidation: boolean,
): ValidationState | null {
  if (!showValidation) return null

  const minSize = limits.min_order_size
    ? parseInt(limits.min_order_size, 10)
    : null
  const maxSize = limits.max_order_size
    ? parseInt(limits.max_order_size, 10)
    : null

  if (minSize !== null && currentSize < minSize) {
    return "error"
  }
  if (maxSize !== null && currentSize > maxSize) {
    return "error"
  }
  if (minSize !== null && currentSize < minSize * 1.1) {
    return "warning"
  }
  if (maxSize !== null && currentSize > maxSize * 0.9) {
    return "warning"
  }
  if (minSize !== null || maxSize !== null) {
    return "success"
  }
  return null
}

function getValueValidationState(
  limits: OrderLimits,
  currentValue: number,
  showValidation: boolean,
): ValidationState | null {
  if (!showValidation) return null

  const minValue = limits.min_order_value
    ? parseInt(limits.min_order_value, 10)
    : null
  const maxValue = limits.max_order_value
    ? parseInt(limits.max_order_value, 10)
    : null

  if (minValue !== null && currentValue < minValue) {
    return "error"
  }
  if (maxValue !== null && currentValue > maxValue) {
    return "error"
  }
  if (minValue !== null && currentValue < minValue * 1.1) {
    return "warning"
  }
  if (maxValue !== null && currentValue > maxValue * 0.9) {
    return "warning"
  }
  if (minValue !== null || maxValue !== null) {
    return "success"
  }
  return null
}

export function OrderLimitsDisplay({
  limits,
  currentSize,
  currentValue,
  showValidation = false,
}: OrderLimitsDisplayProps) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  // Check if any limits are set
  const hasLimits =
    limits.min_order_size ||
    limits.max_order_size ||
    limits.min_order_value ||
    limits.max_order_value

  if (!hasLimits) {
    return null // Don't display anything if no limits are set
  }

  const sizeState =
    currentSize !== undefined
      ? getSizeValidationState(limits, currentSize, showValidation)
      : null
  const valueState =
    currentValue !== undefined
      ? getValueValidationState(limits, currentValue, showValidation)
      : null

  const hasErrors = sizeState === "error" || valueState === "error"
  const hasWarnings = sizeState === "warning" || valueState === "warning"

  // Determine overall severity
  let severity: "info" | "warning" | "error" = "info"
  if (hasErrors) {
    severity = "error"
  } else if (hasWarnings) {
    severity = "warning"
  }

  return (
    <Alert severity={severity} icon={<InfoRounded />}>
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        {t("OrderSettings.requirementsTitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Size limits */}
        {(limits.min_order_size || limits.max_order_size) && (
          <Box>
            <Typography variant="body2" component="span">
              <strong>{t("ordersUi.limits.sizeLabel")}</strong>{" "}
              {limits.min_order_size && (
                <span>
                  {t("ordersUi.limits.minItems", {
                    count: parseInt(limits.min_order_size, 10),
                    amount: fmt.integer(limits.min_order_size),
                  })}
                </span>
              )}
              {limits.min_order_size && limits.max_order_size && " • "}
              {limits.max_order_size && (
                <span>
                  {t("ordersUi.limits.maxItems", {
                    count: parseInt(limits.max_order_size, 10),
                    amount: fmt.integer(limits.max_order_size),
                  })}
                </span>
              )}
            </Typography>
            {showValidation && currentSize !== undefined && (
              <Box sx={{ ml: 2, mt: 0.5 }}>
                {sizeState === "error" && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <ErrorIcon fontSize="small" />
                    {limits.min_order_size &&
                    currentSize < parseInt(limits.min_order_size, 10)
                      ? t("ordersUi.limits.sizeBelowMin", {
                          current: currentSize,
                          min: fmt.integer(limits.min_order_size),
                        })
                      : t("ordersUi.limits.sizeAboveMax", {
                          current: currentSize,
                          max: fmt.integer(limits.max_order_size ?? 0),
                        })}
                  </Typography>
                )}
                {sizeState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <WarningRounded fontSize="small" />
                    {t("ordersUi.limits.sizeNearLimit", {
                      current: currentSize,
                    })}
                  </Typography>
                )}
                {sizeState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircleRounded fontSize="small" />
                    {t("ordersUi.limits.sizeOk")}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Value limits */}
        {(limits.min_order_value || limits.max_order_value) && (
          <Box>
            <Typography variant="body2" component="span">
              <strong>{t("ordersUi.limits.valueLabel")}</strong>{" "}
              {limits.min_order_value && (
                <span>
                  {t("ordersUi.limits.minValue", {
                    amount: fmt.integer(limits.min_order_value),
                  })}
                </span>
              )}
              {limits.min_order_value && limits.max_order_value && " • "}
              {limits.max_order_value && (
                <span>
                  {t("ordersUi.limits.maxValue", {
                    amount: fmt.integer(limits.max_order_value),
                  })}
                </span>
              )}
            </Typography>
            {showValidation && currentValue !== undefined && (
              <Box sx={{ ml: 2, mt: 0.5 }}>
                {valueState === "error" && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <ErrorIcon fontSize="small" />
                    {limits.min_order_value &&
                    currentValue < parseInt(limits.min_order_value, 10)
                      ? t("ordersUi.limits.valueBelowMin", {
                          current: fmt.integer(currentValue),
                          min: fmt.integer(limits.min_order_value),
                        })
                      : t("ordersUi.limits.valueAboveMax", {
                          current: fmt.integer(currentValue),
                          max: fmt.integer(limits.max_order_value ?? 0),
                        })}
                  </Typography>
                )}
                {valueState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <WarningRounded fontSize="small" />
                    {t("ordersUi.limits.valueNearLimit", {
                      current: fmt.integer(currentValue),
                    })}
                  </Typography>
                )}
                {valueState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircleRounded fontSize="small" />
                    {t("ordersUi.limits.valueOk")}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Alert>
  )
}
