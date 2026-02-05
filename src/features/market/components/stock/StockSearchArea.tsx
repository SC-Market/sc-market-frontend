/**
 * Stock Search Area
 *
 * Sidebar for filtering stock lots
 */

import React from "react"
import {
  Stack,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import SearchIcon from "@mui/icons-material/Search"
import { LocationSelector } from "./LocationSelector"
import { useStockSearch } from "./StockSearchContext"

export function StockSearchArea() {
  const { t } = useTranslation()
  const {
    filters,
    setSearch,
    setLocationId,
    setStatus,
    setMinQuantity,
    setMaxQuantity,
  } = useStockSearch()

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      <Typography variant="h6">
        {t("stock.filters", "Filters")}
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t("stock.searchLots", "Search lots...")}
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <LocationSelector
        value={filters.locationId}
        onChange={(newValue) => setLocationId(newValue)}
        size="small"
        fullWidth
        readOnly={false}
      />

      <TextField
        select
        fullWidth
        size="small"
        label={t("stock.status", "Status")}
        value={filters.status}
        onChange={(e) =>
          setStatus(e.target.value as "all" | "available" | "allocated")
        }
      >
        <MenuItem value="all">{t("common.all", "All")}</MenuItem>
        <MenuItem value="available">
          {t("stock.available", "Available")}
        </MenuItem>
        <MenuItem value="allocated">
          {t("stock.allocated", "Allocated")}
        </MenuItem>
      </TextField>

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label={t("stock.minQuantity", "Min Qty")}
          value={filters.minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label={t("stock.maxQuantity", "Max Qty")}
          value={filters.maxQuantity}
          onChange={(e) => setMaxQuantity(e.target.value)}
        />
      </Stack>
    </Stack>
  )
}
