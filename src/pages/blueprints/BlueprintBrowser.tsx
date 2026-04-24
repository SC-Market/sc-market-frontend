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

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
  Button,
  Tooltip,
  useMediaQuery,
} from "@mui/material"
import { ViewModule, ViewList, RestartAltRounded, FilterList } from "@mui/icons-material"
import { useSearchBlueprintsQuery, useGetBlueprintCategoriesQuery, useAddBlueprintToInventoryMutation, useRemoveBlueprintFromInventoryMutation } from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { BlueprintCard } from "../../components/game-data/BlueprintCard"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getCommodityColor } from "../../util/gameIcons"
import { useTranslation } from "react-i18next"
import { formatCraftingTime } from "../../constants/crafting"
import { useTheme } from "@mui/material/styles"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"

const microChip = { height: 18, fontSize: "0.65rem", fontWeight: "bold", textTransform: "uppercase" as const }
import { useShoppingList } from "../../hooks/wishlist/WishlistContext"

type ViewMode = "grid" | "list"

export function BlueprintBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(() => (localStorage.getItem("bp-view") as ViewMode) || "grid")
  
  // Search and filter state — persisted to URL params
  const [searchParams, setSearchParams] = useSearchParams()

  const searchText = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const subcategory = searchParams.get("subcategory") || ""
  const rarity = searchParams.get("rarity") || ""
  const tier: number | "" = searchParams.get("tier") ? Number(searchParams.get("tier")) : ""
  const craftingStation = searchParams.get("station") || ""
  const ownedOnly = searchParams.get("owned") === "true"
  const hasMissionSource = searchParams.get("missions") === "true"

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

  const setSearchText = (v: string) => updateParam("q", v)
  const setCategory = (v: string) => { updateParam("category", v); updateParam("subcategory", "") }
  const setSubcategory = (v: string) => updateParam("subcategory", v)
  const setRarity = (v: string) => updateParam("rarity", v)
  const setTier = (v: number | "") => updateParam("tier", v === "" ? "" : String(v))
  const setCraftingStation = (v: string) => updateParam("station", v)
  const setOwnedOnly = (v: boolean) => updateParam("owned", v ? "true" : "")
  const setHasMissionSource = (v: boolean) => updateParam("missions", v ? "true" : "")
  const source = searchParams.get("source") || ""
  const setSource = (v: string) => updateParam("source", v)
  const manufacturer = searchParams.get("mfr") || ""
  const setManufacturer = (v: string) => updateParam("mfr", v)
  const ingredientName = searchParams.get("ingredient") || ""
  const setIngredientName = (v: string) => updateParam("ingredient", v)
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [filterOpen, setFilterOpen] = useState(false)
  const bottomNavHeight = useBottomNavHeight()
  const [page, setPage] = useState(1)
  const [allBlueprints, setAllBlueprints] = useState<any[]>([])

  // Debounce search text for performance (Requirement 19.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset on filter change
  const filterKey = searchParams.toString()
  useEffect(() => { setPage(1); setAllBlueprints([]) }, [filterKey])

  // Query blueprints with filters
  const { data, isLoading, isFetching, error } = useSearchBlueprintsQuery({
    text: debouncedSearch || undefined,
    itemCategory: category || undefined,
    itemSubcategory: subcategory || undefined,
    rarity: rarity || undefined,
    tier: tier || undefined,
    craftingStationType: craftingStation || undefined,
    userOwnedOnly: ownedOnly || undefined,
    source: source || undefined,
    manufacturer: manufacturer || undefined,
    ingredientName: ingredientName || undefined,
    page,
    pageSize: 20,
  })

  // Accumulate results
  useEffect(() => {
    if (data?.blueprints) {
      setAllBlueprints(prev => page === 1 ? data.blueprints : [...prev, ...data.blueprints])
    }
  }, [data, page])

  const filteredBlueprints = useMemo(() => {
    if (!hasMissionSource) return allBlueprints
    return allBlueprints.filter((bp: any) => bp.mission_count > 0)
  }, [allBlueprints, hasMissionSource])

  const hasMore = data ? page * data.page_size < data.total : false
  const loadMore = useCallback(() => setPage(p => p + 1), [])
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading: isFetching, onLoadMore: loadMore })

  // Query categories for filter options
  const { data: categories } = useGetBlueprintCategoriesQuery({})
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null)

  // Auto-open modal if URL has a blueprint ID (e.g., /blueprints/:id on desktop)
  const urlParams = useParams<{ slug?: string }>()
  React.useEffect(() => {
    if (urlParams.slug && !isMobile) setSelectedBlueprintId(urlParams.slug)
  }, [urlParams.slug, isMobile])

  const handleBlueprintClick = (blueprintId: string, blueprintCode?: string) => {
    const urlSlug = blueprintCode || blueprintId
    const params = searchParams.toString()
    const qs = params ? `?${params}` : ""
    navigate(`/blueprints/${urlSlug}${qs}`)
    if (!isMobile) setSelectedBlueprintId(urlSlug)
  }

  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()
  const { addToShoppingList } = useShoppingList()
  const handleBookmarkToggle = async (blueprintId: string, shouldOwn: boolean) => {
    try {
      if (shouldOwn) await addToInventory({ blueprintId, body: {} }).unwrap()
      else await removeFromInventory({ blueprintId }).unwrap()
      setAllBlueprints(prev => prev.map(bp =>
        bp.blueprint_id === blueprintId ? { ...bp, user_owns: shouldOwn } : bp
      ))
    } catch { /* user not logged in or error */ }
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
    setPage(1)
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
      localStorage.setItem("bp-view", newMode)
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

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField fullWidth size="small" label="Search" value={searchText}
        onChange={(e) => setSearchText(e.target.value)} placeholder="Item or blueprint name..." />
      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setSubcategory("") }}>
          <MenuItem value="">All</MenuItem>
          {uniqueCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
      {subcategoriesForCategory.length > 0 && (
        <FormControl fullWidth size="small">
          <InputLabel>Subcategory</InputLabel>
          <Select value={subcategory} label="Subcategory" onChange={(e) => setSubcategory(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {subcategoriesForCategory.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      )}
      <FormControl fullWidth size="small">
        <InputLabel>Rarity</InputLabel>
        <Select value={rarity} label="Rarity" onChange={(e) => setRarity(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {["Common","Uncommon","Rare","Epic","Legendary"].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Tier</InputLabel>
        <Select value={tier} label="Tier" onChange={(e) => setTier(e.target.value === "" ? "" : Number(e.target.value))}>
          <MenuItem value="">All</MenuItem>
          {[1,2,3,4,5].map(t => <MenuItem key={t} value={t}>Tier {t}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Station</InputLabel>
        <Select value={craftingStation} label="Station" onChange={(e) => setCraftingStation(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {["Weapons Bench","Armor Bench","Component Bench","Vehicle Bench","Electronics Bench"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControlLabel control={<Checkbox checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} size="small" />}
        label={<Typography variant="body2">Owned Only</Typography>} sx={{ ml: 0 }} />
      <FormControlLabel control={<Checkbox checked={hasMissionSource} onChange={(e) => setHasMissionSource(e.target.checked)} size="small" />}
        label={<Typography variant="body2">Has Mission Source</Typography>} sx={{ ml: 0 }} />
      <FormControl fullWidth size="small">
        <InputLabel>Source</InputLabel>
        <Select value={source} label="Source" onChange={(e) => setSource(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="default">Default (all players)</MenuItem>
          <MenuItem value="mission_reward">Mission Reward</MenuItem>
        </Select>
      </FormControl>
      <TextField fullWidth size="small" label="Manufacturer" value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. Behring" />
      <TextField fullWidth size="small" label="Ingredient" value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)} placeholder="e.g. Hephaestanite" />
      <Button size="small" startIcon={<RestartAltRounded />} onClick={handleResetFilters} sx={{ textTransform: "none" }}>
        Reset Filters
      </Button>
    </Stack>
  )

  return (
    <StandardPageLayout
      title={t("blueprints.browser.title", "Blueprint Browser")}
      headerTitle={t("blueprints.browser.header", "Blueprint Browser")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {data ? `${data.total} blueprints` : ""}
            </Typography>
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
              <ToggleButton value="grid"><ViewModule /></ToggleButton>
              <ToggleButton value="list"><ViewList /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading State */}
          {isLoading && <CardGridSkeleton />}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load blueprints. Please try again.
            </Alert>
          )}

          {/* Results */}
          {data && (
            <>

              {/* Grid View */}
              {viewMode === "grid" && (
                <Grid container spacing={2}>
                  {filteredBlueprints.map((blueprint) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={blueprint.blueprint_id}>
                      <BlueprintCard
                        blueprint={blueprint}
                        viewMode="grid"
                        onClick={handleBlueprintClick}
                        onBookmarkToggle={handleBookmarkToggle}
                        onWishlistAdd={(id) => addToShoppingList(id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <Paper>
                  <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Item</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Tags</TableCell>
                        <TableCell>Ingredients</TableCell>
                        <TableCell align="center">Mission Sources</TableCell>
                        <TableCell align="right">Craft Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBlueprints.map((bp) => (
                        <TableRow
                          key={bp.blueprint_id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleBlueprintClick(bp.blueprint_id, bp.blueprint_name)}
                        >
                          <TableCell sx={{ width: 40 }}>
                            <Avatar
                              src={bp.output_item_icon}
                              variant="rounded"
                              sx={{ width: 28, height: 28, fontSize: "0.6rem", bgcolor: "primary.main" }}
                              imgProps={{ style: { objectFit: "cover" } }}
                            >
                              {(bp.output_item_name || "?").slice(0, 2).toUpperCase()}
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 240 }}>
                              {bp.output_item_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {formatCategoryName(bp.item_category)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="nowrap">
                              {bp.user_owns && <Chip label="Owned" size="small" color="success" sx={microChip} />}
                              {bp.source === "default" && <Chip label="Default" size="small" variant="outlined" sx={microChip} />}
                              {bp.rarity && <Chip label={bp.rarity} size="small" sx={{ ...microChip, bgcolor: "info.main", color: "#fff" }} />}
                              {bp.tier && <Chip label={`T${bp.tier}`} size="small" sx={{ ...microChip, bgcolor: "warning.main", color: "#fff" }} />}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: 200 }}>
                              {(bp.ingredients || []).slice(0, 4).map((ing: any, i: number) => {
                                const short = ing.name.replace(/[aeiou]/gi, "").slice(0, 4).toUpperCase() || ing.name.slice(0, 4).toUpperCase()
                                const qty = ing.quantity_required.toFixed(2)
                                return (
                                  <Tooltip key={i} title={`${ing.name} — ${qty} SCU`} arrow>
                                  <Chip
                                    label={`${short}×${qty}`}
                                    size="small"
                                    sx={{ height: 18, fontSize: "0.6rem", bgcolor: getCommodityColor(ing.sub_type) || "grey.600", color: "#fff" }}
                                  />
                                  </Tooltip>
                                )
                              })}
                              {(bp.ingredients || []).length > 4 && (
                                <Chip label={`+${bp.ingredients.length - 4}`} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            {bp.mission_count > 0
                              ? <Chip label={bp.mission_count} size="small" color="info" sx={{ height: 18, fontSize: "0.65rem", minWidth: 24 }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption">
                              {formatCraftingTime(bp.crafting_time_seconds)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {filteredBlueprints.length === 0 && !isFetching && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    No blueprints found. Try adjusting your filters.
                  </Typography>
                </Box>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} />
              {isFetching && page > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => { setSelectedBlueprintId(null); navigate("/blueprints", { replace: true }) }}
      />
    </StandardPageLayout>
  )
}
