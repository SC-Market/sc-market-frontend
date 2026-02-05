/**
 * Stock Search Area
 *
 * Sidebar for filtering stock lots
 */

import React, { useState } from "react"
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import SearchIcon from "@mui/icons-material/Search"
import { LocationSelector } from "./LocationSelector"

export function StockSearchArea() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [locationId, setLocationId] = useState<string | null>(null)
  const [status, setStatus] = useState("all")
  const [minQuantity, setMinQuantity] = useState("")
  const [maxQuantity, setMaxQuantity] = useState("")

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("stock.filters", "Filters")}
      </Typography>

      <TextField
        fullWidth
        size="small"
        placeholder={t("stock.searchLots", "Search lots...")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <LocationSelector
        value={locationId}
        onChange={(newValue) => setLocationId(newValue)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        readOnly={false}
      />

      <TextField
        select
        fullWidth
        size="small"
        label={t("stock.status", "Status")}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="all">{t("common.all", "All")}</MenuItem>
        <MenuItem value="available">
          {t("stock.available", "Available")}
        </MenuItem>
        <MenuItem value="allocated">
          {t("stock.allocated", "Allocated")}
        </MenuItem>
      </TextField>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label={t("stock.minQuantity", "Min Qty")}
          value={minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label={t("stock.maxQuantity", "Max Qty")}
          value={maxQuantity}
          onChange={(e) => setMaxQuantity(e.target.value)}
        />
      </Box>
    </Box>
  )
}
