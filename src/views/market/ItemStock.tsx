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
  CancelRounded,
  CreateRounded,
  RadioButtonCheckedRounded,
  RadioButtonUncheckedRounded,
  RefreshOutlined,
  RemoveRounded,
  SaveRounded,
  DeleteRounded,
} from "@mui/icons-material"
import { useMarketSearch } from "../../hooks/market/MarketSearch"
import { filterListings } from "./ItemListings"
import { formatMarketUrl } from "../../util/urls"
import { Link } from "react-router-dom"
import {
  MarketListingUpdateBody,
  UniqueListing,
} from "../../datatypes/MarketListing"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useMarketCreateListingMutation,
  useMarketGetGameItemByNameQuery,
  useMarketGetMyListingsQuery,
  useMarketRefreshListingMutation,
  useMarketUpdateListingMutation,
  useMarketUpdateListingQuantityMutation,
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

export const ItemStockContext = React.createContext<
  | [UniqueListing[], React.Dispatch<React.SetStateAction<UniqueListing[]>>]
  | null
>(null)

export function ManageStockArea(props: { listings: UniqueListing[] }) {
  const [quantity, setQuantity] = useState(1)
  const { listings } = props

  const [updateListing] = useMarketUpdateListingQuantityMutation()

  const issueAlert = useAlertHook()

  const updateListingCallback = useCallback(
    async (listing: UniqueListing, body: { quantity_available: number }) => {
      updateListing({
        listing_id: listing.listing.listing_id,
        body,
      })
        .unwrap()
        .then(() =>
          issueAlert({
            message: "Updated!",
            severity: "success",
          }),
        )
        .catch((err) => issueAlert(err))
    },
    [listings, issueAlert, updateListing],
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
        label={"Update Amount"}
        value={quantity}
        color={"secondary"}
      />

      <ButtonGroup size={"small"}>
        <Button
          variant={"contained"}
          onClick={() =>
            listings.map((listing) =>
              updateListingCallback(listing, {
                quantity_available:
                  listing.listing.quantity_available + quantity,
              }),
            )
          }
          color={"success"}
          startIcon={<AddRounded />}
        >
          Add
        </Button>

        <Button
          variant={"contained"}
          onClick={() =>
            listings.map((listing) =>
              updateListingCallback(listing, { quantity_available: 0 }),
            )
          }
          color={"warning"}
        >
          0
        </Button>
        <Button
          variant={"contained"}
          onClick={() =>
            listings.map((listing) =>
              updateListingCallback(listing, {
                quantity_available:
                  listing.listing.quantity_available - quantity,
              }),
            )
          }
          color={"error"}
          startIcon={<RemoveRounded />}
        >
          Sub
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
  setNewRows: (newRows: (oldRows: NewListingRow[]) => NewListingRow[]) => void
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  newRows: NewListingRow[]
}) {
  const [selectedListings] = useContext(ItemStockContext)!
  const { data: profile } = useGetUserProfileQuery()

  const [updateListing, { isLoading }] = useMarketUpdateListingMutation()
  const updateListingCallback = useCallback(
    async (body: MarketListingUpdateBody) => {
      selectedListings.forEach((listing) => {
        updateListing({
          listing_id: listing.listing.listing_id,
          body,
        })
      })
    },
    [selectedListings, updateListing],
  )

  return (
    <Toolbar>
      <ManageStockArea listings={selectedListings} />
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
        Activate
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
        Deactivate
      </LoadingButton>
      <Tooltip title="Add Quick Listing">
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

export function DisplayStock({ listings }: { listings: UniqueListing[] }) {
  const [searchState] = useMarketSearch()
  const [, setSelectedListings] = useContext(ItemStockContext)!
  const [refresh] = useMarketRefreshListingMutation()
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  // State for new listing rows
  const [newRows, setNewRows] = React.useState<NewListingRow[]>([])
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  )
  const [editingRows, setEditingRows] = React.useState<
    Record<string, Partial<NewListingRow>>
  >({})

  const filteredListings = useMemo(
    () => filterListings(listings, searchState),
    [listings, searchState],
  )

  const rows: StockRow[] = useMemo(
    () =>
      filteredListings.map((listing) => ({
        ...listing.details,
        ...listing.listing,
        ...(listing.stats || {
          offer_count: 0,
          order_count: 0,
          view_count: 0,
        }),
        image_url: listing.photos[0],
      })),
    [filteredListings],
  )

  const [createListing] = useMarketCreateListingMutation()
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

  const handleSaveClick = (id: GridRowId) => async () => {
    const editingRow = editingRows[id]
    if (!editingRow) return

    const row = newRows.find((r) => r.id === id)
    if (!row) return

    if (row.isNew) {
      // Create new listing
      if (!editingRow.item_name) {
        issueAlert({ message: "Please select an item", severity: "error" })
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
        }

        await createListing({
          body: listingData,
          spectrum_id: currentOrg?.spectrum_id,
        }).unwrap()

        issueAlert({
          message: "Listing created successfully!",
          severity: "success",
        })

        // Remove the new row from the editable rows
        setNewRows((prev) => prev.filter((r) => r.id !== id))
      } catch (error) {
        issueAlert({ message: "Failed to create listing", severity: "error" })
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
      headerName: "Title",
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
              : "No item selected"
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
              to={formatMarketUrl({
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
      headerName: "Price",
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
                label="Price"
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
      headerName: "Quantity",
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
                label="Qty"
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
      headerName: "Offers Accepted",
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
      field: "status",
      headerName: "Status",
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
                {params.value === "active" ? "Active" : "Inactive"}
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
            {params.value === "active" ? "Active" : "Inactive"}
          </Typography>
        )
      },
    },
    {
      field: "expiration",
      headerName: "Expiration",
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
              <Tooltip title={"Refresh listing"}>
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
      headerName: "Edit",
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
                <Tooltip title="Save">
                  <IconButton
                    size="small"
                    onClick={handleSaveClick(params.id)}
                    disabled={!hasValidItem}
                    color="primary"
                  >
                    <SaveRounded />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Discard">
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
                <Tooltip title="Edit">
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
          <Tooltip title={"Edit Listing"}>
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

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() })

  useEffect(() => {
    setSelectedListings(
      [...rowSelectionModel.ids]
        .map(
          (id) =>
            listings.find((listing) => listing.listing.listing_id === id)!,
        )
        .filter((x) => x), // filter not null
    )
  }, [rowSelectionModel, listings])

  // Combine existing rows with new rows
  const allRows = useMemo(() => {
    const existingRows = rows.map((row) => ({
      ...row,
      id: row.listing_id, // Ensure existing rows have proper ID
    }))

    const newRowsWithId = newRows.map((row) => ({
      ...row,
      id: row.id,
      title: row.item_name || "No item selected",
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
  }, [rows, newRows])

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
              setNewRows={setNewRows}
              setRowModesModel={setRowModesModel}
              newRows={newRows}
            />
          ),
        }}
        showToolbar
      />
    </Box>
  )
}

export function MyItemStock() {
  const [currentOrg] = useCurrentOrg()
  const { data: listings } = useMarketGetMyListingsQuery(
    currentOrg?.spectrum_id,
  )
  const filteredListings = useMemo(
    () =>
      (listings || []).filter(
        (l) => l.type !== "multiple" && l.listing.status !== "archived",
      ) as UniqueListing[],
    [listings],
  )

  return <DisplayStock listings={filteredListings} />
}
