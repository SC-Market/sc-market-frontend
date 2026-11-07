/**
 * Admin: Requisition Orders
 * Create and track supplier requisition orders (item-anchored, not listing-anchored).
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
 * Will be moved to /seller/requisitions once the feature is stable.
 */

import { useState } from "react"
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import { AddRounded, VisibilityRounded } from "@mui/icons-material"
import { useGetRequisitionsQuery } from "../../store/api/v2/market"
import type { RequisitionDetail } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { usePageReady } from "../../components/metadata/PageReady"
import { useFormatters } from "../../util/format"
import { STATUS_COLORS, STATUS_LABEL_KEYS } from "./requisitionLabels"
import { CreateRequisitionDialog } from "./CreateRequisitionDialog"
import { RequisitionDetailDialog } from "./RequisitionDetailDialog"

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AdminRequisitions() {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)

  const { data, isLoading } = useGetRequisitionsQuery({})
  const fmt = useFormatters()
  usePageReady(isLoading)
  const requisitions: RequisitionDetail[] = data?.requisitions || []

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {t("suppliersUi.requisitions.pageTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("suppliersUi.requisitions.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setCreateOpen(true)}
        >
          {t("suppliersUi.requisitions.newRequisition")}
        </Button>
      </Stack>

      <Paper>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {t("marketV2.loadingEllipsis")}
            </Typography>
          </Box>
        ) : requisitions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              {t("suppliersUi.requisitions.empty")}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddRounded />}
              onClick={() => setCreateOpen(true)}
            >
              {t("suppliersUi.requisitions.createFirst")}
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("suppliersUi.requisitions.columns.title")}
                </TableCell>
                <TableCell>
                  {t("suppliersUi.requisitions.columns.status")}
                </TableCell>
                <TableCell align="right">
                  {t("suppliersUi.requisitions.columns.items")}
                </TableCell>
                <TableCell align="right">
                  {t("suppliersUi.requisitions.columns.total")}
                </TableCell>
                <TableCell>
                  {t("suppliersUi.requisitions.columns.supplier")}
                </TableCell>
                <TableCell>
                  {t("suppliersUi.requisitions.columns.created")}
                </TableCell>
                <TableCell align="right">
                  {t("suppliersUi.requisitions.columns.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requisitions.map((req) => {
                const total = req.items.reduce(
                  (s, i) => s + i.price_per_unit * i.quantity,
                  0,
                )
                const supplierName =
                  req.supplier?.display_name ||
                  req.supplier_contractor?.name ||
                  "—"
                return (
                  <TableRow key={req.order_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {req.title}
                      </Typography>
                      {req.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          STATUS_LABEL_KEYS[req.status]
                            ? t(STATUS_LABEL_KEYS[req.status])
                            : req.status
                        }
                        size="small"
                        color={STATUS_COLORS[req.status] || "default"}
                      />
                    </TableCell>
                    <TableCell align="right">{req.items.length}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {t("suppliersUi.amountAuec", {
                          amount: fmt.number(total),
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{supplierName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {fmt.date(req.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t("suppliersUi.requisitions.view")}>
                        <IconButton
                          size="small"
                          onClick={() => setViewId(req.order_id)}
                        >
                          <VisibilityRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <CreateRequisitionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <RequisitionDetailDialog
        orderId={viewId}
        onClose={() => setViewId(null)}
      />
    </Box>
  )
}
