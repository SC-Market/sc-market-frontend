/**
 * ValidationErrorAlert Component
 *
 * Displays validation errors with clear, actionable messages.
 * Handles different types of validation errors with appropriate formatting.
 *
 * Requirements: 13.3, 2.4, 8.2
 */

import { Alert, Stack, Typography } from "@mui/material"
import { ErrorOutlineRounded } from "@mui/icons-material"

export type ValidationErrorType =
  | "negative_quantity"
  | "over_allocation"
  | "character_limit"
  | "required_field"
  | "invalid_format"
  | "generic"

export interface ValidationError {
  type: ValidationErrorType
  message: string
  field?: string
  limit?: number
  current?: number
}

interface ValidationErrorAlertProps {
  errors: ValidationError[]
  onDismiss?: () => void
}

export function ValidationErrorAlert({
  errors,
  onDismiss,
}: ValidationErrorAlertProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <Alert severity="error" icon={<ErrorOutlineRounded />} onClose={onDismiss}>
      <Stack spacing={0.5}>
        {errors.length === 1 ? (
          <Typography variant="body2">{errors[0].message}</Typography>
        ) : (
          <>
            <Typography variant="body2" fontWeight="medium">
              Please fix the following errors:
            </Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2" component="div">
                • {error.message}
              </Typography>
            ))}
          </>
        )}
      </Stack>
    </Alert>
  )
}

/**
 * Helper function to create validation errors with consistent messaging
 */
export const createValidationError = {
  negativeQuantity: (field: string = "Quantity"): ValidationError => ({
    type: "negative_quantity",
    message: `${field} cannot be negative`,
    field,
  }),

  overAllocation: (
    allocated: number,
    available: number,
    field?: string,
  ): ValidationError => ({
    type: "over_allocation",
    message: field
      ? `${field} allocation (${allocated}) exceeds available quantity (${available})`
      : `Allocation (${allocated}) exceeds available quantity (${available})`,
    current: allocated,
    limit: available,
  }),

  characterLimit: (
    field: string,
    current: number,
    limit: number,
  ): ValidationError => ({
    type: "character_limit",
    message: `${field} exceeds maximum length of ${limit} characters (current: ${current})`,
    field,
    current,
    limit,
  }),

  requiredField: (field: string): ValidationError => ({
    type: "required_field",
    message: `${field} is required`,
    field,
  }),

  invalidFormat: (field: string, expected: string): ValidationError => ({
    type: "invalid_format",
    message: `${field} has invalid format. Expected: ${expected}`,
    field,
  }),

  generic: (message: string): ValidationError => ({
    type: "generic",
    message,
  }),
}
