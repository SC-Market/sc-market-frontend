/**
 * Blueprint Browser Component
 * 
 * Search and filter blueprints with comprehensive features:
 * - Text search with debouncing
 * - Category, rarity, tier filters
 * - Grid/list view toggle
 * - Pagination
 * - Integration with useSearchBlueprintsQuery RTK Query hook
 * 
 * Task 12.1 - Create BlueprintBrowser component
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 43.10
 */

import React, { useState } from "react"
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material"
import { ViewModule, ViewList } from "@mui/icons-material"
import { useSearchBlueprintsQuery, useGetBlueprintCategoriesQuery } from "../../store/blueprintsApi"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { BlueprintCard } from "../../components/game-data/BlueprintCard"

type ViewMode = "grid" | "list"

/**
 * BlueprintBrowser Component
 * 
 * Features:
 * - Text search with partial matching (19.1, 43.10)
 * - Category filter with hierarchical support (19.2, 19.3)
 * - Rarity filter (19.1)
 * - Tier filter (19.1)
 * - Grid/list view toggle (43.10)
 * - Pagination (19.6)
 * - RTK Query integration (Task requirement)
 * - Debounced search for performance
 * - Responsive grid layout
 * - Material-UI components for consistency
 */
export function BlueprintBrowser() {
  const navigate = useNavigate()
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  
  // Search and filter state
  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [tier, setTier] = useState<number | "">("")
  const [page, setPage] = useState(1)

  // Debounce search text for performance (Requirement 19.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Query blueprints with filters
  const { data, isLoading, error } = useSearchBlueprintsQuery({
    text: debouncedSearch || undefined,
    item_category: category || undefined,
    item_subcategory: subcategory || undefined,
    rarity: rarity || undefined,
    tier: tier || undefined,
    page,
    page_size: 20,
  })

  // Query categories for filter options
  const { data: categories } = useGetBlueprintCategoriesQuery({})

  const handleBlueprintClick = (blueprintId: string) => {
    navigate(`/blueprints/${blueprintId}`)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleResetFilters = () => {
    setSearchText("")
    setCategory("")
    setSubcategory("")
    setRarity("")
    setTier("")
    setPage(1)
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  // Get unique categories and subcategories
  const uniqueCategories = Array.from(
    new Set(categories?.map((c) => c.category) || [])
  ).sort()

  const subcategoriesForCategory = categories
    ?.filter((c) => c.category === category && c.subcategory)
    .map((c) => c.subcategory!)
    .sort() || []

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Blueprint Browser
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search and filter blueprints to find crafting recipes
          </Typography>
        </Box>

        {/* View Mode Toggle (Requirement 43.10) */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters (Requirements 19.1-19.5) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Search Text (Requirement 19.1) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search blueprints"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by blueprint or item name..."
                helperText="Partial name matching supported"
              />
            </Grid>

            {/* Category Filter (Requirement 19.2, 19.3) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory("") // Reset subcategory when category changes
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {uniqueCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subcategory Filter (Requirement 19.2, 19.3) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!category || subcategoriesForCategory.length === 0}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={subcategory}
                  label="Subcategory"
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <MenuItem value="">All Subcategories</MenuItem>
                  {subcategoriesForCategory.map((subcat) => (
                    <MenuItem key={subcat} value={subcat}>
                      {subcat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Rarity Filter (Requirement 19.1) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
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

            {/* Tier Filter (Requirement 19.1) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={tier}
                  label="Tier"
                  onChange={(e) => setTier(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <MenuItem value="">All Tiers</MenuItem>
                  <MenuItem value={1}>Tier 1</MenuItem>
                  <MenuItem value={2}>Tier 2</MenuItem>
                  <MenuItem value={3}>Tier 3</MenuItem>
                  <MenuItem value={4}>Tier 4</MenuItem>
                  <MenuItem value={5}>Tier 5</MenuItem>
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

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load blueprints. Please try again.
        </Alert>
      )}

      {/* Results */}
      {data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {data.total} blueprints
          </Typography>

          {/* Grid View (Requirement 43.10) */}
          {viewMode === "grid" && (
            <Grid container spacing={2}>
              {data.blueprints.map((blueprint) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={blueprint.blueprint_id}>
                  <BlueprintCard
                    blueprint={blueprint}
                    viewMode="grid"
                    onClick={handleBlueprintClick}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* List View (Requirement 43.10) */}
          {viewMode === "list" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.blueprints.map((blueprint) => (
                <BlueprintCard
                  key={blueprint.blueprint_id}
                  blueprint={blueprint}
                  viewMode="list"
                  onClick={handleBlueprintClick}
                />
              ))}
            </Box>
          )}

          {/* Pagination (Requirement 19.6) */}
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
    </Box>
  )
}
