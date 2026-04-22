/**
 * Stock Manager V2 Component
 *
 * Advanced stock management interface with variant support, lot breakdown,
 * inline editing, and progressive disclosure of complex features.
 *
 * **Validates: Requirements 21.1-21.12**
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material"
import { Add as AddIcon, Inventory as InventoryIcon, Build as BuildIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetStockLotsQuery,
  type StockLotDetail,
  type LocationInfo,
} from "../../../store/api/v2/market"
import { StockBreakdown } from "../components/stock/StockBreakdown"
import { LotListItemV2 } from "./components/LotListItemV2"
import { CreateLotDialogV2 } from "./components/CreateLotDialogV2"
import { TransferLotDialogV2 } from "./components/TransferLotDialogV2"
import { CraftableItemsView } from "./components/CraftableItemsView"

export interface StockManagerV2Props {
  listingId: string
  itemId: string
  onClose?: () => void
}

type SortOption = "quality" | "quantity" | "location"

/**
 * StockManagerV2 Component
 *
 * Displays a comprehensive view of all stock lots for a V2 listing.
 * Groups lots by location and variant, shows aggregates, and provides inline editing.
 * Supports quality tier filtering and sorting by quality, quantity, or location.
 */
export function StockManagerV2({
  listingId,
  itemId,
  onClose,
}: StockManagerV2Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State for tabs
  const [activeTab, setActiveTab] = useState<"stock" | "craftable">("stock")

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState<StockLotDetail | null>(null)

  // State for filters and sorting
  const [qualityTierMin, setQualityTierMin] = useState<number | undefined>(
    undefined,
  )
  const [qualityTierMax, setQualityTierMax] = useState<number | undefined>(
    undefined,
  )
  const [sortBy, setSortBy] = useState<SortOption>("location")

  // Fetch lots
  const {
    data: lotsData,
    isLoading: isLoadingLots,
    error: lotsError,
  } = useGetStockLotsQuery({
    listingId,
    qualityTierMin,
    qualityTierMax,
  })

  // Extract unique locations for filtering
  const locations = useMemo(() => {
    if (!lotsData?.lots) return []
    const locationMap = new Map<string, LocationInfo>()
    lotsData.lots.forEach((lot) => {
      if (lot.location) {
        locationMap.set(lot.location.location_id, lot.location)
      }
    })
    return Array.from(locationMap.values())
  }, [lotsData])

  // Group lots by location and variant
  const groupedLots = useMemo(() => {
    if (!lotsData?.lots) return new Map()

    const grouped = new Map<
      string,
      {
        location: LocationInfo | null
        variantGroups: Map<
          string,
          {
            variant: StockLotDetail["variant"]
            lots: StockLotDetail[]
          }
        >
      }
    >()

    // Sort lots based on selected sort option
    const sortedLots = [...lotsData.lots].sort((a, b) => {
      switch (sortBy) {
        case "quality": {
          const qualityA = a.variant.attributes.quality_tier || 0
          const qualityB = b.variant.attributes.quality_tier || 0
          return qualityB - qualityA // Descending (highest quality first)
        }
        case "quantity":
          return b.quantity_total - a.quantity_total // Descending
        case "location":
        default:
          return (a.location?.name || "").localeCompare(
            b.location?.name || "",
          )
      }
    })

    sortedLots.forEach((lot) => {
      const locationId = lot.location?.location_id || "unspecified"

      if (!grouped.has(locationId)) {
        grouped.set(locationId, {
          location: lot.location,
          variantGroups: new Map(),
        })
      }

      const locationGroup = grouped.get(locationId)!
      const variantId = lot.variant.variant_id

      if (!locationGroup.variantGroups.has(variantId)) {
        locationGroup.variantGroups.set(variantId, {
          variant: lot.variant,
          lots: [],
        })
      }

      locationGroup.variantGroups.get(variantId)!.lots.push(lot)
    })

    return grouped
  }, [lotsData, sortBy])

  // Calculate aggregates
  const aggregates = useMemo(() => {
    if (!lotsData?.lots) {
      return { total: 0, available: 0, reserved: 0 }
    }

    const total = lotsData.lots.reduce(
      (sum, lot) => sum + lot.quantity_total,
      0,
    )
    const available = lotsData.lots
      .filter((lot) => lot.listed)
      .reduce((sum, lot) => sum + lot.quantity_total, 0)
    const reserved = total - available

    return { total, available, reserved }
  }, [lotsData])

  // Handle transfer dialog
  const handleTransferClick = (lot: StockLotDetail) => {
    setSelectedLot(lot)
    setTransferDialogOpen(true)
  }

  const handleTransferClose = () => {
    setTransferDialogOpen(false)
    setSelectedLot(null)
  }

  // Loading state
  if (isLoadingLots) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (lotsError) {
    return (
      <Alert severity="error">
        {t("StockManagerV2.errorLoading", "Failed to load stock information")}
      </Alert>
    )
  }

  const lots = lotsData?.lots || []

  return (
    <Box>
      {/* Header with tabs */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"}>
            {t("StockManagerV2.title", "Stock Management")}
          </Typography>
          {activeTab === "stock" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="small"
              fullWidth={isMobile}
            >
              {t("StockManagerV2.createLot", "Create Lot")}
            </Button>
          )}
        </Stack>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={t("StockManagerV2.stockTab", "Stock Lots")}
            value="stock"
            icon={<InventoryIcon />}
            iconPosition="start"
          />
          <Tab
            label={t("StockManagerV2.craftableTab", "Craftable Items")}
            value="craftable"
            icon={<BuildIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab content */}
      {activeTab === "craftable" ? (
        <CraftableItemsView />
      ) : (
        <>
          {/* Stock lots view */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
            {/* Stock breakdown summary */}
            <StockBreakdown
              total={aggregates.total}
              available={aggregates.available}
              reserved={aggregates.reserved}
            />

            {/* Filters and sorting */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              mt={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
          {/* Quality tier filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              {t("StockManagerV2.minQuality", "Min Quality")}
            </InputLabel>
            <Select
              value={qualityTierMin || ""}
              onChange={(e) =>
                setQualityTierMin(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              label={t("StockManagerV2.minQuality", "Min Quality")}
            >
              <MenuItem value="">
                {t("StockManagerV2.any", "Any")}
              </MenuItem>
              {[1, 2, 3, 4, 5].map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {t("StockManagerV2.tier", "Tier")} {tier}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              {t("StockManagerV2.maxQuality", "Max Quality")}
            </InputLabel>
            <Select
              value={qualityTierMax || ""}
              onChange={(e) =>
                setQualityTierMax(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              label={t("StockManagerV2.maxQuality", "Max Quality")}
            >
              <MenuItem value="">
                {t("StockManagerV2.any", "Any")}
              </MenuItem>
              {[1, 2, 3, 4, 5].map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {t("StockManagerV2.tier", "Tier")} {tier}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sort by */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("StockManagerV2.sortBy", "Sort By")}</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              label={t("StockManagerV2.sortBy", "Sort By")}
            >
              <MenuItem value="location">
                {t("StockManagerV2.sortLocation", "Location")}
              </MenuItem>
              <MenuItem value="quality">
                {t("StockManagerV2.sortQuality", "Quality")}
              </MenuItem>
              <MenuItem value="quantity">
                {t("StockManagerV2.sortQuantity", "Quantity")}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
          </Paper>

          {/* Lots grouped by location and variant */}
      {lots.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t(
              "StockManagerV2.noLots",
              "No stock lots found. Create your first lot to get started.",
            )}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t("StockManagerV2.createFirstLot", "Create First Lot")}
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {Array.from(groupedLots.entries()).map(
            ([locationId, { location, variantGroups }]) => (
              <Paper key={locationId} sx={{ p: 2 }}>
                {/* Location header */}
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {location?.name ||
                      t(
                        "StockManagerV2.unspecifiedLocation",
                        "Unspecified Location",
                      )}
                  </Typography>
                  {location?.is_preset && (
                    <Chip
                      label={t("StockManagerV2.preset", "Preset")}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    (
                    {Array.from<{ variant: StockLotDetail["variant"]; lots: StockLotDetail[] }>(variantGroups.values()).reduce<number>(
                      (sum, vg) => sum + vg.lots.length,
                      0,
                    )}{" "}
                    {Array.from<{ variant: StockLotDetail["variant"]; lots: StockLotDetail[] }>(variantGroups.values()).reduce<number>(
                      (sum, vg) => sum + vg.lots.length,
                      0,
                    ) === 1
                      ? t("StockManagerV2.lot", "lot")
                      : t("StockManagerV2.lots", "lots")}
                    )
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Variant groups within location */}
                <Stack spacing={1.5}>
                  {Array.from<[string, { variant: StockLotDetail["variant"]; lots: StockLotDetail[] }]>(variantGroups.entries()).map<React.ReactElement>(
                    ([variantId, { variant, lots: variantLots }]) => (
                      <Box key={variantId}>
                        {/* Variant header with quality badge */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mb={1}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color="text.secondary"
                          >
                            {variant.display_name}
                          </Typography>
                          {variant.attributes.quality_tier && (
                            <Chip
                              label={`${t("StockManagerV2.tier", "Tier")} ${variant.attributes.quality_tier}`}
                              size="small"
                              color={
                                variant.attributes.quality_tier >= 4
                                  ? "success"
                                  : variant.attributes.quality_tier >= 3
                                    ? "primary"
                                    : "default"
                              }
                              variant="outlined"
                            />
                          )}
                          {variant.attributes.quality_value !== undefined && (
                            <Typography variant="caption" color="text.secondary">
                              ({variant.attributes.quality_value.toFixed(1)}%)
                            </Typography>
                          )}
                          {variant.attributes.crafted_source && (
                            <Chip
                              label={variant.attributes.crafted_source}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        {/* Lots for this variant */}
                        <Stack spacing={1}>
                          {variantLots.map((lot: StockLotDetail) => (
                            <LotListItemV2
                              key={lot.lot_id}
                              lot={lot}
                              locations={locations}
                              onTransfer={handleTransferClick}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              </Paper>
            ),
          )}
        </Stack>
          )}
        </>
      )}

      {/* Create Lot Dialog */}
      <CreateLotDialogV2
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        listingId={listingId}
        itemId={itemId}
        locations={locations}
      />

      {/* Transfer Lot Dialog */}
      {selectedLot && (
        <TransferLotDialogV2
          open={transferDialogOpen}
          onClose={handleTransferClose}
          lot={selectedLot}
          locations={locations}
        />
      )}
    </Box>
  )
}
