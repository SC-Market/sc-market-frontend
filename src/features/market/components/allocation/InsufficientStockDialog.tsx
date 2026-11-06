/**
 * InsufficientStockDialog Component
 *
 * Displays detailed information when stock allocation fails due to insufficient quantity.
 * Provides actionable options to resolve the issue.
 *
 * Requirements: 13.1, 13.2
 */

import { Button, Stack, Typography, Alert, Box, Divider } from "@mui/material"
import { WarningRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { ResponsiveDialog } from "../../../../components/dialog/ResponsiveDialog"

interface InsufficientStockDialogProps {
  open: boolean
  onClose: () => void
  orderQuantity: number
  availableQuantity: number
  shortfall: number
  onAddStock?: () => void
  onAllocateUnlisted?: () => void
  onReduceOrder?: () => void
}

export function InsufficientStockDialog({
  open,
  onClose,
  orderQuantity,
  availableQuantity,
  shortfall,
  onAddStock,
  onAllocateUnlisted,
  onReduceOrder,
}: InsufficientStockDialogProps) {
  const { t } = useTranslation()
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={
        <Stack component="span" direction="row" spacing={1} alignItems="center">
          <WarningRounded color="warning" />
          <span>{t("allocationUi.insufficient.title")}</span>
        </Stack>
      }
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
        </>
      }
    >
      <Stack spacing={3}>
        {/* Problem Summary */}
        <Alert severity="warning">
          <Typography variant="body2" gutterBottom>
            <strong>{t("allocationUi.insufficient.cannotAllocate")}</strong>
          </Typography>
          <Typography variant="body2">
            {t("allocationUi.insufficient.summary", {
              count: orderQuantity,
              availableText: t("allocationUi.insufficient.availableUnits", {
                count: availableQuantity,
              }),
            })}
          </Typography>
        </Alert>

        {/* Detailed Breakdown */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("allocationUi.insufficient.breakdown")}
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("allocationUi.insufficient.orderQuantity")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {orderQuantity}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("allocationUi.insufficient.availableStock")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {availableQuantity}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="error" fontWeight="medium">
                {t("allocationUi.insufficient.shortfall")}
              </Typography>
              <Typography variant="body2" color="error" fontWeight="medium">
                {shortfall}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Resolution Options */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t("allocationUi.insufficient.whatToDo")}
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {onAddStock && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  onAddStock()
                  onClose()
                }}
                sx={{ justifyContent: "flex-start", textAlign: "left" }}
              >
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography variant="body2" fontWeight="medium">
                    {t("allocationUi.insufficient.addStock")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("allocationUi.insufficient.addStockHint")}
                  </Typography>
                </Stack>
              </Button>
            )}

            {onAllocateUnlisted && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  onAllocateUnlisted()
                  onClose()
                }}
                sx={{ justifyContent: "flex-start", textAlign: "left" }}
              >
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography variant="body2" fontWeight="medium">
                    {t("allocationUi.insufficient.useUnlisted")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("allocationUi.insufficient.useUnlistedHint")}
                  </Typography>
                </Stack>
              </Button>
            )}

            {onReduceOrder && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  onReduceOrder()
                  onClose()
                }}
                sx={{ justifyContent: "flex-start", textAlign: "left" }}
              >
                <Stack spacing={0.5} alignItems="flex-start">
                  <Typography variant="body2" fontWeight="medium">
                    {t("allocationUi.insufficient.reduceOrder")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("allocationUi.insufficient.reduceOrderHint", {
                      count: availableQuantity,
                    })}
                  </Typography>
                </Stack>
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </ResponsiveDialog>
  )
}
