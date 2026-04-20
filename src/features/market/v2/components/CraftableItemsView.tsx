/**
 * Craftable Items View Component
 *
 * Displays items that can be crafted based on owned blueprints and available stock.
 * Shows material requirements vs. current stock for each craftable item.
 *
 * **Validates: Requirements 10.1-10.6, 11.1-11.6, 21.1-21.6, 22.1-22.6**
 */

import React, { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetCraftableItemsQuery, type CraftableItem } from "../../../../store/craftingApi"

export interface CraftableItemsViewProps {
  /** Optional filter to show only specific item category */
  itemCategory?: string
}

/**
 * CraftableItemsView Component
 *
 * Displays craftable items with material availability and links to crafting calculator.
 */
export function CraftableItemsView({ itemCategory }: CraftableItemsViewProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // State for filters
  const [categoryFilter, setCategoryFilter] = useState<string>(itemCategory || "")
  const [rarityFilter, setRarityFilter] = useState<string>("")
  const [tierFilter, setTierFilter] = useState<number | "">("")
  const [craftableOnly, setCraftableOnly] = useState<boolean>(false)
  const [page, setPage] = useState(1)

  // State for expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Fetch craftable items
  const {
    data: craftableData,
    isLoading,
    error,
  } = useGetCraftableItemsQuery({
    item_category: categoryFilter || undefined,
    rarity: rarityFilter || undefined,
    tier: tierFilter || undefined,
    craftable_only: craftableOnly,
    page,
    page_size: 20,
  })

  const toggleExpanded = (blueprintId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(blueprintId)) {
        next.delete(blueprintId)
      } else {
        next.add(blueprintId)
      }
      return next
    })
  }

  const handleCraftingCalculator = (blueprintId: string) => {
    // TODO: Navigate to crafting calculator with pre-filled blueprint
    window.location.href = `/game-data/crafting?blueprint=${blueprintId}`
  }

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error">
        {t("CraftableItemsView.errorLoading", "Failed to load craftable items")}
      </Alert>
    )
  }

  const items = craftableData?.craftable_items || []
  const summary = craftableData?.summary

  return (
    <Box>
      {/* Header with summary */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} mb={2}>
          {t("CraftableItemsView.title", "Craftable Items")}
        </Typography>

        {/* Summary statistics */}
        {summary && (
          <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
            <Chip
              label={`${summary.total_blueprints_owned} ${t("CraftableItemsView.blueprintsOwned", "Blueprints Owned")}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${summary.items_craftable_now} ${t("CraftableItemsView.craftableNow", "Craftable Now")}`}
              color="success"
              icon={<CheckCircleIcon />}
            />
            <Chip
              label={`${summary.items_missing_materials} ${t("CraftableItemsView.missingMaterials", "Missing Materials")}`}
              color="warning"
              icon={<WarningIcon />}
            />
          </Stack>
        )}

        {/* Filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("CraftableItemsView.category", "Category")}</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label={t("CraftableItemsView.category", "Category")}
            >
              <MenuItem value="">{t("CraftableItemsView.all", "All")}</MenuItem>
              <MenuItem value="Weapons">{t("CraftableItemsView.weapons", "Weapons")}</MenuItem>
              <MenuItem value="Armor">{t("CraftableItemsView.armor", "Armor")}</MenuItem>
              <MenuItem value="Components">{t("CraftableItemsView.components", "Components")}</MenuItem>
              <MenuItem value="Consumables">{t("CraftableItemsView.consumables", "Consumables")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("CraftableItemsView.rarity", "Rarity")}</InputLabel>
            <Select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              label={t("CraftableItemsView.rarity", "Rarity")}
            >
              <MenuItem value="">{t("CraftableItemsView.all", "All")}</MenuItem>
              <MenuItem value="Common">{t("CraftableItemsView.common", "Common")}</MenuItem>
              <MenuItem value="Uncommon">{t("CraftableItemsView.uncommon", "Uncommon")}</MenuItem>
              <MenuItem value="Rare">{t("CraftableItemsView.rare", "Rare")}</MenuItem>
              <MenuItem value="Epic">{t("CraftableItemsView.epic", "Epic")}</MenuItem>
              <MenuItem value="Legendary">{t("CraftableItemsView.legendary", "Legendary")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("CraftableItemsView.tier", "Tier")}</InputLabel>
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as number | "")}
              label={t("CraftableItemsView.tier", "Tier")}
            >
              <MenuItem value="">{t("CraftableItemsView.all", "All")}</MenuItem>
              {[1, 2, 3, 4, 5].map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {t("CraftableItemsView.tierN", "Tier {{tier}}", { tier })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t("CraftableItemsView.availability", "Availability")}</InputLabel>
            <Select
              value={craftableOnly ? "craftable" : "all"}
              onChange={(e) => setCraftableOnly(e.target.value === "craftable")}
              label={t("CraftableItemsView.availability", "Availability")}
            >
              <MenuItem value="all">{t("CraftableItemsView.allItems", "All Items")}</MenuItem>
              <MenuItem value="craftable">
                {t("CraftableItemsView.craftableOnly", "Craftable Only")}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Craftable items list */}
      {items.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {craftableOnly
              ? t(
                  "CraftableItemsView.noCraftableItems",
                  "No items can be crafted with your current stock. Acquire more materials or change filters.",
                )
              : t(
                  "CraftableItemsView.noBlueprints",
                  "You don't own any blueprints yet. Complete missions or purchase blueprints to start crafting.",
                )}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {items.map((item: CraftableItem) => (
            <Paper key={item.blueprint_id} sx={{ p: 2 }}>
              {/* Item header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {item.output_item_icon && (
                      <Box
                        component="img"
                        src={item.output_item_icon}
                        alt={item.output_item_name}
                        sx={{ width: 32, height: 32, objectFit: "contain" }}
                      />
                    )}
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.output_item_name}
                    </Typography>
                    {item.can_craft ? (
                      <Chip
                        label={t("CraftableItemsView.canCraft", "Can Craft")}
                        color="success"
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Chip
                        label={t("CraftableItemsView.missingMats", "Missing Materials")}
                        color="warning"
                        size="small"
                        icon={<WarningIcon />}
                      />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary">
                      {item.blueprint_name}
                    </Typography>
                    {item.rarity && (
                      <Chip label={item.rarity} size="small" variant="outlined" />
                    )}
                    {item.tier && (
                      <Chip
                        label={`${t("CraftableItemsView.tier", "Tier")} ${item.tier}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {item.max_craftable_quantity > 0 && (
                      <Chip
                        label={`${t("CraftableItemsView.maxCraftable", "Max")}: ${item.max_craftable_quantity}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CalculateIcon />}
                    onClick={() => handleCraftingCalculator(item.blueprint_id)}
                    disabled={!item.can_craft}
                  >
                    {t("CraftableItemsView.calculate", "Calculate")}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => toggleExpanded(item.blueprint_id)}
                  >
                    {expandedItems.has(item.blueprint_id) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </Stack>
              </Stack>

              {/* Material requirements (collapsible) */}
              <Collapse in={expandedItems.has(item.blueprint_id)}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" fontWeight="medium" mb={1}>
                  {t("CraftableItemsView.materials", "Materials")} ({item.materials.length})
                </Typography>
                <Stack spacing={1.5}>
                  {item.materials.map((material) => (
                    <Box key={material.game_item_id}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={0.5}
                      >
                        <Typography variant="body2">{material.material_name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            color={material.is_sufficient ? "success.main" : "error.main"}
                          >
                            {material.quantity_available} / {material.quantity_required}
                          </Typography>
                          {material.quality_tier_min !== undefined &&
                            material.quality_tier_max !== undefined && (
                              <Tooltip
                                title={t(
                                  "CraftableItemsView.qualityRange",
                                  "Quality range in stock",
                                )}
                              >
                                <Chip
                                  label={`T${material.quality_tier_min}-${material.quality_tier_max}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          (material.quantity_available / material.quantity_required) * 100,
                        )}
                        color={material.is_sufficient ? "success" : "error"}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {craftableData && craftableData.total > craftableData.page_size && (
        <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("CraftableItemsView.previous", "Previous")}
          </Button>
          <Typography variant="body2" alignSelf="center">
            {t("CraftableItemsView.pageInfo", "Page {{page}} of {{total}}", {
              page,
              total: Math.ceil(craftableData.total / craftableData.page_size),
            })}
          </Typography>
          <Button
            variant="outlined"
            disabled={page >= Math.ceil(craftableData.total / craftableData.page_size)}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("CraftableItemsView.next", "Next")}
          </Button>
        </Stack>
      )}
    </Box>
  )
}

