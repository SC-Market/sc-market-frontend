import React, { useState } from "react"
import {
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
} from "@mui/material"
import { Check } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetCraftingHistoryQuery } from "../../store/craftingApi"

const TIER_COLORS: Record<number, string> = {
  1: "default",
  2: "success",
  3: "info",
  4: "secondary",
  5: "warning",
}

export function CraftingHistory() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading, error } = useGetCraftingHistoryQuery({
    page: page + 1,
    page_size: pageSize,
  })

  return (
    <StandardPageLayout
      title={t("crafting.history_title", "Crafting History")}
      headerTitle={t("crafting.history_title", "Crafting History")}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
      error={error}
    >
      <Grid item xs={12}>
        {data && (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("crafting.date", "Date")}</TableCell>
                    <TableCell>{t("crafting.blueprint", "Blueprint")}</TableCell>
                    <TableCell>{t("crafting.output_item", "Output Item")}</TableCell>
                    <TableCell>{t("crafting.quality", "Quality")}</TableCell>
                    <TableCell align="right">{t("crafting.quantity", "Qty")}</TableCell>
                    <TableCell align="center">{t("crafting.critical", "Critical")}</TableCell>
                    <TableCell align="right">{t("crafting.cost", "Cost")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.history.map((row) => (
                    <TableRow key={row.session_id}>
                      <TableCell>
                        {new Date(row.crafting_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{row.blueprint_name}</TableCell>
                      <TableCell>{row.output_item_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={`T${row.output_quality_tier}`}
                            size="small"
                            color={TIER_COLORS[row.output_quality_tier] as any}
                          />
                          {row.output_quality_value}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.output_quantity}</TableCell>
                      <TableCell align="center">
                        {row.was_critical_success && <Check color="success" />}
                      </TableCell>
                      <TableCell align="right">
                        {row.total_material_cost != null
                          ? row.total_material_cost.toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          {t("crafting.no_history", "No crafting history found.")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </Paper>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
