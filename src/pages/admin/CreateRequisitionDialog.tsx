import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { AddRounded, DeleteRounded } from "@mui/icons-material"
import { Autocomplete } from "@mui/material"
import {
  useCreateRequisitionMutation,
  useSearchGameItemsQuery,
} from "../../store/api/v2/market"
import type { GameItemSearchResult } from "../../store/api/v2/market"
import { Trans, useTranslation } from "react-i18next"
import { useFormatters } from "../../util/format"
import { ResponsiveDialog } from "../../components/dialog/ResponsiveDialog"

// ---------------------------------------------------------------------------
// Game item search with debounce
// ---------------------------------------------------------------------------

export function GameItemPicker({
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

export interface LineItemDraft {
  key: number
  game_item: { id: string; name: string } | null
  quantity: number
  price_per_unit: number
}

export function CreateRequisitionDialog({
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
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={t("suppliersUi.requisitions.createTitle")}
      mobile="fullScreen"
      disableClose={isLoading}
      actions={
        <>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {t("common.create")}
          </Button>
        </>
      }
    >
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
                    price_per_unit: Math.max(0, parseInt(e.target.value) || 0),
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
    </ResponsiveDialog>
  )
}
