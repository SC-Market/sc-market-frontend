/**
 * ShoppingList Component
 *
 * Display aggregated materials needed for all wishlist items with quantities,
 * costs, and acquisition methods. Supports CSV export.
 *
 * Task 14.4 - Create ShoppingList component
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Grid,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { DownloadRounded, ShoppingCartRounded } from "@mui/icons-material"
import { useGenerateShoppingListQuery } from "../../store/api/v2/market"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useFormatters } from "../../util/format"
import { ShoppingListSummary } from "./ShoppingListSummary"
import {
  ShoppingListTable,
  type SortField,
  type SortOrder,
} from "./ShoppingListTable"
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded"

/**
 * ShoppingList Component
 *
 * Features:
 * - Display aggregated materials from all wishlist items (9.1)
 * - Show material name, total quantity needed, quantity in stock, quantity to acquire (9.2)
 * - Display estimated cost per material and total cost (9.3)
 * - Show acquisition methods (craft, purchase, mine, etc.) (9.4)
 * - Provide CSV export functionality (9.5)
 * - Link back to wishlist detail (9.6)
 * - Summary statistics at the top
 * - Sorting options (by name, cost, quantity)
 * - Responsive design for mobile devices
 */
export function ShoppingList() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { wishlist_id } = useParams<{ wishlist_id: string }>()
  const isMobile = useIsMobile()

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Query shopping list data (Requirements 9.1, 9.2, 9.3, 9.4)
  const { data, isLoading, error } = useGenerateShoppingListQuery({
    wishlistId: wishlist_id || "",
  })

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Sort materials
  const sortedMaterials = useMemo(() => {
    if (!data?.materials_needed) return []

    const materials = [...data.materials_needed]

    materials.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "name":
          comparison = a.game_item_name.localeCompare(b.game_item_name)
          break
        case "quantity":
          comparison = a.total_quantity_needed - b.total_quantity_needed
          break
        case "cost":
          comparison =
            (a.estimated_total_cost || 0) - (b.estimated_total_cost || 0)
          break
        case "stock":
          comparison = a.user_inventory_quantity - b.user_inventory_quantity
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return materials
  }, [data?.materials_needed, sortField, sortOrder])

  // Export to CSV (Requirement 9.5)
  const handleExportCSV = () => {
    if (!data) return

    const headers = [
      t("shoppingListUi.csv.materialName"),
      t("shoppingListUi.csv.totalNeeded"),
      t("shoppingListUi.csv.inStock"),
      t("shoppingListUi.csv.toAcquire"),
      t("wishlists.qualityTier"),
      t("shoppingListUi.csv.unitPrice"),
      t("shoppingListUi.csv.totalCost"),
      t("shoppingListUi.csv.acquisitionMethods"),
      t("shoppingListUi.csv.usedByItems"),
    ]

    const rows = sortedMaterials.map((material) => [
      material.game_item_name,
      material.total_quantity_needed.toString(),
      material.user_inventory_quantity.toString(),
      material.quantity_to_acquire.toString(),
      material.desired_quality_tier?.toString() || t("shoppingListUi.any"),
      fmt.number(material.estimated_unit_price) ||
        t("shoppingListUi.notAvailable"),
      fmt.number(material.estimated_total_cost) ||
        t("shoppingListUi.notAvailable"),
      material.acquisition_methods.map(acquisitionLabel).join("; "),
      material.used_by_items
        .map((item) => `${item.item_name} (${item.quantity_for_this_item})`)
        .join("; "),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `shopping-list-${data.wishlist_name.replace(/\s+/g, "-")}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Acquisition methods are API values; known ones get a translated label.
  const acquisitionLabel = (method: string) =>
    t(`shoppingListUi.acquisition.${method}`, { defaultValue: method })

  // Navigate back to wishlist detail (Requirement 9.6)
  const handleBackToWishlist = () => {
    navigate(`/shopping-lists/${wishlist_id}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wishlists.shopping.title", "Shopping List")}
        headerTitle={t("wishlists.shopping.header", "Shopping List")}
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
  if (error || !data) {
    return (
      <StandardPageLayout
        title={t("wishlists.shopping.title", "Shopping List")}
        headerTitle={t("wishlists.shopping.header", "Shopping List")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">
            {t(
              "wishlists.shopping.error",
              "Failed to load shopping list. Please try again.",
            )}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftRounded />}
              onClick={handleBackToWishlist}
            >
              {t("shoppingListUi.backToWishlist")}
            </Button>
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("shoppingListUi.pageTitle", { name: data.wishlist_name })}
      headerTitle={t("shoppingListUi.headerTitle", {
        name: data.wishlist_name,
      })}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Header Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ChevronLeftRounded />}
            onClick={handleBackToWishlist}
          >
            {t("shoppingListUi.backToWishlist")}
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadRounded />}
            onClick={handleExportCSV}
            disabled={sortedMaterials.length === 0}
          >
            {t("shoppingListUi.exportCsv")}
          </Button>
        </Box>

        {/* Summary Statistics */}
        <ShoppingListSummary
          data={data}
          materialCount={sortedMaterials.length}
        />

        {/* Total Cost Summary */}
        {data.total_estimated_cost > 0 && (
          <Card
            sx={{
              mb: 3,
              bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">
                  {t("shoppingListUi.estimatedTotalCost")}
                </Typography>
                <Typography variant="h4" color="primary">
                  {t("shoppingListUi.amountAuec", {
                    amount: fmt.number(data.total_estimated_cost),
                  })}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Materials Table */}
        {sortedMaterials.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <ShoppingCartRounded
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("shoppingListUi.noMaterials")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("shoppingListUi.noMaterialsHint")}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <ShoppingListTable
            sortedMaterials={sortedMaterials}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
            acquisitionLabel={acquisitionLabel}
          />
        )}

        {/* Mobile-specific additional info */}
        {isMobile && sortedMaterials.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              {t("shoppingListUi.mobileHint")}
            </Typography>
          </Alert>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
