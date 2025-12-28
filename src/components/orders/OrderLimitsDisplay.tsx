import React from "react"
import { Alert, Box, Typography } from "@mui/material"
import { Info, Warning, CheckCircle, Error as ErrorIcon } from "@mui/icons-material"
import { OrderLimits } from "../../store/orderSettings"

interface OrderLimitsDisplayProps {
  limits: OrderLimits
  currentSize?: number // Current order size (sum of quantities)
  currentValue?: number // Current order value (cost)
  showValidation?: boolean // Show real-time validation feedback
}

type ValidationState = "info" | "warning" | "error" | "success"

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value
  return num.toLocaleString("en-US")
}

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
    <Alert severity={severity} icon={<Info />}>
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        Order Requirements
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Size limits */}
        {(limits.min_order_size || limits.max_order_size) && (
          <Box>
            <Typography variant="body2" component="span">
              <strong>Size:</strong>{" "}
              {limits.min_order_size && (
                <span>Min {formatCurrency(limits.min_order_size)} items</span>
              )}
              {limits.min_order_size && limits.max_order_size && " • "}
              {limits.max_order_size && (
                <span>Max {formatCurrency(limits.max_order_size)} items</span>
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
                    Current size ({currentSize}){" "}
                    {limits.min_order_size &&
                      currentSize < parseInt(limits.min_order_size, 10) &&
                      `is below minimum (${formatCurrency(limits.min_order_size)})`}
                    {limits.max_order_size &&
                      currentSize > parseInt(limits.max_order_size, 10) &&
                      `exceeds maximum (${formatCurrency(limits.max_order_size)})`}
                  </Typography>
                )}
                {sizeState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Warning fontSize="small" />
                    Current size ({currentSize}) is close to limit
                  </Typography>
                )}
                {sizeState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircle fontSize="small" />
                    Size meets requirements
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
              <strong>Value:</strong>{" "}
              {limits.min_order_value && (
                <span>Min {formatCurrency(limits.min_order_value)} aUEC</span>
              )}
              {limits.min_order_value && limits.max_order_value && " • "}
              {limits.max_order_value && (
                <span>Max {formatCurrency(limits.max_order_value)} aUEC</span>
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
                    Current value ({formatCurrency(currentValue)}){" "}
                    {limits.min_order_value &&
                      currentValue < parseInt(limits.min_order_value, 10) &&
                      `is below minimum (${formatCurrency(limits.min_order_value)})`}
                    {limits.max_order_value &&
                      currentValue > parseInt(limits.max_order_value, 10) &&
                      `exceeds maximum (${formatCurrency(limits.max_order_value)})`}
                  </Typography>
                )}
                {valueState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Warning fontSize="small" />
                    Current value ({formatCurrency(currentValue)}) is close to
                    limit
                  </Typography>
                )}
                {valueState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircle fontSize="small" />
                    Value meets requirements
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
