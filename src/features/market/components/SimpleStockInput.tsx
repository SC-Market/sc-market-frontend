/**
 * Simple Stock Input Component
 * 
 * Provides a single number input for stock quantity with progressive disclosure
 * to advanced stock management features.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.5, 5.1, 9.1, 9.2, 9.4
 */

import React, { useState, useCallback, useEffect } from "react"
import {
  TextField,
  Box,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Stack,
} from "@mui/material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import {
  useUpdateSimpleStockMutation,
  useGetListingLotsQuery,
} from "../../../store/api/stock-lots"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

export interface SimpleStockInputProps {
  listingId: string
  initialQuantity?: number
  onQuantityChange?: (quantity: number) => void
  disabled?: boolean
  size?: "small" | "medium"
  label?: string
}

/**
 * SimpleStockInput Component
 * 
 * Displays a single number input for stock quantity.
 * Shows available and reserved quantities below the input.
 * Provides a "Manage Stock" link when multiple lots exist or non-Unspecified locations are present.
 */
export function SimpleStockInput({
  listingId,
  initialQuantity = 0,
  onQuantityChange,
  disabled = false,
  size = "small",
  label,
}: SimpleStockInputProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Local state for the input value
  const [quantity, setQuantity] = useState(initialQuantity)

  // Fetch lot details to determine if we should show advanced features
  const {
    data: lotsData,
    isLoading: isLoadingLots,
    refetch: refetchLots,
  } = useGetListingLotsQuery(
    { listing_id: listingId },
    { skip: !listingId },
  )

  // Update mutation
  const [updateStock, { isLoading: isUpdating }] =
    useUpdateSimpleStockMutation()

  // Update local state when initial quantity changes
  useEffect(() => {
    setQuantity(initialQuantity)
  }, [initialQuantity])

  // Update local state when lots data is loaded
  useEffect(() => {
    if (lotsData?.aggregates) {
      setQuantity(lotsData.aggregates.available + lotsData.aggregates.reserved)
    }
  }, [lotsData])

  // Handle quantity change
  const handleQuantityChange = useCallback(
    async (newQuantity: number) => {
      setQuantity(newQuantity)

      try {
        const result = await updateStock({
          listing_id: listingId,
          quantity: newQuantity,
        }).unwrap()

        // Notify parent component
        if (onQuantityChange) {
          onQuantityChange(newQuantity)
        }

        // Refetch lots to update aggregates
        await refetchLots()
      } catch (error) {
        issueAlert({
          message: t(
            "SimpleStockInput.updateError",
            "Failed to update stock quantity",
          ),
          severity: "error",
        })
        // Revert to previous value on error
        if (lotsData?.aggregates) {
          setQuantity(
            lotsData.aggregates.available + lotsData.aggregates.reserved,
          )
        }
      }
    },
    [
      listingId,
      updateStock,
      onQuantityChange,
      refetchLots,
      issueAlert,
      t,
      lotsData,
    ],
  )

  // Determine if we should show the "Manage Stock" link
  // Show if: multiple lots exist OR any lot has a non-Unspecified location
  const shouldShowManageLink = React.useMemo(() => {
    if (!lotsData?.lots) return false

    // Check if multiple lots exist
    if (lotsData.lots.length > 1) return true

    // Check if any lot has a non-null location_id (non-Unspecified)
    const hasNonUnspecifiedLocation = lotsData.lots.some(
      (lot) => lot.location_id !== null,
    )

    return hasNonUnspecifiedLocation
  }, [lotsData])

  // Get aggregates for display
  const available = lotsData?.aggregates?.available ?? 0
  const reserved = lotsData?.aggregates?.reserved ?? 0

  return (
    <Box>
      <NumericFormat
        decimalScale={0}
        allowNegative={false}
        customInput={TextField}
        thousandSeparator
        onValueChange={async (values) => {
          const newValue = values.floatValue || 0
          if (newValue !== quantity) {
            await handleQuantityChange(newValue)
          }
        }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          "aria-label": t(
            "SimpleStockInput.quantityLabel",
            "Enter quantity available",
          ),
          "aria-describedby": "stock-quantity-help",
        }}
        size={size}
        label={label || t("SimpleStockInput.quantity", "Quantity Available")}
        value={quantity}
        fullWidth
        color="secondary"
        disabled={disabled || isUpdating}
        InputProps={{
          endAdornment: isUpdating ? (
            <CircularProgress size={20} />
          ) : undefined,
        }}
      />
      <div id="stock-quantity-help" className="sr-only">
        {t(
          "SimpleStockInput.quantityHelp",
          "Enter the total quantity of items available for sale",
        )}
      </div>

      {/* Display available and reserved quantities */}
      {!isLoadingLots && lotsData && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 0.5, alignItems: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("SimpleStockInput.available", "Available")}: {available}
          </Typography>
          {reserved > 0 && (
            <Typography variant="caption" color="warning.main">
              {t("SimpleStockInput.reserved", "Reserved")}: {reserved}
            </Typography>
          )}

          {/* Progressive disclosure: Show "Manage Stock" link when appropriate */}
          {shouldShowManageLink && (
            <MuiLink
              href={`#manage-stock-${listingId}`}
              variant="caption"
              sx={{ ml: "auto" }}
              onClick={(e) => {
                e.preventDefault()
                // TODO: Open advanced stock manager modal/drawer
                // This will be implemented in task 7
                issueAlert({
                  message: t(
                    "SimpleStockInput.advancedFeatureComingSoon",
                    "Advanced stock management coming soon",
                  ),
                  severity: "info",
                })
              }}
            >
              {t("SimpleStockInput.manageStock", "Manage Stock")} →
            </MuiLink>
          )}
        </Stack>
      )}
    </Box>
  )
}
