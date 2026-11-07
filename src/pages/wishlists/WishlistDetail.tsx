/**
 * WishlistDetail Component
 *
 * Display wishlist items with quantities, quality tiers, acquisition status,
 * and support item priority sorting.
 *
 * Task 14.2 - Create WishlistDetail component
 * Requirements: 8.1, 8.2, 8.3, 53.1-53.10
 */

import React, { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material"
import {
  AddRounded,
  EditRounded,
  DeleteRounded,
  SortRounded,
} from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  type WishlistItemWithDetails,
} from "../../store/api/v2/market"
import { AddItemDialog } from "../../components/wishlists"
import { PATHS } from "../../routes/paths"
import { WishlistItemCard } from "./WishlistItemCard"
import { WishlistProgressCard } from "./WishlistProgressCard"
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded"

type SortOption = "priority" | "name" | "status" | "quality"

/**
 * WishlistDetail Component
 *
 * Features:
 * - Display wishlist items with details (53.1, 53.2)
 * - Show item name, icon, quantity, quality tier (53.2)
 * - Show crafting availability (53.3)
 * - Display progress statistics (53.4)
 * - Support priority sorting (53.5, 53.9)
 * - Show quality tier specification (53.6)
 * - Display notes (53.7)
 * - Update acquisition status (53.8)
 * - Actions: add, edit, remove, mark acquired
 */
export function WishlistDetail() {
  const { t } = useTranslation()
  const { wishlist_id } = useParams<{ wishlist_id: string }>()
  const navigate = useNavigate()

  // State
  const [sortBy, setSortBy] = useState<SortOption>("priority")
  const [itemMenuAnchor, setItemMenuAnchor] = useState<{
    element: HTMLElement
    item: WishlistItemWithDetails
  } | null>(null)
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)

  // Query wishlist detail (Requirements 53.1, 53.2, 53.3, 53.4)
  const { data, isLoading, error } = useGetWishlistQuery(
    { wishlistId: wishlist_id! },
    { skip: !wishlist_id },
  )

  // Mutations
  const [removeItem] = useRemoveWishlistItemMutation()
  const [updateItem] = useUpdateWishlistItemMutation()

  // Handlers
  const handleBack = () => {
    navigate(PATHS.shoppingLists)
  }

  const handleAddItem = () => {
    setAddItemDialogOpen(true)
  }

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption)
  }

  const handleItemMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: WishlistItemWithDetails,
  ) => {
    setItemMenuAnchor({ element: event.currentTarget, item })
  }

  const handleItemMenuClose = () => {
    setItemMenuAnchor(null)
  }

  const handleToggleAcquired = async (item: WishlistItemWithDetails) => {
    if (!wishlist_id) return

    try {
      await updateItem({
        wishlistId: wishlist_id,
        itemId: item.item_id,
        updateWishlistItemRequest: {
          is_acquired: !item.is_acquired,
          acquired_quantity: !item.is_acquired ? item.desired_quantity : 0,
        },
      }).unwrap()
    } catch (err) {
      console.error("Failed to update item status:", err)
    }
  }

  const handleEditItem = (item: WishlistItemWithDetails) => {
    handleItemMenuClose()
    // TODO: Open edit dialog with pre-filled data (future enhancement)
    console.log("Edit item:", item)
  }

  const handleRemoveItem = async (item: WishlistItemWithDetails) => {
    if (!wishlist_id) return

    handleItemMenuClose()

    try {
      await removeItem({
        wishlistId: wishlist_id,
        itemId: item.item_id,
      }).unwrap()
    } catch (err) {
      console.error("Failed to remove item:", err)
    }
  }

  const handleViewShoppingList = () => {
    navigate(`/shopping-lists/${wishlist_id}/shopping-list`)
  }

  // Sort items (Requirement 53.9)
  const sortedItems = useMemo(() => {
    if (!data?.items) return []

    const items = [...data.items]

    switch (sortBy) {
      case "priority":
        return items.sort((a, b) => b.priority - a.priority)
      case "name":
        return items.sort((a, b) =>
          a.game_item_name.localeCompare(b.game_item_name),
        )
      case "status":
        return items.sort((a, b) => {
          if (a.is_acquired === b.is_acquired) return 0
          return a.is_acquired ? 1 : -1
        })
      case "quality":
        return items.sort((a, b) => {
          const aQuality = a.desired_quality_tier || 0
          const bQuality = b.desired_quality_tier || 0
          return bQuality - aQuality
        })
      default:
        return items
    }
  }, [data?.items, sortBy])

  // Loading state
  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wishlists.detail", "Shopping List Detail")}
        headerTitle={t("wishlists.detail", "Shopping List Detail")}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </StandardPageLayout>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <StandardPageLayout
        title={t("wishlists.detail", "Shopping List Detail")}
        headerTitle={t("wishlists.notFound", "Shopping List Not Found")}
      >
        <Alert severity="error" sx={{ m: 3 }}>
          {t(
            "wishlists.loadError",
            "Failed to load shopping list. It may not exist or you don't have permission to view it.",
          )}
        </Alert>
        <Button
          startIcon={<ChevronLeftRounded />}
          onClick={handleBack}
          sx={{ ml: 3 }}
        >
          {t("wishlists.backToList", "Back to Shopping Lists")}
        </Button>
      </StandardPageLayout>
    )
  }

  const { wishlist, items, statistics } = data

  return (
    <StandardPageLayout
      title={wishlist.wishlist_name}
      headerTitle={wishlist.wishlist_name}
      maxWidth="xl"
      breadcrumbs={[
        { label: t("wishlistsUi.detail.breadcrumbHome"), href: PATHS.home },
        {
          label: t("sidebar.gameData.shoppingLists"),
          href: PATHS.shoppingLists,
        },
        { label: wishlist.wishlist_name },
      ]}
      headerActions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={handleViewShoppingList}
            disabled={items.length === 0}
          >
            {t("wishlists.shoppingList", "Shopping List")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleAddItem}
          >
            {t("wishlists.addItem", "Add Item")}
          </Button>
        </Stack>
      }
    >
      {/* Description + Progress */}
      {wishlist.wishlist_description && (
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t("wishlistsUi.detail.description")}
              </Typography>
              <Typography variant="body1">
                {wishlist.wishlist_description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}

      <WishlistProgressCard
        statistics={statistics}
        fullWidth={!wishlist.wishlist_description}
      />

      {/* Items Header + Sort Controls */}
      <Grid item xs={12}>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {t("wishlists.items", "Items")} ({items.length})
            </Typography>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="wishlist-detail-sort-by-label">
                {t("wishlists.sortBy", "Sort By")}
              </InputLabel>
              <Select
                labelId="wishlist-detail-sort-by-label"
                value={sortBy}
                label={t("wishlists.sortBy", "Sort By")}
                onChange={handleSortChange}
                startAdornment={
                  <SortRounded fontSize="small" sx={{ mr: 1, ml: 1 }} />
                }
              >
                <MenuItem value="priority">
                  {t("wishlists.sortPriority", "Priority")}
                </MenuItem>
                <MenuItem value="name">
                  {t("wishlists.sortName", "Name")}
                </MenuItem>
                <MenuItem value="status">
                  {t("wishlists.sortStatus", "Status")}
                </MenuItem>
                <MenuItem value="quality">
                  {t("wishlists.sortQuality", "Quality")}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Items List */}
          {sortedItems.length === 0 ? (
            <Card sx={{ textAlign: "center", py: 8 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t("wishlists.noItems", "No items in this shopping list")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {t(
                    "wishlists.noItemsHint",
                    "Add items to start tracking what you want to acquire or craft",
                  )}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={handleAddItem}
                >
                  {t("wishlists.addFirstItem", "Add Your First Item")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortedItems.map((item) => (
                <WishlistItemCard
                  key={item.item_id}
                  item={item}
                  onMenuOpen={handleItemMenuOpen}
                  onToggleAcquired={handleToggleAcquired}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Item Actions Menu */}
        <Menu
          anchorEl={itemMenuAnchor?.element}
          open={Boolean(itemMenuAnchor)}
          onClose={handleItemMenuClose}
        >
          <MenuItem
            onClick={() =>
              itemMenuAnchor && handleEditItem(itemMenuAnchor.item)
            }
          >
            <ListItemIcon>
              <EditRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("wishlists.editItem", "Edit Item")}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() =>
              itemMenuAnchor && handleRemoveItem(itemMenuAnchor.item)
            }
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteRounded fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              {t("wishlists.removeItem", "Remove Item")}
            </ListItemText>
          </MenuItem>
        </Menu>

        {/* Add Item Dialog (Task 14.3) */}
        <AddItemDialog
          open={addItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          wishlistId={wishlist_id!}
        />
      </Grid>
    </StandardPageLayout>
  )
}
