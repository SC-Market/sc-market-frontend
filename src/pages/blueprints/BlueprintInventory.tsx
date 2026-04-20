/**
 * BlueprintInventory Component
 * 
 * Display owned blueprints with filtering by owned status, acquisition progress display,
 * and bulk import support.
 * 
 * Task 12.5 - Create BlueprintInventory component
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 46.1-46.10
 */

import React, { useState } from "react"
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Upload, FilterList } from "@mui/icons-material"
import {
  useGetUserBlueprintInventoryQuery,
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
} from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { BlueprintCard } from "../../components/game-data/BlueprintCard"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

/**
 * BlueprintInventory Component
 * 
 * Features:
 * - Display owned blueprints in grid view (10.1, 10.2)
 * - Filter by owned status (10.4)
 * - Show acquisition progress (10.3, 46.6)
 * - Support bulk import (10.6, 46.8)
 * - Display acquisition date (10.3)
 * - Filter by category and rarity (10.4)
 * - Sort by acquisition date or name (46.9)
 * - Pagination support
 * - Authentication required (46.1, 46.2)
 */
export function BlueprintInventory() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  // Filter and sort state
  const [itemCategory, setItemCategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [sortBy, setSortBy] = useState<"acquisition_date" | "blueprint_name">("acquisition_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  // Bulk import dialog state
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkImportText, setBulkImportText] = useState("")
  const [bulkImportStatus, setBulkImportStatus] = useState<{
    processing: boolean
    success: number
    failed: number
    errors: string[]
  }>({
    processing: false,
    success: 0,
    failed: 0,
    errors: [],
  })

  // Query user's blueprint inventory (Requirement 10.1, 10.2, 46.2)
  const { data, isLoading, error } = useGetUserBlueprintInventoryQuery({
    itemCategory: itemCategory || undefined,
    rarity: rarity || undefined,
    sortBy,
    sortOrder,
    page,
    pageSize: 20,
  })

  // Mutations for adding/removing blueprints (Requirement 10.2, 10.6)
  const [addBlueprint] = useAddBlueprintToInventoryMutation()
  const [removeBlueprint] = useRemoveBlueprintFromInventoryMutation()

  const handleBlueprintClick = (blueprintId: string) => {
    navigate(`/blueprints/${blueprintId}`)
  }

  const handleBookmarkToggle = async (blueprintId: string, isOwned: boolean) => {
    try {
      if (isOwned) {
        await addBlueprint({
          blueprintId,
          body: {
            acquisition_method: "manual",
          },
        }).unwrap()
      } else {
        await removeBlueprint({ blueprintId }).unwrap()
      }
    } catch (err) {
      console.error("Failed to update blueprint inventory:", err)
    }
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleResetFilters = () => {
    setItemCategory("")
    setRarity("")
    setSortBy("acquisition_date")
    setSortOrder("desc")
    setPage(1)
  }

  const handleBulkImportOpen = () => {
    setBulkImportOpen(true)
    setBulkImportText("")
    setBulkImportStatus({
      processing: false,
      success: 0,
      failed: 0,
      errors: [],
    })
  }

  const handleBulkImportClose = () => {
    setBulkImportOpen(false)
  }

  // Bulk import handler (Requirement 10.6, 46.8)
  const handleBulkImport = async () => {
    setBulkImportStatus({
      processing: true,
      success: 0,
      failed: 0,
      errors: [],
    })

    // Parse blueprint IDs from text (one per line)
    const blueprintIds = bulkImportText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const blueprintId of blueprintIds) {
      try {
        await addBlueprint({
          blueprintId,
          body: {
            acquisition_method: "bulk_import",
          },
        }).unwrap()
        successCount++
      } catch (err) {
        failedCount++
        errors.push(`Failed to add ${blueprintId}: ${err}`)
      }
    }

    setBulkImportStatus({
      processing: false,
      success: successCount,
      failed: failedCount,
      errors,
    })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  // Loading state
  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("blueprints.inventory.title", "My Blueprint Inventory")}
        headerTitle={t("blueprints.inventory.header", "My Blueprint Inventory")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <StandardPageLayout
        title={t("blueprints.inventory.title", "My Blueprint Inventory")}
        headerTitle={t("blueprints.inventory.header", "My Blueprint Inventory")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">
            {t("blueprints.inventory.error", "Failed to load blueprint inventory. Please ensure you are logged in.")}
          </Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("blueprints.inventory.title", "My Blueprint Inventory")}
      headerTitle={t("blueprints.inventory.header", "My Blueprint Inventory")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {t("blueprints.inventory.description", "Track your owned blueprints and crafting capabilities")}
          </Typography>

          {/* Bulk Import Button (Requirement 10.6, 46.8) */}
          <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={handleBulkImportOpen}
        >
          Bulk Import
        </Button>
      </Box>

      {/* Acquisition Progress (Requirement 10.3, 46.6) */}
      {data?.statistics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Collection Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={data.statistics.completion_percentage}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                {data.statistics.completion_percentage.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {data.statistics.total_owned} of {data.statistics.total_available} blueprints owned
            </Typography>
            {data.statistics.recently_acquired_count > 0 && (
              <Chip
                label={`${data.statistics.recently_acquired_count} recently acquired`}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters (Requirement 10.4) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemCategory}
                  label="Category"
                  onChange={(e) => setItemCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Weapons">Weapons</MenuItem>
                  <MenuItem value="Armor">Armor</MenuItem>
                  <MenuItem value="Components">Components</MenuItem>
                  <MenuItem value="Consumables">Consumables</MenuItem>
                  <MenuItem value="Tools">Tools</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Rarity Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rarity</InputLabel>
                <Select
                  value={rarity}
                  label="Rarity"
                  onChange={(e) => setRarity(e.target.value)}
                >
                  <MenuItem value="">All Rarities</MenuItem>
                  <MenuItem value="Common">Common</MenuItem>
                  <MenuItem value="Uncommon">Uncommon</MenuItem>
                  <MenuItem value="Rare">Rare</MenuItem>
                  <MenuItem value="Epic">Epic</MenuItem>
                  <MenuItem value="Legendary">Legendary</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as "acquisition_date" | "blueprint_name")}
                >
                  <MenuItem value="acquisition_date">Acquisition Date</MenuItem>
                  <MenuItem value="blueprint_name">Blueprint Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort Order"
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Reset Button */}
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={handleResetFilters}
              >
                Reset all filters
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {data.blueprints.length} of {data.total} owned blueprints
          </Typography>

          {/* Grid View */}
          <Grid container spacing={2}>
            {data.blueprints.map((blueprint) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={blueprint.blueprint_id}>
                <BlueprintCard
                  blueprint={{
                    blueprint_id: blueprint.blueprint_id,
                    blueprint_name: blueprint.blueprint_name,
                    output_item_name: blueprint.output_item_name,
                    output_item_icon: blueprint.output_item_icon,
                    item_category: blueprint.item_category,
                    rarity: blueprint.rarity,
                    tier: blueprint.tier,
                    ingredient_count: 0, // Not provided in inventory response
                    mission_count: 0, // Not provided in inventory response
                    user_owns: true, // Always true in inventory view
                  }}
                  viewMode="grid"
                  onClick={handleBlueprintClick}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {data.blueprints.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No blueprints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {itemCategory || rarity
                  ? "Try adjusting your filters"
                  : "Start adding blueprints to your inventory"}
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Bulk Import Dialog (Requirement 10.6, 46.8) */}
      <Dialog
        open={bulkImportOpen}
        onClose={handleBulkImportClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Import Blueprints</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter blueprint IDs, one per line. You can paste a list of blueprint IDs to quickly
            add multiple blueprints to your inventory.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder="blueprint-id-1&#10;blueprint-id-2&#10;blueprint-id-3"
            disabled={bulkImportStatus.processing}
          />
          {bulkImportStatus.success > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully imported {bulkImportStatus.success} blueprint(s)
            </Alert>
          )}
          {bulkImportStatus.failed > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to import {bulkImportStatus.failed} blueprint(s)
              {bulkImportStatus.errors.length > 0 && (
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {bulkImportStatus.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>
                      <Typography variant="caption">{error}</Typography>
                    </li>
                  ))}
                  {bulkImportStatus.errors.length > 5 && (
                    <li>
                      <Typography variant="caption">
                        ... and {bulkImportStatus.errors.length - 5} more errors
                      </Typography>
                    </li>
                  )}
                </Box>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkImportClose} disabled={bulkImportStatus.processing}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkImport}
            variant="contained"
            disabled={bulkImportStatus.processing || !bulkImportText.trim()}
          >
            {bulkImportStatus.processing ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>
      </Grid>
    </StandardPageLayout>
  )
}
