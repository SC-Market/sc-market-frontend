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

export function StockSearchArea() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("all")
  const [status, setStatus] = useState("all")

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("stock.filters", "Filters")}
      </Typography>

      <TextField
        fullWidth
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

      <TextField
        select
        fullWidth
        label={t("stock.location", "Location")}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="all">{t("common.all", "All")}</MenuItem>
        <MenuItem value="assigned">
          {t("stock.assigned", "Assigned")}
        </MenuItem>
        <MenuItem value="unassigned">
          {t("stock.unassigned", "Unassigned")}
        </MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        label={t("stock.status", "Status")}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <MenuItem value="all">{t("common.all", "All")}</MenuItem>
        <MenuItem value="available">
          {t("stock.available", "Available")}
        </MenuItem>
        <MenuItem value="allocated">
          {t("stock.allocated", "Allocated")}
        </MenuItem>
      </TextField>
    </Box>
  )
}
