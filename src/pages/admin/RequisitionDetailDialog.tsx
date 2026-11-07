import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { InventoryRounded } from "@mui/icons-material"
import { useGetRequisitionQuery } from "../../store/api/v2/market"
import type { RequisitionLineItem } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../util/format"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"
import { STATUS_COLORS, STATUS_LABEL_KEYS } from "./requisitionLabels"

// ---------------------------------------------------------------------------
// Requisition Detail Drawer
// ---------------------------------------------------------------------------

export function RequisitionDetailDialog({
  orderId,
  onClose,
}: {
  orderId: string | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { data: req } = useGetRequisitionQuery(
    { orderId: orderId! },
    { skip: !orderId },
  )

  if (!req) return null

  const total = req.items.reduce((s, i) => s + i.price_per_unit * i.quantity, 0)

  return (
    <ResponsiveDialog
      open={!!orderId}
      onClose={onClose}
      maxWidth="sm"
      title={
        <Stack component="span" direction="row" spacing={1} alignItems="center">
          <InventoryRounded />
          <Box component="span" sx={{ display: "block", minWidth: 0 }}>
            <Box component="span" sx={{ display: "block" }}>
              {req.title}
            </Box>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {req.order_id}
            </Typography>
          </Box>
        </Stack>
      }
      actions={
        <>
          <Button onClick={onClose}>
            {t("suppliersUi.requisitions.close")}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          <Chip
            label={
              STATUS_LABEL_KEYS[req.status]
                ? t(STATUS_LABEL_KEYS[req.status])
                : req.status
            }
            size="small"
            color={STATUS_COLORS[req.status] || "default"}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ my: "auto" }}
          >
            {t("suppliersUi.requisitions.createdOn", {
              date: fmt.date(req.created_at),
            })}
          </Typography>
        </Stack>

        {req.description && (
          <Typography variant="body2" color="text.secondary">
            {req.description}
          </Typography>
        )}

        <Divider />

        <Typography variant="subtitle2">
          {t("suppliersUi.requisitions.items")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("suppliersUi.requisitions.columns.item")}
              </TableCell>
              <TableCell align="right">
                {t("suppliersUi.requisitions.qty")}
              </TableCell>
              <TableCell align="right">
                {t("suppliersUi.requisitions.columns.pricePerUnit")}
              </TableCell>
              <TableCell align="right">
                {t("suppliersUi.requisitions.columns.subtotal")}
              </TableCell>
              <TableCell align="right">
                {t("suppliersUi.requisitions.columns.filled")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {req.items.map((item: RequisitionLineItem) => (
              <TableRow key={item.requisition_item_id}>
                <TableCell>{item.game_item_name}</TableCell>
                <TableCell align="right">{fmt.number(item.quantity)}</TableCell>
                <TableCell align="right">
                  {t("suppliersUi.amountAuec", {
                    amount: fmt.number(item.price_per_unit),
                  })}
                </TableCell>
                <TableCell align="right">
                  {t("suppliersUi.amountAuec", {
                    amount: fmt.number(item.price_per_unit * item.quantity),
                  })}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="caption"
                    color={
                      item.fulfilled_quantity >= item.quantity
                        ? "success.main"
                        : "text.secondary"
                    }
                  >
                    {item.fulfilled_quantity}/{item.quantity}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography variant="body2" fontWeight="bold">
                  {t("suppliersUi.requisitions.total")}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {t("suppliersUi.amountAuec", {
                    amount: fmt.number(total),
                  })}
                </Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>

        {req.supplier && (
          <>
            <Divider />
            <Typography variant="subtitle2">
              {t("suppliersUi.requisitions.assignedSupplier")}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ImageAvatar alt="" sx={{ width: 28, height: 28 }}>
                {req.supplier.display_name?.[0]}
              </ImageAvatar>
              <Box>
                <Typography variant="body2">
                  {req.supplier.display_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{req.supplier.username}
                </Typography>
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </ResponsiveDialog>
  )
}
