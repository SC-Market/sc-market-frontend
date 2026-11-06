/**
 * ShoppingList Component
 *
 * Display aggregated materials needed for all wishlist items with quantities,
 * costs, and acquisition methods. Supports CSV export.
 *
 * Task 14.4 - Create ShoppingList component
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import {
  DownloadRounded,
  ShoppingCartRounded,
  CheckCircleRounded,
  WarningRounded,
  CancelRounded,
  InfoRounded,
} from "@mui/icons-material"
import { useGenerateShoppingListQuery } from "../../store/api/v2/market"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useFormatters } from "../../util/format"
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded"

type SortField = "name" | "quantity" | "cost" | "stock"
type SortOrder = "asc" | "desc"

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

  // Get stock status icon and color
  const getStockStatus = (material: (typeof sortedMaterials)[0]) => {
    if (material.user_inventory_quantity >= material.total_quantity_needed) {
      return {
        icon: <CheckCircleRounded />,
        color: "success",
        label: t("shoppingListUi.fullyStocked"),
      }
    } else if (material.user_inventory_quantity > 0) {
      return {
        icon: <WarningRounded />,
        color: "warning",
        label: t("shoppingListUi.partiallyStocked"),
      }
    } else {
      return {
        icon: <CancelRounded />,
        color: "error",
        label: t("shoppingListUi.notStocked"),
      }
    }
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
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ImageAvatar
                    alt=""
                    sx={{ bgcolor: theme.palette.primary.main }}
                  >
                    <ShoppingCartRounded />
                  </ImageAvatar>
                  <Box>
                    <Typography variant="h4">
                      {sortedMaterials.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("shoppingListUi.totalMaterials")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ImageAvatar
                    alt=""
                    sx={{ bgcolor: theme.palette.success.main }}
                  >
                    <CheckCircleRounded />
                  </ImageAvatar>
                  <Box>
                    <Typography variant="h4">
                      {data.materials_fully_stocked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("shoppingListUi.fullyStocked")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ImageAvatar
                    alt=""
                    sx={{ bgcolor: theme.palette.warning.main }}
                  >
                    <WarningRounded />
                  </ImageAvatar>
                  <Box>
                    <Typography variant="h4">
                      {data.materials_partially_stocked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("shoppingListUi.partiallyStocked")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ImageAvatar
                    alt=""
                    sx={{ bgcolor: theme.palette.error.main }}
                  >
                    <CancelRounded />
                  </ImageAvatar>
                  <Box>
                    <Typography variant="h4">
                      {data.materials_not_stocked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("shoppingListUi.notStocked")}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
          <Card>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === "name"}
                        direction={sortField === "name" ? sortOrder : "asc"}
                        onClick={() => handleSort("name")}
                      >
                        {t("shoppingListUi.columns.material")}
                      </TableSortLabel>
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center">
                        {t("shoppingListUi.columns.status")}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === "quantity"}
                        direction={sortField === "quantity" ? sortOrder : "asc"}
                        onClick={() => handleSort("quantity")}
                      >
                        {t("shoppingListUi.columns.totalNeeded")}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === "stock"}
                        direction={sortField === "stock" ? sortOrder : "asc"}
                        onClick={() => handleSort("stock")}
                      >
                        {t("shoppingListUi.columns.inStock")}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      {t("shoppingListUi.columns.toAcquire")}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell align="center">
                          {t("shoppingListUi.columns.quality")}
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortField === "cost"}
                            direction={sortField === "cost" ? sortOrder : "asc"}
                            onClick={() => handleSort("cost")}
                          >
                            {t("wishlists.estCost")}
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          {t("shoppingListUi.columns.acquisition")}
                        </TableCell>
                      </>
                    )}
                    <TableCell align="center">
                      {t("shoppingListUi.columns.details")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMaterials.map((material) => {
                    const stockStatus = getStockStatus(material)
                    return (
                      <TableRow key={material.game_item_id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {material.game_item_icon && (
                              <ImageAvatar
                                src={material.game_item_icon}
                                alt={material.game_item_name}
                                sx={{ width: 32, height: 32 }}
                                variant="rounded"
                              />
                            )}
                            <Typography variant="body2" fontWeight="medium">
                              {material.game_item_name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="center">
                            <Tooltip title={stockStatus.label}>
                              <Chip
                                icon={stockStatus.icon}
                                label={stockStatus.label}
                                color={
                                  stockStatus.color as
                                    | "success"
                                    | "warning"
                                    | "error"
                                }
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {fmt.number(material.total_quantity_needed)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={
                              material.user_inventory_quantity > 0
                                ? "success.main"
                                : "text.secondary"
                            }
                          >
                            {fmt.number(material.user_inventory_quantity)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={
                              material.quantity_to_acquire > 0
                                ? "error.main"
                                : "success.main"
                            }
                          >
                            {fmt.number(material.quantity_to_acquire)}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell align="center">
                              {material.desired_quality_tier ? (
                                <Chip
                                  label={`T${material.desired_quality_tier}`}
                                  size="small"
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("shoppingListUi.any")}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {material.estimated_total_cost ? (
                                <Typography variant="body2">
                                  {t("shoppingListUi.amountAuec", {
                                    amount: fmt.number(
                                      material.estimated_total_cost,
                                    ),
                                  })}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {t("shoppingListUi.notAvailable")}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                flexWrap="wrap"
                              >
                                {material.acquisition_methods.map((method) => (
                                  <Chip
                                    key={method}
                                    label={acquisitionLabel(method)}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Stack>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="center">
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="caption" fontWeight="bold">
                                  {t("shoppingListUi.usedBy")}
                                </Typography>
                                {material.used_by_items.map((item) => (
                                  <Typography
                                    key={item.wishlist_item_id}
                                    variant="caption"
                                    display="block"
                                  >
                                    • {item.item_name} (
                                    {item.quantity_for_this_item})
                                  </Typography>
                                ))}
                              </Box>
                            }
                          >
                            <IconButton size="small">
                              <InfoRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
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
