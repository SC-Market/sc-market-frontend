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
  Avatar,
  Grid,
  Divider,
  useMediaQuery,
} from "@mui/material"
import {
  ArrowBack,
  Download,
  ShoppingCart,
  CheckCircle,
  Warning,
  Cancel,
  Info,
} from "@mui/icons-material"
import { useGenerateShoppingListQuery } from "../../store/api/v2/market"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

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
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { wishlist_id } = useParams<{ wishlist_id: string }>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Query shopping list data (Requirements 9.1, 9.2, 9.3, 9.4)
  const { data, isLoading, error } = useGenerateShoppingListQuery({ wishlistId: wishlist_id || "" })

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
          comparison = (a.estimated_total_cost || 0) - (b.estimated_total_cost || 0)
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
      "Material Name",
      "Total Needed",
      "In Stock",
      "To Acquire",
      "Quality Tier",
      "Unit Price",
      "Total Cost",
      "Acquisition Methods",
      "Used By Items",
    ]

    const rows = sortedMaterials.map((material) => [
      material.game_item_name,
      material.total_quantity_needed.toString(),
      material.user_inventory_quantity.toString(),
      material.quantity_to_acquire.toString(),
      material.desired_quality_tier?.toString() || "Any",
      material.estimated_unit_price?.toLocaleString() || "N/A",
      material.estimated_total_cost?.toLocaleString() || "N/A",
      material.acquisition_methods.join("; "),
      material.used_by_items.map((item) => `${item.item_name} (${item.quantity_for_this_item})`).join("; "),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `shopping-list-${data.wishlist_name.replace(/\s+/g, "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Navigate back to wishlist detail (Requirement 9.6)
  const handleBackToWishlist = () => {
    navigate(`/shopping-lists/${wishlist_id}`)
  }

  // Get stock status icon and color
  const getStockStatus = (material: typeof sortedMaterials[0]) => {
    if (material.user_inventory_quantity >= material.total_quantity_needed) {
      return { icon: <CheckCircle />, color: "success", label: "Fully Stocked" }
    } else if (material.user_inventory_quantity > 0) {
      return { icon: <Warning />, color: "warning", label: "Partially Stocked" }
    } else {
      return { icon: <Cancel />, color: "error", label: "Not Stocked" }
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
            {t("wishlists.shopping.error", "Failed to load shopping list. Please try again.")}
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBackToWishlist}>
              Back to Wishlist
            </Button>
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={`${data.wishlist_name} - Shopping List`}
      headerTitle={`Shopping List: ${data.wishlist_name}`}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Header Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBackToWishlist}>
            Back to Wishlist
          </Button>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportCSV}
            disabled={sortedMaterials.length === 0}
          >
            Export to CSV
          </Button>
        </Box>

        {/* Summary Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <ShoppingCart />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{sortedMaterials.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Materials
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
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{data.materials_fully_stocked}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fully Stocked
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
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{data.materials_partially_stocked}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Partially Stocked
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
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <Cancel />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{data.materials_not_stocked}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Not Stocked
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Total Cost Summary */}
        {data.total_estimated_cost > 0 && (
          <Card sx={{ mb: 3, bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Estimated Total Cost</Typography>
                <Typography variant="h4" color="primary">
                  {data.total_estimated_cost.toLocaleString()} aUEC
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Materials Table */}
        {sortedMaterials.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <ShoppingCart sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No materials needed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add craftable items to your wishlist to generate a shopping list
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
                        Material
                      </TableSortLabel>
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center">Status</TableCell>
                    )}
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === "quantity"}
                        direction={sortField === "quantity" ? sortOrder : "asc"}
                        onClick={() => handleSort("quantity")}
                      >
                        Total Needed
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortField === "stock"}
                        direction={sortField === "stock" ? sortOrder : "asc"}
                        onClick={() => handleSort("stock")}
                      >
                        In Stock
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">To Acquire</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell align="center">Quality</TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={sortField === "cost"}
                            direction={sortField === "cost" ? sortOrder : "asc"}
                            onClick={() => handleSort("cost")}
                          >
                            Est. Cost
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Acquisition</TableCell>
                      </>
                    )}
                    <TableCell align="center">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMaterials.map((material) => {
                    const stockStatus = getStockStatus(material)
                    return (
                      <TableRow key={material.game_item_id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {material.game_item_icon && (
                              <Avatar
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
                                color={stockStatus.color as "success" | "warning" | "error"}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {material.total_quantity_needed.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={material.user_inventory_quantity > 0 ? "success.main" : "text.secondary"}>
                            {material.user_inventory_quantity.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium" color={material.quantity_to_acquire > 0 ? "error.main" : "success.main"}>
                            {material.quantity_to_acquire.toLocaleString()}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell align="center">
                              {material.desired_quality_tier ? (
                                <Chip label={`T${material.desired_quality_tier}`} size="small" />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Any
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {material.estimated_total_cost ? (
                                <Typography variant="body2">
                                  {material.estimated_total_cost.toLocaleString()} aUEC
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {material.acquisition_methods.map((method) => (
                                  <Chip key={method} label={method} size="small" variant="outlined" />
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
                                  Used by:
                                </Typography>
                                {material.used_by_items.map((item) => (
                                  <Typography key={item.wishlist_item_id} variant="caption" display="block">
                                    • {item.item_name} ({item.quantity_for_this_item})
                                  </Typography>
                                ))}
                              </Box>
                            }
                          >
                            <IconButton size="small">
                              <Info fontSize="small" />
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
              Rotate your device or view on desktop for additional details including quality, cost, and acquisition methods.
            </Typography>
          </Alert>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
