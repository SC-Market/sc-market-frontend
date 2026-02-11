import {
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
} from "@mui/x-data-grid"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback as useCallbackAlias,
} from "react"
import { useMarketSearch } from ".."
import { formatCompleteListingUrl } from "../../../util/urls"
import { Link } from "react-router-dom"
import { MarketListingUpdateBody, UniqueListing } from "../domain/types"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useCreateMarketListingMutation,
  useGetMyListingsQuery,
  useMarketGetGameItemByNameQuery,
  useMarketRefreshListingMutation,
  useUpdateListingQuantityMutation,
  useUpdateMarketListingMutation,
} from "../api/marketApi"
import { Stack } from "@mui/system"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { NumericFormat } from "react-number-format"
import { RefreshCircle } from "mdi-material-ui"
import { formatMostSignificantDiff } from "../../../util/time"
import LoadingButton from "@mui/lab/LoadingButton"
import { ThemedDataGrid } from "../../../components/grid/ThemedDataGrid"
import { SelectGameItemStack } from "../../../components/select/SelectGameItem"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useTranslation } from "react-i18next"
import {
  PullToRefresh,
  LongPressMenu,
  useLongPress,
} from "../../../components/gestures"
import { EmptyListings } from "../../../components/empty-states"
import { BottomSheet } from "../../../components/mobile"
import {
  StockRow,
  NewListingRow,
  ItemStockContext,
  ManageStockArea,
  ItemStockToolbar,
  useStockManagement,
  MyItemStock,
  StockCard,
} from "../stock"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack1 from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ImageListItem, { imageListItemClasses } from '@mui/material/ImageListItem';
import CardActionArea from '@mui/material/CardActionArea';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import ShareRounded from '@mui/icons-material/ShareRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';

// Re-export for backward compatibility
export { ItemStockContext, ManageStockArea, MyItemStock } from "../stock"

export function DisplayStock({
  listings,
  total,
  page,
  perPage,
  onPageChange,
  onRowsPerPageChange,
  onRefresh,
}: {
  listings: UniqueListing[]
  total?: number
  page?: number
  perPage?: number
  onPageChange?: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRefresh?: () => Promise<void>
}) {
  const theme = useTheme<ExtendedTheme>()

  // Use stock management hook
  const {
    rows,
    newRows,
    setNewRows,
    rowModesModel,
    setRowModesModel,
    editingRows,
    setEditingRows,
    fetchingItemName,
    setFetchingItemName,
    gameItem,
    currentOrg,
    refresh,
    createListing,
    updateListing,
    handleUpdateQuantity,
    handleEditClick,
    handleCancelClick,
    issueAlert,
    t,
  } = useStockManagement(listings, onRefresh)

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleSaveClick = (id: GridRowId) => async () => {
    const editingRow = editingRows[id]
    if (!editingRow) return

    const newRow = newRows.find((r) => r.id === id)
    const existingRow = rows.find((r) => r.listing_id === id.toString())

    if (newRow?.isNew) {
      // Create new listing
      if (!editingRow.item_name) {
        issueAlert({
          message: t("ItemStock.selectItemError"),
          severity: "error",
        })
        return
      }

      try {
        const listingData = {
          title: editingRow.item_name,
          description: gameItem?.description || "",
          sale_type: "sale" as const,
          item_type: editingRow.item_type || "Other",
          price: editingRow.price || 1,
          quantity_available: editingRow.quantity_available || 1,
          photos: gameItem?.image_url
            ? [gameItem.image_url]
            : [
                "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp",
              ],
          minimum_bid_increment: 1000,
          internal: false,
          status: editingRow.status || "active",
          end_time: null,
          item_name: editingRow.item_name,
          spectrum_id: currentOrg?.spectrum_id,
        }

        await createListing(listingData).unwrap()

        issueAlert({
          message: t("ItemStock.created"),
          severity: "success",
        })

        // Remove the new row from the editable rows
        setNewRows((prev) => prev.filter((r) => r.id !== id))
      } catch (error) {
        issueAlert({ message: t("ItemStock.createError"), severity: "error" })
        return
      }
    } else if (existingRow) {
      // Update existing listing
      try {
        const updateBody: Partial<MarketListingUpdateBody> = {}

        // Only include fields that have changed
        if (
          editingRow.status !== undefined &&
          editingRow.status !== existingRow.status
        ) {
          updateBody.status = editingRow.status as "active" | "inactive"
        }
        if (
          editingRow.quantity_available !== undefined &&
          editingRow.quantity_available !== existingRow.quantity_available
        ) {
          updateBody.quantity_available = editingRow.quantity_available
        }
        if (
          editingRow.price !== undefined &&
          editingRow.price !== existingRow.price
        ) {
          updateBody.price = editingRow.price
        }

        // Only call mutation if there are changes
        if (Object.keys(updateBody).length > 0) {
          await updateListing({
            listing_id: existingRow.listing_id,
            body: updateBody,
          }).unwrap()

          issueAlert({
            message: t("ItemStock.updated"),
            severity: "success",
          })
        }
      } catch (error) {
        issueAlert({
          message: t("ItemStock.updateError", "Failed to update listing"),
          severity: "error",
        })
        return
      }
    } else {
      // Row not found in either newRows or rows
      issueAlert({
        message: t("ItemStock.rowNotFound", "Listing not found"),
        severity: "error",
      })
      return
    }

    // Clear editing state
    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("ItemStock.title"),
      flex: 1,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        // Check if this is a new row
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          const isInEditMode =
            rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (isInEditMode) {
            const editingRow = editingRows[params.id]
            const currentItemType =
              editingRow?.item_type ?? params.value?.item_type ?? "Other"
            const currentItemName =
              editingRow?.item_name ?? params.value?.item_name

            return (
              <SelectGameItemStack
                item_type={currentItemType}
                item_name={currentItemName}
                onTypeChange={(newType) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      item_type: newType,
                      item_name: null,
                    },
                  }))
                }}
                onItemChange={(newItem) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: { ...prev[params.id], item_name: newItem },
                  }))
                  if (newItem) {
                    setFetchingItemName(newItem)
                  }
                }}
                TextfieldProps={{ size: "small" }}
              />
            )
          } else {
            return params.value?.item_name
              ? `${params.value.item_type} / ${params.value.item_name}`
              : t("ItemStock.noItemSelected")
          }
        }

        // Original display for existing rows
        return (
          <Stack
            justifyContent={"left"}
            direction={"row"}
            spacing={theme.layoutSpacing.compact}
            alignItems={"center"}
          >
            <Avatar src={params.row.image_url} variant="rounded" />
            <MaterialLink
              component={Link}
              to={formatCompleteListingUrl({
                type: "unique",
                details: { title: params.row.title },
                listing: params.row,
              })}
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
      field: "price",
      headerName: t("ItemStock.price"),
      width: 150,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          const isInEditMode =
            rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (isInEditMode) {
            const editingRow = editingRows[params.id]
            const currentPrice = editingRow?.price ?? params.value

            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(values) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      price: values.floatValue || 1,
                    },
                  }))
                }}
                size="small"
                label={t("ItemStock.price")}
                value={currentPrice}
              />
            )
          } else {
            return `${params.value.toLocaleString(undefined)} aUEC`
          }
        }

        return `${params.value.toLocaleString(undefined)} aUEC`
      },
    },
    {
      field: "quantity_available",
      headerName: t("ItemStock.quantity"),
      width: 90,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          const isInEditMode =
            rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (isInEditMode) {
            const editingRow = editingRows[params.id]
            const currentQuantity =
              editingRow?.quantity_available ?? params.value

            return (
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={(values) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      quantity_available: values.floatValue || 1,
                    },
                  }))
                }}
                size="small"
                label={t("ItemStock.qty")}
                value={currentQuantity}
              />
            )
          } else {
            return params.value.toLocaleString(undefined)
          }
        }

        return params.value.toLocaleString(undefined)
      },
    },
    {
      field: "offer_count",
      headerName: t("ItemStock.offersAccepted"),
      width: 120,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          return "—" // New rows don't have offers
        }

        return (
          <Typography
            variant={"subtitle2"}
            color={+params.row.offer_count === 0 ? "success" : "warning"}
          >
            {(+params.row.order_count).toLocaleString(undefined)} /{" "}
            {(+params.row.order_count + +params.row.offer_count).toLocaleString(
              undefined,
            )}
          </Typography>
        )
      },
    },
    {
      field: "view_count",
      headerName: t("ItemStock.views"),
      width: 80,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          return "—" // New rows don't have views
        }

        return (
          <Typography variant={"subtitle2"} color="text.secondary">
            {params.value?.toLocaleString(undefined) || "0"}
          </Typography>
        )
      },
    },
    {
      field: "status",
      headerName: t("ItemStock.status"),
      width: 100,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          const isInEditMode =
            rowModesModel[params.id]?.mode === GridRowModes.Edit

          if (isInEditMode) {
            const editingRow = editingRows[params.id]
            const currentStatus = editingRow?.status ?? params.value

            return (
              <Switch
                checked={currentStatus === "active"}
                onChange={(e) => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      status: (e.target.checked ? "active" : "inactive") as
                        | "active"
                        | "inactive",
                    },
                  }))
                }}
              />
            )
          } else {
            return (
              <Typography
                color={params.value === "active" ? "success" : "error"}
                variant="subtitle2"
              >
                {params.value === "active"
                  ? t("ItemStock.active")
                  : t("ItemStock.inactive")}
              </Typography>
            )
          }
        }

        return (
          <Typography
            color={params.value === "active" ? "success" : "error"}
            justifyContent={"center"}
            alignContent={"center"}
            display={"flex"}
            alignItems={"center"}
            variant={"subtitle2"}
          >
            <RadioButtonCheckedRounded
              fontSize="small"
              style={{ marginRight: 1 }}
            />{" "}
            {params.value === "active"
              ? t("ItemStock.active")
              : t("ItemStock.inactive")}
          </Typography>
        )
      },
    },
    {
      field: "expiration",
      headerName: t("ItemStock.expiration"),
      renderHeader: () => <RefreshCircle />,
      width: 50,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)

        if (isNewRow) {
          return "—" // New rows don't have expiration
        }

        return (
          <div>
            {new Date(params.value) > new Date() ? (
              formatMostSignificantDiff(params.value)
            ) : (
              <Tooltip title={t("ItemStock.refreshListing")}>
                <IconButton
                  sx={{ color: "error.main" }}
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    refresh(params.row.listing_id)
                  }}
                >
                  <RefreshOutlined />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      sortable: false,
      field: "listing_id",
      renderHeader: () => null,
      headerName: t("ItemStock.edit"),
      width: 90,
      display: "flex",
      renderCell: (params: GridRenderCellParams) => {
        const isNewRow = newRows.find((row) => row.id === params.id)
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isNewRow) {
          if (isInEditMode) {
            const editingRow = editingRows[params.id]
            const hasValidItem = editingRow?.item_name

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
                    disabled={!hasValidItem}
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
          } else {
            // For new rows that have been saved, just show edit
            return (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ width: "100%" }}
              >
                <Tooltip title={t("ItemStock.edit")}>
                  <IconButton
                    size="small"
                    onClick={handleEditClick(params.id)}
                    color="inherit"
                  >
                    <CreateRounded />
                  </IconButton>
                </Tooltip>
              </Stack>
            )
          }
        }

        return (
          <Tooltip title={t("ItemStock.editListing")}>
            <Link
              to={`/market_edit/${params.value}`}
              style={{ color: "inherit" }}
            >
              <IconButton>
                <CreateRounded />
              </IconButton>
            </Link>
          </Tooltip>
        )
      },
    },
  ]

  // Combine existing rows with new rows
  const allRows = useMemo(() => {
    const existingRows = rows.map((row) => ({
      ...row,
      id: row.listing_id, // Ensure existing rows have proper ID
    }))

    const newRowsWithId = newRows.map((row) => ({
      ...row,
      id: row.id,
      title: row.item_name || t("ItemStock.noItemSelected"),
      price: row.price,
      quantity_available: row.quantity_available,
      status: row.status,
      listing_id: row.id, // Use the new row ID as listing_id for consistency
      image_url: "",
      expiration: "",
      order_count: 0,
      offer_count: 0,
    }))

    return [...existingRows, ...newRowsWithId]
  }, [rows, newRows, t])

  const context = React.useContext(ItemStockContext)
  if (!context || !Array.isArray(context)) {
    return null // Context not available
  }
  const [rowSelectionModel, setRowSelectionModel] = context

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Mobile bottom sheet state
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  // Initialize editing row when bottom sheet opens
  const handleOpenBottomSheet = (rowId?: string) => {
    if (rowId) {
      // Editing existing new row
      setEditingRowId(rowId)
      const existingRow = newRows.find((r) => r.id === rowId)
      if (existingRow) {
        setEditingRows((prev) => ({
          ...prev,
          [rowId]: { ...existingRow },
        }))
      }
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [rowId]: { mode: GridRowModes.Edit, fieldToFocus: "item_type" },
      }))
    } else {
      // Creating new row
      const id = `new-${Date.now()}`
      const newRow: NewListingRow = {
        id,
        item_type: "Other",
        item_name: null,
        price: 1,
        quantity_available: 1,
        status: "active",
        isNew: true,
      }
      setEditingRowId(id)
      setNewRows((prev) => [...prev, newRow])
      setEditingRows((prev) => ({
        ...prev,
        [id]: { ...newRow },
      }))
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "item_type" },
      }))
    }
    setBottomSheetOpen(true)
  }

  const handleCloseBottomSheet = () => {
    setBottomSheetOpen(false)
    if (editingRowId) {
      // Don't clear editing state - let user save or cancel explicitly
      setEditingRowId(null)
    }
  }

  const handleSaveFromBottomSheet = async () => {
    if (!editingRowId) return
    await handleSaveClick(editingRowId)()
    setBottomSheetOpen(false)
    setEditingRowId(null)
  }

  const handleCancelFromBottomSheet = () => {
    if (!editingRowId) return
    handleCancelClick(editingRowId)()
    setBottomSheetOpen(false)
    setEditingRowId(null)
  }

  if (isMobile) {
    const editingRow = editingRowId ? editingRows[editingRowId] : null
    const newRowData = editingRowId
      ? newRows.find((r) => r.id === editingRowId)
      : null
    const currentItemType =
      editingRow?.item_type ?? newRowData?.item_type ?? "Other"
    const currentItemName =
      editingRow?.item_name ?? newRowData?.item_name ?? null
    const currentPrice = editingRow?.price ?? newRowData?.price ?? 1
    const currentQuantity =
      editingRow?.quantity_available ?? newRowData?.quantity_available ?? 1
    const currentStatus = editingRow?.status ?? newRowData?.status ?? "active"
    const hasValidItem = !!currentItemName

    return (
      <Box sx={{ width: "100%" }}>
        <ItemStockToolbar
          listings={listings}
          setNewRows={setNewRows}
          setRowModesModel={setRowModesModel}
          newRows={newRows}
          isMobile={true}
          onAddQuickListing={() => handleOpenBottomSheet()}
        />
        <PullToRefresh
          onRefresh={async () => {
            if (onRefresh) {
              await onRefresh()
            }
          }}
        >
          <Paper
            sx={{
              borderRadius: theme.spacing(theme.borderRadius.topLevel),
            }}
          >
            {allRows.length === 0 ? (
              <EmptyListings showCreateAction={false} />
            ) : (
              <Grid container spacing={theme.layoutSpacing.layout}>
                {allRows.map((row) => {
                  const isSelected = rowSelectionModel.ids.has(row.id)
                  // Pass necessary props for editing functionality
                  return (
                    <StockCard
                      key={row.id}
                      row={row}
                      isSelected={isSelected}
                      newRows={newRows}
                      editingRows={editingRows}
                      rowModesModel={rowModesModel}
                      setEditingRows={setEditingRows}
                      setRowModesModel={setRowModesModel}
                      setFetchingItemName={setFetchingItemName}
                      handleEditClick={(id) => () =>
                        handleOpenBottomSheet(id.toString())
                      }
                      handleSaveClick={handleSaveClick}
                      handleCancelClick={handleCancelClick}
                      handleUpdateQuantity={handleUpdateQuantity}
                    />
                  )
                })}
              </Grid>
            )}
          </Paper>
        </PullToRefresh>

        {/* Bottom Sheet for Quick Create */}
        <BottomSheet
          open={bottomSheetOpen}
          onClose={handleCloseBottomSheet}
          title={t("ItemStock.newListing", "New Listing")}
          maxHeight="90vh"
        >
          <Stack spacing={2}>
            <SelectGameItemStack
              item_type={currentItemType}
              item_name={currentItemName}
              onTypeChange={(newType) => {
                if (editingRowId) {
                  setEditingRows((prev) => ({
                    ...prev,
                    [editingRowId]: {
                      ...prev[editingRowId],
                      item_type: newType,
                      item_name: null,
                    },
                  }))
                }
              }}
              onItemChange={(newItem) => {
                if (editingRowId) {
                  setEditingRows((prev) => ({
                    ...prev,
                    [editingRowId]: {
                      ...prev[editingRowId],
                      item_name: newItem,
                    },
                  }))
                  if (newItem) {
                    setFetchingItemName(newItem)
                  }
                }
              }}
              TextfieldProps={{ size: "small", fullWidth: true }}
            />

            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={(values) => {
                if (editingRowId) {
                  setEditingRows((prev) => ({
                    ...prev,
                    [editingRowId]: {
                      ...prev[editingRowId],
                      price: values.floatValue || 1,
                    },
                  }))
                }
              }}
              size="small"
              label={t("ItemStock.price")}
              value={currentPrice}
              fullWidth
            />

            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={(values) => {
                if (editingRowId) {
                  setEditingRows((prev) => ({
                    ...prev,
                    [editingRowId]: {
                      ...prev[editingRowId],
                      quantity_available: values.floatValue || 1,
                    },
                  }))
                }
              }}
              size="small"
              label={t("ItemStock.qty")}
              value={currentQuantity}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={currentStatus === "active"}
                  onChange={(e) => {
                    if (editingRowId) {
                      setEditingRows((prev) => ({
                        ...prev,
                        [editingRowId]: {
                          ...prev[editingRowId],
                          status: (e.target.checked ? "active" : "inactive") as
                            | "active"
                            | "inactive",
                        },
                      }))
                    }
                  }}
                />
              }
              label={
                currentStatus === "active"
                  ? t("ItemStock.active")
                  : t("ItemStock.inactive")
              }
            />

            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                pt: 2,
                mt: 1,
              }}
            >
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteRounded />}
                  onClick={handleCancelFromBottomSheet}
                  fullWidth
                >
                  {t("ItemStock.discard")}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveRounded />}
                  onClick={handleSaveFromBottomSheet}
                  disabled={!hasValidItem}
                  fullWidth
                >
                  {t("ItemStock.save")}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </BottomSheet>
        {/* Mobile pagination */}
        <TablePagination
          component="div"
          count={total || allRows.length}
          page={page || 0}
          onPageChange={(event, newPage) => {
            onPageChange?.(null, newPage)
          }}
          rowsPerPage={perPage || 48}
          onRowsPerPageChange={(event) => {
            if (onRowsPerPageChange) {
              const value = (event.target as HTMLInputElement).value
              onRowsPerPageChange({
                target: { value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          }}
          rowsPerPageOptions={[24, 48, 96, 192]}
          labelRowsPerPage={t("common.rowsPerPage", "Rows per page")}
          labelDisplayedRows={({ from, to, count }) =>
            count !== -1
              ? t("displayed_rows_range", { from, to, count })
              : t("displayed_rows_range_more", { from, to })
          }
          color="primary"
        />
      </Box>
    )
  }

  return (
    <Box sx={{ width: "100%" }}>
      <ThemedDataGrid
        rows={allRows}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        checkboxSelection
        onRowSelectionModelChange={setRowSelectionModel}
        rowSelectionModel={rowSelectionModel}
        onRowEditStop={handleRowEditStop}
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        initialState={{
          sorting: {
            sortModel: [{ field: "title", sort: "asc" }],
          },
        }}
        slots={{
          toolbar: () => (
            <ItemStockToolbar
              listings={listings}
              setNewRows={setNewRows}
              setRowModesModel={setRowModesModel}
              newRows={newRows}
              isMobile={false}
            />
          ),
        }}
        showToolbar
        paginationMode={total ? "server" : "client"}
        rowCount={total || allRows.length}
        paginationModel={{ page: page || 0, pageSize: perPage || 48 }}
        onPaginationModelChange={(model) => {
          if (onPageChange) onPageChange(null, model.page)
          if (onRowsPerPageChange && model.pageSize !== perPage) {
            onRowsPerPageChange({
              target: { value: model.pageSize.toString() },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        }}
        pageSizeOptions={[24, 48, 96, 192]}
      />
    </Box>
  )
}
