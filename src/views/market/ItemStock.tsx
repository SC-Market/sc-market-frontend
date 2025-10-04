import {
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowSelectionModel,
  Toolbar,
} from "@mui/x-data-grid"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Link as MaterialLink,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AddRounded,
  CreateRounded,
  DeleteRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
  RefreshOutlined,
  RemoveRounded,
  SaveRounded,
} from "@mui/icons-material"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { formatCompleteListingUrl } from "../../util/urls"
import { Link } from "react-router-dom"
import {
  MarketListingUpdateBody,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useCreateMarketListingMutation,
  useGetMyListingsQuery,
  useMarketGetGameItemByNameQuery,
  useMarketRefreshListingMutation,
  useUpdateListingQuantityMutation,
  useUpdateMarketListingMutation,
} from "../../store/market"
import { Stack } from "@mui/system"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { NumericFormat } from "react-number-format"
import { RefreshCircle } from "mdi-material-ui"
import { formatMostSignificantDiff } from "../../util/time"
import LoadingButton from "@mui/lab/LoadingButton"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { SelectGameItemStack } from "../../components/select/SelectGameItem"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"

export const ItemStockContext = React.createContext<
  | [
      GridRowSelectionModel,
      React.Dispatch<React.SetStateAction<GridRowSelectionModel>>,
    ]
  | null
>(null)

export function ManageStockArea(props: { listings: UniqueListing[] }) {
  const [selectionModel] = useContext(ItemStockContext)!
  const [quantity, setQuantity] = useState(1)
  const { listings } = props

  const [updateListing] = useUpdateListingQuantityMutation()

  const issueAlert = useAlertHook()
  const { t } = useTranslation()

  const updateListingCallback = useCallback(
    async (listing_id: string, body: { quantity_available: number }) => {
      updateListing({
        listing_id: listing_id,
        quantity: body.quantity_available,
      })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("ItemStock.updated"),
            severity: "success",
          }),
        )
        .catch((err) => issueAlert(err))
    },
    [selectionModel, issueAlert, updateListing, t],
  )

  return (
    <>
      <NumericFormat
        decimalScale={0}
        allowNegative={false}
        customInput={TextField}
        thousandSeparator
        onValueChange={async (values) => {
          setQuantity(values.floatValue || 0)
        }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          type: "numeric",
          size: "small",
        }}
        sx={{
          minWidth: 200,
        }}
        size="small"
        label={t("ItemStock.updateAmount")}
        value={quantity}
        color={"secondary"}
      />

      <ButtonGroup size={"small"}>
        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) => {
              const listing = listings.find(
                (l) => l.listing.listing_id === listing_id,
              )
              if (listing) {
                updateListingCallback(listing_id.toString(), {
                  quantity_available:
                    listing.listing.quantity_available + quantity,
                })
              }
            })
          }
          color={"success"}
          startIcon={<AddRounded />}
        >
          {t("ItemStock.add")}
        </Button>

        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) =>
              updateListingCallback(listing_id.toString(), {
                quantity_available: 0,
              }),
            )
          }
          color={"warning"}
        >
          {t("ItemStock.zero")}
        </Button>
        <Button
          variant={"contained"}
          onClick={() =>
            [...selectionModel.ids].map((listing_id) => {
              const listing = listings.find(
                (l) => l.listing.listing_id === listing_id,
              )
              if (listing) {
                updateListingCallback(listing_id.toString(), {
                  quantity_available:
                    listing.listing.quantity_available - quantity,
                })
              }
            })
          }
          color={"error"}
          startIcon={<RemoveRounded />}
        >
          {t("ItemStock.sub")}
        </Button>
      </ButtonGroup>
    </>
  )
}

export interface StockRow {
  title: string
  quantity_available: number
  listing_id: string
  price: number
  status: string
  image_url: string
  expiration: string
  order_count: number
  offer_count: number
}

export interface NewListingRow {
  id: string
  item_type: string
  item_name: string | null
  price: number
  quantity_available: number
  status: "active" | "inactive"
  isNew: boolean
}

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setNewRows: (newRows: (oldRows: NewListingRow[]) => NewListingRow[]) => void
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void
    newRows: NewListingRow[]
  }
}

function ItemStockToolbar(props: {
  listings: UniqueListing[]
  setNewRows: (newRows: (oldRows: NewListingRow[]) => NewListingRow[]) => void
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  newRows: NewListingRow[]
}) {
  const [selectionModel] = useContext(ItemStockContext)!
  const { t } = useTranslation()

  const [updateListing, { isLoading }] = useUpdateMarketListingMutation()
  const updateListingCallback = useCallback(
    async (body: MarketListingUpdateBody) => {
      selectionModel.ids.forEach((row_id) => {
        updateListing({
          listing_id: row_id.toString(),
          body,
        })
      })
    },
    [selectionModel, updateListing],
  )

  return (
    <Toolbar>
      <ManageStockArea listings={props.listings} />
      <LoadingButton
        color={"success"}
        startIcon={<RadioButtonCheckedRounded />}
        variant={"outlined"}
        size={"small"}
        loading={isLoading}
        onClick={() => {
          updateListingCallback({ status: "active" })
        }}
      >
        {t("ItemStock.activate")}
      </LoadingButton>
      <LoadingButton
        color={"error"}
        startIcon={<RadioButtonUncheckedRounded />}
        variant={"outlined"}
        size={"small"}
        loading={isLoading}
        onClick={() => {
          updateListingCallback({ status: "inactive" })
        }}
      >
        {t("ItemStock.deactivate")}
      </LoadingButton>
      <Tooltip title={t("ItemStock.addQuickListing")}>
        <IconButton
          onClick={() => {
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

            props.setNewRows((prev) => [...prev, newRow])
            props.setRowModesModel((oldModel) => ({
              ...oldModel,
              [id]: { mode: GridRowModes.Edit, fieldToFocus: "item_type" },
            }))
          }}
          color="primary"
        >
          <AddRounded />
        </IconButton>
      </Tooltip>
    </Toolbar>
  )
}

export function DisplayStock({
  listings,
  total,
  page,
  perPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  listings: UniqueListing[]
  total?: number
  page?: number
  perPage?: number
  onPageChange?: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [refresh] = useMarketRefreshListingMutation()
  const { t } = useTranslation()

  // State for new listing rows
  const [newRows, setNewRows] = React.useState<NewListingRow[]>([])
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  )
  const [editingRows, setEditingRows] = React.useState<
    Record<string, Partial<NewListingRow>>
  >({})

  const rows: StockRow[] = useMemo(
    () =>
      listings.map((listing) => ({
        ...listing.details,
        ...listing.listing,
        ...(listing.stats || {
          offer_count: 0,
          order_count: 0,
          view_count: 0,
        }),
        // Access view_count from both locations for backward compatibility
        view_count: listing.stats?.view_count || 0,
        image_url: listing.photos[0],
      })),
    [listings],
  )

  const [createListing] = useCreateMarketListingMutation()
  const issueAlert = useAlertHook()

  // Fetch item details when a listing is selected
  const [fetchingItemName, setFetchingItemName] = React.useState<string>("")
  const { data: gameItem } = useMarketGetGameItemByNameQuery(fetchingItemName, {
    skip: !fetchingItemName,
  })

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => () => {
    const currentRow = newRows.find((row) => row.id === id)
    if (currentRow) {
      setEditingRows((prev) => ({
        ...prev,
        [id]: { ...currentRow },
      }))
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const [currentOrg] = useCurrentOrg()

  const handleSaveClick = (id: GridRowId) => async () => {
    const editingRow = editingRows[id]
    if (!editingRow) return

    const row = newRows.find((r) => r.id === id)
    if (!row) return

    if (row.isNew) {
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
    }

    // Clear editing state
    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    })

    const editedRow = newRows.find((row) => row.id === id)
    if (editedRow?.isNew) {
      setNewRows((prev) => prev.filter((row) => row.id !== id))
    }

    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
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
            spacing={1}
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
                spacing={1}
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

  const [rowSelectionModel, setRowSelectionModel] =
    React.useContext(ItemStockContext)!

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
        slots={{
          toolbar: () => (
            <ItemStockToolbar
              listings={listings}
              setNewRows={setNewRows}
              setRowModesModel={setRowModesModel}
              newRows={newRows}
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

export function MyItemStock() {
  const [currentOrg] = useCurrentOrg()
  const { data: profile, isLoading: profileLoading } = useGetUserProfileQuery()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const [searchState] = useMarketSearch()

  // Determine if we should search by contractor or user
  const hasOrg = currentOrg && currentOrg.spectrum_id

  // Build search query parameters
  const searchQueryParams = useMemo(() => {
    return {
      page_size: perPage,
      index: page * perPage, // Convert page to index
      quantityAvailable: searchState.quantityAvailable ?? 1,
      query: searchState.query || "",
      sort: searchState.sort || "activity",
      statuses: searchState.statuses || undefined,
      minCost: searchState.minCost || undefined,
      maxCost: searchState.maxCost || undefined,
      item_type: searchState.item_type || undefined,
      sale_type: searchState.sale_type || undefined,
    }
  }, [perPage, page, searchState])

  // Use unified endpoint with contractor_id parameter when needed
  const finalParams = hasOrg
    ? { ...searchQueryParams, contractor_id: currentOrg?.spectrum_id }
    : searchQueryParams

  const { data: searchResults, isLoading } = useGetMyListingsQuery(finalParams)

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const listings = searchResults?.listings || []

  return (
    <>
      <DisplayStock
        listings={listings}
        total={searchResults?.total}
        page={page}
        perPage={perPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )
}
