import {
  CreateRounded,
  DeleteRounded,
  RadioButtonCheckedRounded,
  SaveRounded,
} from "@mui/icons-material"
import {
  Box,
  Chip,
  IconButton,
  Link as MaterialLink,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid"
import { RefreshCircle } from "mdi-material-ui"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { Link } from "react-router-dom"
import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import { withShopContext } from "../../../components/sidebar/shopContextState"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { selectOnFocus } from "../../../util/selectOnFocus"
import { HelpTip } from "../../help/components/HelpTip"
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete"
import { formatMarketUrl } from "../domain/urls"
import { useRefreshListing } from "../hooks/useStockListingActions"
import { NewListingRowV2 } from "./stockListingSelection"
import { ListingRenewCell } from "./ListingRenewCell"

/** The desktop stock grid's columns: item, status, price, quantity, actions. */
export function useShopListingsColumns({
  newRows,
  rowModesModel,
  editingRows,
  setEditingRows,
  handleRefresh,
  handleEditClick,
  handleCancelClick,
  handleSaveClick,
  canManage,
  shopSlug,
}: {
  newRows: NewListingRowV2[]
  rowModesModel: GridRowModesModel
  editingRows: Record<string, Partial<NewListingRowV2>>
  setEditingRows: React.Dispatch<
    React.SetStateAction<Record<string, Partial<NewListingRowV2>>>
  >
  handleRefresh: ReturnType<typeof useRefreshListing>
  handleEditClick: (id: GridRowId) => () => void
  handleCancelClick: (id: GridRowId) => () => void
  handleSaveClick: (id: GridRowId) => () => void
  canManage: boolean
  shopSlug: string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return useMemo<GridColDef[]>(
    () => [
      {
        field: "title",
        headerName: t("ItemStock.title"),
        flex: 1,
        // Room for the quick-add row's item search (it was 42 px wide)
        minWidth: 240,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <GameItemSearchAutocomplete
                required
                sx={{ width: "100%" }}
                label={t("ItemStock.item", "Item")}
                value={editing?.game_item_name ?? null}
                onChange={(name, _type, itemId) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id as string],
                      game_item_name: name,
                      game_item_id: itemId,
                    },
                  }))
                }}
                size="small"
              />
            )
          }
          if (nr) return nr.game_item_name || t("ItemStock.noItemSelected")
          return (
            <Stack
              direction="row"
              spacing={theme.layoutSpacing.compact}
              alignItems="center"
            >
              <MaterialLink
                component={Link}
                to={formatMarketUrl(params.row)}
                sx={{ fontWeight: "bold" }}
                underline="hover"
              >
                {params.row.title}
              </MaterialLink>
            </Stack>
          )
        },
      },
      {
        field: "price_min",
        headerName: t("ItemStock.price"),
        width: 150,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          if (rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(v) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id as string],
                      price: v.floatValue || 1,
                    },
                  }))
                }}
                size="small"
                onFocus={selectOnFocus}
                label={t("ItemStock.price")}
                value={editing?.price ?? params.row.price_min ?? 1}
              />
            )
          }
          const min = params.row.price_min
          const max = params.row.price_max
          if (min === max) return `${fmt.number(min)} aUEC`
          return `${fmt.number(min)}–${fmt.number(max)} aUEC`
        },
      },
      {
        field: "quantity_available",
        headerName: t("ItemStock.quantity"),
        width: 90,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          if (rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(v) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id as string],
                      quantity_available: v.floatValue || 0,
                    },
                  }))
                }}
                size="small"
                onFocus={selectOnFocus}
                label={t("ItemStock.qty")}
                value={editing?.quantity_available ?? params.value ?? 0}
              />
            )
          }
          return fmt.number(params.value ?? 0)
        },
      },
      {
        field: "quality",
        headerName: t("ItemStock.quality", "Quality"),
        width: 100,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          const min = params.row.quality_tier_min
          const max = params.row.quality_tier_max
          if (min == null)
            return (
              <Typography variant="body2" color="text.primary">
                —
              </Typography>
            )
          const label = min === max ? `Tier ${min}` : `T${min}–${max}`
          return (
            <Chip
              label={label}
              size="small"
              variant="outlined"
              color={min >= 4 ? "success" : min >= 3 ? "primary" : "default"}
            />
          )
        },
      },
      {
        field: "variant_count",
        headerName: t("ItemStock.variants", "Variants"),
        width: 80,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          return params.value ?? 0
        },
      },
      {
        field: "status",
        headerName: t("ItemStock.status"),
        width: 100,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr && rowModesModel[params.id]?.mode === GridRowModes.Edit) {
            const editing = editingRows[params.id as string]
            return (
              <LabeledSwitch
                hideLabel
                label={t("ItemStock.status")}
                checked={(editing?.status ?? "active") === "active"}
                onChange={(checked) => {
                  const newStatus: "active" | "inactive" = checked
                    ? "active"
                    : "inactive"
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id as string],
                      status: newStatus,
                    },
                  }))
                }}
              />
            )
          }
          return (
            <Typography
              color={params.value === "active" ? "success" : "error"}
              display="flex"
              alignItems="center"
              variant="subtitle2"
            >
              <RadioButtonCheckedRounded
                fontSize="small"
                style={{ marginRight: 1 }}
              />{" "}
              {params.value === "active"
                ? t("ItemStock.active")
                : params.value === "expired"
                  ? t("ItemStock.paused", "Paused")
                  : t("ItemStock.inactive")}
            </Typography>
          )
        },
      },
      {
        field: "expires_at",
        headerName: t("ItemStock.expiration"),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RefreshCircle aria-hidden />
            <HelpTip
              label={t("ItemStock.renewHelpLabel", "Renew")}
              title={t(
                "ItemStock.renewHelp",
                "Paused listings are hidden from buyers, for example after an auction ends with no bids. Click the renew button in this column to make a listing active again.",
              )}
            />
          </Box>
        ),
        width: 80,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          if (nr) return "—"
          return (
            <ListingRenewCell
              expiresAt={params.value}
              status={params.row.status}
              listingId={params.row.listing_id}
              canManage={canManage}
              handleRefresh={handleRefresh}
            />
          )
        },
      },
      {
        sortable: false,
        field: "listing_id",
        renderHeader: () => null,
        headerName: t("ItemStock.edit"),
        width: 90,
        display: "flex" as const,
        renderCell: (params: GridRenderCellParams) => {
          const nr = newRows.find((r) => r.id === params.id)
          const isEdit = rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (nr) {
            if (isEdit) {
              const editing = editingRows[params.id as string]
              return (
                <Stack
                  direction="row"
                  spacing={theme.layoutSpacing.compact}
                  justifyContent="flex-end"
                  sx={{ width: "100%" }}
                >
                  <Tooltip title={t("ItemStock.save")}>
                    <IconButton
                      size="small"
                      onClick={handleSaveClick(params.id)}
                      disabled={!editing?.game_item_id}
                      color="primary"
                    >
                      <SaveRounded />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("ItemStock.discard")}>
                    <IconButton
                      size="small"
                      onClick={handleCancelClick(params.id)}
                      color="error"
                    >
                      <DeleteRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            }
            return (
              <Tooltip title={t("ItemStock.edit")}>
                <IconButton
                  size="small"
                  onClick={handleEditClick(params.id)}
                  color="inherit"
                >
                  <CreateRounded />
                </IconButton>
              </Tooltip>
            )
          }

          if (!canManage) return null
          return (
            <Tooltip title={t("ItemStock.editListing")}>
              <Link
                to={MARKET_PATHS.edit(params.value)}
                state={withShopContext(shopSlug)}
                style={{ color: "inherit" }}
              >
                <IconButton aria-label={t("ItemStock.editListing")}>
                  <CreateRounded />
                </IconButton>
              </Link>
            </Tooltip>
          )
        },
      },
    ],
    [
      t,
      fmt,
      theme,
      newRows,
      rowModesModel,
      editingRows,
      handleRefresh,
      handleEditClick,
      handleCancelClick,
      handleSaveClick,
      canManage,
      shopSlug,
      setEditingRows,
    ],
  )
}
