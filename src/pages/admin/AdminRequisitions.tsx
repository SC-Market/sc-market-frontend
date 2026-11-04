/**
 * Admin: Requisition Orders
 * Create and track supplier requisition orders (item-anchored, not listing-anchored).
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
 * Will be moved to /seller/requisitions once the feature is stable.
 */

import React, { useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AddRounded,
  DeleteRounded,
  VisibilityRounded,
  InventoryRounded,
} from "@mui/icons-material"
import { Autocomplete } from "@mui/material"
import {
  useGetRequisitionsQuery,
  useCreateRequisitionMutation,
  useGetRequisitionQuery,
  useSearchGameItemsQuery,
} from "../../store/api/v2/market"
import type {
  RequisitionDetail,
  RequisitionLineItem,
  GameItemSearchResult,
} from "../../store/api/v2/market"
import { Trans, useTranslation } from "react-i18next"
import { usePageReady } from "../../components/metadata/PageReady"
import { useFormatters } from "../../util/format"

const STATUS_COLORS: Record<
  string,
  "default" | "warning" | "info" | "success" | "error"
> = {
  "not-started": "warning",
  "in-progress": "info",
  fulfilled: "success",
  cancelled: "error",
}
const STATUS_LABEL_KEYS: Record<string, string> = {
  "not-started": "suppliersUi.requisitions.statusChip.notStarted",
  "in-progress": "suppliersUi.requisitions.statusChip.inProgress",
  fulfilled: "suppliersUi.requisitions.statusChip.fulfilled",
  cancelled: "suppliersUi.requisitions.statusChip.cancelled",
}

// ---------------------------------------------------------------------------
// Game item search with debounce
// ---------------------------------------------------------------------------

function GameItemPicker({
  value,
  onChange,
}: {
  value: { id: string; name: string } | null
  onChange: (item: { id: string; name: string } | null) => void
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const { data: results = [], isFetching } = useSearchGameItemsQuery(
    { query },
    {
      skip: query.length < 2,
    },
  )

  return (
    <Autocomplete<GameItemSearchResult>
      size="small"
      options={results}
      getOptionLabel={(o) => o.name || ""}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      loading={isFetching}
      value={value ? (results.find((r) => r.id === value.id) ?? null) : null}
      onChange={(_, newVal) => {
        if (newVal) {
          onChange({
            id: newVal.id,
            name: newVal.name,
          })
        } else {
          onChange(null)
        }
      }}
      inputValue={query}
      onInputChange={(_, v, reason) => {
        if (reason !== "reset") setQuery(v)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("suppliersUi.requisitions.gameItem")}
          placeholder={t("suppliersUi.requisitions.searchByName")}
        />
      )}
    />
  )
}

// ---------------------------------------------------------------------------
// Create Requisition Dialog
// ---------------------------------------------------------------------------

interface LineItemDraft {
  key: number
  game_item: { id: string; name: string } | null
  quantity: number
  price_per_unit: number
}

function CreateRequisitionDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const [create, { isLoading, error }] = useCreateRequisitionMutation()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetId, setTargetId] = useState("")
  const [items, setItems] = useState<LineItemDraft[]>([
    { key: 0, game_item: null, quantity: 1, price_per_unit: 0 },
  ])
  const [nextKey, setNextKey] = useState(1)

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: nextKey, game_item: null, quantity: 1, price_per_unit: 0 },
    ])
    setNextKey((k) => k + 1)
  }

  const removeItem = (key: number) =>
    setItems((prev) => prev.filter((i) => i.key !== key))

  const updateItem = (key: number, patch: Partial<LineItemDraft>) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    )

  const totalPrice = items.reduce(
    (s, i) => s + i.quantity * i.price_per_unit,
    0,
  )

  const canSubmit =
    title.trim().length > 0 &&
    items.length > 0 &&
    items.every((i) => i.game_item && i.quantity > 0)

  const handleSubmit = async () => {
    try {
      await create({
        createRequisitionRequest: {
          title: title.trim(),
          description: description.trim() || undefined,
          target_supplier_id: targetId.trim() || undefined,
          items: items.map((i) => ({
            game_item_id: i.game_item!.id,
            quantity: i.quantity,
            price_per_unit: i.price_per_unit,
          })),
        },
      }).unwrap()
      // Reset form
      setTitle("")
      setDescription("")
      setTargetId("")
      setItems([{ key: 0, game_item: null, quantity: 1, price_per_unit: 0 }])
      setNextKey(1)
      onClose()
    } catch {
      // The dialog shows the request's error (the mutation's `error`).
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("suppliersUi.requisitions.createTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Header fields */}
          <TextField
            size="small"
            label={t("suppliersUi.requisitions.fieldTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label={t("suppliersUi.requisitions.descriptionOptional")}
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label={t("suppliersUi.requisitions.targetSupplier")}
            placeholder={t("suppliersUi.requisitions.targetPlaceholder")}
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            fullWidth
            helperText={t("suppliersUi.requisitions.targetHelper")}
          />

          <Divider />

          {/* Line items */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2">
              {t("suppliersUi.requisitions.lineItems")}
            </Typography>
            <Button size="small" startIcon={<AddRounded />} onClick={addItem}>
              {t("suppliersUi.requisitions.addItem")}
            </Button>
          </Stack>

          {items.map((item, idx) => (
            <Paper key={item.key} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 20 }}
                >
                  {idx + 1}.
                </Typography>
                <Box sx={{ flex: 2 }}>
                  <GameItemPicker
                    value={item.game_item}
                    onChange={(gi) => updateItem(item.key, { game_item: gi })}
                  />
                </Box>
                <TextField
                  size="small"
                  label={t("suppliersUi.requisitions.qty")}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.key, {
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  sx={{ width: 90 }}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  size="small"
                  label={t("suppliersUi.requisitions.maxPricePerUnit")}
                  type="number"
                  value={item.price_per_unit}
                  onChange={(e) =>
                    updateItem(item.key, {
                      price_per_unit: Math.max(
                        0,
                        parseInt(e.target.value) || 0,
                      ),
                    })
                  }
                  sx={{ width: 160 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">aUEC</InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ minWidth: 80, textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("suppliersUi.amountAuec", {
                      amount: fmt.number(item.quantity * item.price_per_unit),
                    })}
                  </Typography>
                </Box>
                <Tooltip title={t("suppliersUi.requisitions.remove")}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeItem(item.key)}
                    disabled={items.length === 1}
                  >
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}

          <Stack direction="row" justifyContent="flex-end">
            <Typography variant="body2" color="text.secondary">
              <Trans
                i18nKey="suppliersUi.requisitions.totalWithAmount"
                values={{ amount: fmt.number(totalPrice) }}
                components={{
                  strong: (
                    <Typography
                      component="span"
                      variant="body2"
                      fontWeight="bold"
                      color="text.primary"
                    />
                  ),
                }}
              />
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error">
              {(error &&
                "data" in error &&
                (error.data as { message?: string })?.message) ||
                t("suppliersUi.requisitions.createFailed")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
        >
          {t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Requisition Detail Drawer
// ---------------------------------------------------------------------------

function RequisitionDetailDialog({
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
    <Dialog open={!!orderId} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <InventoryRounded />
          <Box>
            <Typography variant="h6">{req.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {req.order_id}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
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
                  <TableCell align="right">
                    {fmt.number(item.quantity)}
                  </TableCell>
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
                <Avatar sx={{ width: 28, height: 28 }}>
                  {req.supplier.display_name?.[0]}
                </Avatar>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("suppliersUi.requisitions.close")}</Button>
      </DialogActions>
    </Dialog>
  )
}

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
