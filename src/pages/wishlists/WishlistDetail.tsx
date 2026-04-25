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
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Avatar,
  LinearProgress,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material"
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  StarBorder,
  ArrowBack,
  Sort,
  Build,
  ShoppingCart,
} from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  type WishlistItemWithDetails,
} from "../../store/api/v2/market"
import { AddItemDialog } from "../../components/wishlists"

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
  const theme = useTheme<ExtendedTheme>()
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
    { skip: !wishlist_id }
  )

  // Mutations
  const [removeItem] = useRemoveWishlistItemMutation()
  const [updateItem] = useUpdateWishlistItemMutation()

  // Handlers
  const handleBack = () => {
    navigate("/shopping-lists")
  }

  const handleAddItem = () => {
    setAddItemDialogOpen(true)
  }

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption)
  }

  const handleItemMenuOpen = (event: React.MouseEvent<HTMLElement>, item: WishlistItemWithDetails) => {
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
        return items.sort((a, b) => a.game_item_name.localeCompare(b.game_item_name))
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
      <StandardPageLayout title={t("wishlists.detail", "Shopping List Detail")} headerTitle={t("wishlists.detail", "Shopping List Detail")}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </StandardPageLayout>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <StandardPageLayout title={t("wishlists.detail", "Shopping List Detail")} headerTitle={t("wishlists.notFound", "Shopping List Not Found")}>
        <Alert severity="error" sx={{ m: 3 }}>
          {t("wishlists.loadError", "Failed to load shopping list. It may not exist or you don't have permission to view it.")}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ ml: 3 }}>
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
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Shopping Lists", href: "/shopping-lists" },
        { label: wishlist.wishlist_name },
      ]}
      headerActions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={handleViewShoppingList}
            disabled={items.length === 0}
          >
            {t("wishlists.shoppingList", "Shopping List")}
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddItem}>
            {t("wishlists.addItem", "Add Item")}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* Description + Progress Row */}
        <Grid container spacing={2}>
          {/* Description */}
          {wishlist.wishlist_description && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {wishlist.wishlist_description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Progress */}
          <Grid item xs={12} md={wishlist.wishlist_description ? 6 : 12}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("wishlists.progress", "Progress")}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {statistics.progress_percentage}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={statistics.progress_percentage}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("wishlists.totalItems", "Total Items")}
                    </Typography>
                    <Typography variant="h6">{statistics.total_items}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("wishlists.completed", "Completed")}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {statistics.completed_items}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("wishlists.remaining", "Remaining")}
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {statistics.total_items - statistics.completed_items}
                    </Typography>
                  </Box>
                  {statistics.total_estimated_cost > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("wishlists.estimatedCost", "Estimated Cost")}
                      </Typography>
                      <Typography variant="h6">{statistics.total_estimated_cost.toLocaleString()} aUEC</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Items Header + Sort Controls */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">
            {t("wishlists.items", "Items")} ({items.length})
          </Typography>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("wishlists.sortBy", "Sort By")}</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              startAdornment={<Sort fontSize="small" sx={{ mr: 1, ml: 1 }} />}
            >
              <MenuItem value="priority">{t("wishlists.sortPriority", "Priority")}</MenuItem>
              <MenuItem value="name">{t("wishlists.sortName", "Name")}</MenuItem>
              <MenuItem value="status">{t("wishlists.sortStatus", "Status")}</MenuItem>
              <MenuItem value="quality">{t("wishlists.sortQuality", "Quality")}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Items List */}
      {sortedItems.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("wishlists.noItems", "No items in this wishlist")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t("wishlists.noItemsHint", "Add items to start tracking what you want to acquire or craft")}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddItem}>
              {t("wishlists.addFirstItem", "Add Your First Item")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sortedItems.map((item) => (
            <Card
              key={item.item_id}
              sx={{
                opacity: item.is_acquired ? 0.6 : 1,
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Item Icon */}
                  <Avatar
                    src={item.game_item_icon}
                    alt={item.game_item_name}
                    sx={{ width: 64, height: 64 }}
                    variant="rounded"
                  >
                    {item.game_item_name.charAt(0)}
                  </Avatar>

                  {/* Item Details */}
                  <Box sx={{ flex: 1 }}>
                    {/* Item Name and Status */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {item.game_item_name}
                          {item.is_acquired && (
                            <Chip
                              icon={<CheckCircle />}
                              label="Acquired"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.game_item_type}
                        </Typography>
                      </Box>

                      {/* Actions Menu */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleItemMenuOpen(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Item Properties */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
                      {/* Quantity (Requirement 53.2) */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t("wishlists.quantity", "Quantity")}
                        </Typography>
                        <Typography variant="body2">
                          {item.acquired_quantity} / {item.desired_quantity}
                        </Typography>
                      </Box>

                      {/* Quality Tier (Requirement 53.6) */}
                      {item.desired_quality_tier && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t("wishlists.qualityTier", "Quality Tier")}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {[1, 2, 3, 4, 5].map((tier) => (
                              <Box key={tier}>
                                {tier <= item.desired_quality_tier! ? (
                                  <Star fontSize="small" color="primary" />
                                ) : (
                                  <StarBorder fontSize="small" color="disabled" />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Priority (Requirement 53.5) */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t("wishlists.priority", "Priority")}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <Box
                              key={level}
                              sx={{
                                width: 8,
                                height: 16,
                                bgcolor: level <= item.priority ? "primary.main" : "action.disabled",
                                borderRadius: 0.5,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Crafting Available (Requirement 53.3) */}
                      {item.crafting_available && (
                        <Tooltip title={`Craftable from: ${item.blueprint_name}`}>
                          <Chip
                            icon={<Build />}
                            label="Craftable"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Tooltip>
                      )}

                      {/* Estimated Cost */}
                      {item.estimated_cost && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t("wishlists.estCost", "Est. Cost")}
                          </Typography>
                          <Typography variant="body2">
                            {item.estimated_cost.toLocaleString()} aUEC
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Notes (Requirement 53.7) */}
                    {item.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: "italic",
                          mt: 1,
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        {item.notes}
                      </Typography>
                    )}

                    {/* Quick Actions */}
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant={item.is_acquired ? "outlined" : "contained"}
                        startIcon={item.is_acquired ? <RadioButtonUnchecked /> : <CheckCircle />}
                        onClick={() => handleToggleAcquired(item)}
                      >
                        {item.is_acquired ? t("wishlists.markNeeded", "Mark as Needed") : t("wishlists.markAcquired", "Mark as Acquired")}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Item Actions Menu */}
      <Menu
        anchorEl={itemMenuAnchor?.element}
        open={Boolean(itemMenuAnchor)}
        onClose={handleItemMenuClose}
      >
        <MenuItem onClick={() => itemMenuAnchor && handleEditItem(itemMenuAnchor.item)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("wishlists.editItem", "Edit Item")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => itemMenuAnchor && handleRemoveItem(itemMenuAnchor.item)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t("wishlists.removeItem", "Remove Item")}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Item Dialog (Task 14.3) */}
      <AddItemDialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        wishlistId={wishlist_id!}
      />
      </Stack>
    </StandardPageLayout>
  )
}
