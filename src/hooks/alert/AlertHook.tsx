import React from "react"
import { AlertInterface } from "../../datatypes/Alert"
import type { StandardErrorResponse } from "../../store/api-types"
import { extractErrorMessage } from "../../store/api-utils"

export const AlertHookContext = React.createContext<
  | [
      AlertInterface | null,
      React.Dispatch<React.SetStateAction<AlertInterface | null>>,
    ]
  | null
>(null)

export interface UnwrappedErrorInterface {
  message?: string
  error?: {
    message: string
    code?: string
    details?: Record<string, any>
    validationErrors?: Array<{
      field: string
      message: string
      code?: string
    }>
  }
  errors?: {
    message: string
  }[]
  validationErrors?: {
    instancePath?: string
    schemaPath?: string
    keyword?: string
    params?: object
    message: string
    field?: string
  }[]
}

export interface ErrorInterface {
  status: number
  data: UnwrappedErrorInterface | StandardErrorResponse
}

/**
 * Format error for display in alert
 * 
 * Supports both new standardized error format and legacy formats
 */
export function formatErrorAlert(
  error: UnwrappedErrorInterface | StandardErrorResponse,
): AlertInterface {
  // New standardized format: { error: { code, message, validationErrors? } }
  if (error && typeof error === "object" && "error" in error) {
    const standardError = error as StandardErrorResponse
    if (
      standardError.error &&
      typeof standardError.error === "object" &&
      "message" in standardError.error
    ) {
      let message = standardError.error.message

      // Add validation errors if present
      if (standardError.error.validationErrors?.length) {
        const firstError = standardError.error.validationErrors[0]
        message = `${message}: ${firstError.field} ${firstError.message}`
      }

      return {
        message,
        severity: "error",
      }
    }
  }

  // Legacy formats for backward compatibility
  const legacyError = error as UnwrappedErrorInterface
  let message =
    legacyError.error?.message ||
    legacyError.message ||
    "An error occurred"

  if (legacyError.errors?.length) {
    message = message.concat(" ", legacyError.errors[0].message)
  } else if (legacyError.validationErrors?.length) {
    const firstError = legacyError.validationErrors[0]
    // Handle both new format (field) and legacy format (instancePath)
    const field =
      firstError.field ||
      (firstError.instancePath
        ? firstError.instancePath.split("/").pop() || ""
        : "")
    if (field) {
      message = message.concat(": ", field, " ", firstError.message)
    } else {
      message = message.concat(": ", firstError.message)
    }
  }

  return {
    message,
    severity: "error",
  }
}

export const useAlertHook = () => {
  const val = React.useContext(AlertHookContext)
  if (val == null) {
    throw new Error("Cannot use useAlertHook outside of AlertHookContext")
  }

  const [, setAlert] = val

  function issueAlert(alert: AlertInterface): void
  function issueAlert(error: ErrorInterface): void
  function issueAlert(error: UnwrappedErrorInterface): void
  function issueAlert(
    arg1: AlertInterface | ErrorInterface | UnwrappedErrorInterface,
  ): void {
    if ((arg1 as AlertInterface).severity) {
      setAlert(arg1 as AlertInterface)
    } else if ((arg1 as ErrorInterface).data) {
      setAlert(formatErrorAlert((arg1 as ErrorInterface).data))
    } else {
      setAlert(formatErrorAlert(arg1 as UnwrappedErrorInterface))
    }
  }

  return issueAlert
}
