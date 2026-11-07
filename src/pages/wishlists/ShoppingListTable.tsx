import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import {
  CheckCircleRounded,
  WarningRounded,
  CancelRounded,
  InfoRounded,
} from "@mui/icons-material"
import { type ShoppingListResponse } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../util/format"

export type SortField = "name" | "quantity" | "cost" | "stock"
export type SortOrder = "asc" | "desc"

/** Sortable table of the materials a shopping list needs, with stock status. */
export function ShoppingListTable({
  sortedMaterials,
  sortField,
  sortOrder,
  handleSort,
  acquisitionLabel,
}: {
  sortedMaterials: ShoppingListResponse["materials_needed"]
  sortField: SortField
  sortOrder: SortOrder
  handleSort: (field: SortField) => void
  acquisitionLabel: (method: string) => string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  // Get stock status icon and color
  const getStockStatus = (
    material: ShoppingListResponse["materials_needed"][number],
  ) => {
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
  return (
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
                    <Stack direction="row" spacing={1} alignItems="center">
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
                            stockStatus.color as "success" | "warning" | "error"
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
                          <Typography variant="body2" color="text.secondary">
                            {t("shoppingListUi.any")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {material.estimated_total_cost ? (
                          <Typography variant="body2">
                            {t("shoppingListUi.amountAuec", {
                              amount: fmt.number(material.estimated_total_cost),
                            })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t("shoppingListUi.notAvailable")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
                              • {item.item_name} ({item.quantity_for_this_item})
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
  )
}
