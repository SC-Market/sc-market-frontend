/**
 * Stock Breakdown Component
 * 
 * Displays lots grouped by location with inline editing and transfer capabilities.
 * 
 * Requirements: 2.1, 2.5, 3.3, 3.4, 4.4, 5.1
 */

import React, { useState, useMemo } from "react"
import {
  Box,
  Typography,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { StockLot } from "../../../store/api/stock-lots"
import { LotRow } from "./LotRow"

export interface StockBreakdownProps {
  lots: StockLot[]
  listingId: string
  onRefresh: () => void
}

/**
 * StockBreakdown Component
 * 
 * Groups lots by location and displays them with:
 * - Location headers with subtotals
 * - Individual lot rows with inline editing
 * - Filtering by owner, location, and listed status
 */
export function StockBreakdown({ lots, listingId, onRefresh }: StockBreakdownProps) {
  const { t } = useTranslation()
  
  // Filter states
  const [ownerFilter, setOwnerFilter] = useState<string>("all")
  const [listedFilter, setListedFilter] = useState<string>("all")

  // Group lots by location
  const lotsByLocation = useMemo(() => {
    const filtered = lots.filter((lot) => {
      if (ownerFilter !== "all" && lot.owner_id !== ownerFilter) return false
      if (listedFilter === "listed" && !lot.listed) return false
      if (listedFilter === "unlisted" && lot.listed) return false
      return true
    })

    const grouped = new Map<string, StockLot[]>()
    
    filtered.forEach((lot) => {
      const locationKey = lot.location_id || "unspecified"
      if (!grouped.has(locationKey)) {
        grouped.set(locationKey, [])
      }
      grouped.get(locationKey)!.push(lot)
    })

    return grouped
  }, [lots, ownerFilter, listedFilter])

  // Get unique owners for filter
  const uniqueOwners = useMemo(() => {
    const owners = new Set<string>()
    lots.forEach((lot) => {
      if (lot.owner_id) owners.add(lot.owner_id)
    })
    return Array.from(owners)
  }, [lots])

  if (lots.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          {t("StockBreakdown.noLots", "No stock lots found. Create your first lot to get started.")}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Filters */}
      {(uniqueOwners.length > 0 || lots.length > 1) && (
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {uniqueOwners.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t("StockBreakdown.filterByOwner", "Owner")}</InputLabel>
              <Select
                value={ownerFilter}
                label={t("StockBreakdown.filterByOwner", "Owner")}
                onChange={(e) => setOwnerFilter(e.target.value)}
              >
                <MenuItem value="all">{t("StockBreakdown.allOwners", "All Owners")}</MenuItem>
                {uniqueOwners.map((ownerId) => (
                  <MenuItem key={ownerId} value={ownerId}>
                    {ownerId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("StockBreakdown.filterByListed", "Status")}</InputLabel>
            <Select
              value={listedFilter}
              label={t("StockBreakdown.filterByListed", "Status")}
              onChange={(e) => setListedFilter(e.target.value)}
            >
              <MenuItem value="all">{t("StockBreakdown.allStatus", "All")}</MenuItem>
              <MenuItem value="listed">{t("StockBreakdown.listedOnly", "Listed Only")}</MenuItem>
              <MenuItem value="unlisted">{t("StockBreakdown.unlistedOnly", "Unlisted Only")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Lots grouped by location */}
      {Array.from(lotsByLocation.entries()).map(([locationKey, locationLots]) => {
        const subtotal = locationLots.reduce((sum, lot) => sum + lot.quantity_total, 0)
        const locationName = locationKey === "unspecified" 
          ? t("StockBreakdown.unspecifiedLocation", "Unspecified")
          : locationKey

        return (
          <Box key={locationKey} sx={{ mb: 3 }}>
            {/* Location header */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {locationName}
              </Typography>
              <Chip 
                label={`${subtotal} ${t("StockBreakdown.units", "units")}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>

            {/* Lot rows */}
            <Stack spacing={1}>
              {locationLots.map((lot) => (
                <LotRow
                  key={lot.lot_id}
                  lot={lot}
                  listingId={listingId}
                  onUpdate={onRefresh}
                />
              ))}
            </Stack>
          </Box>
        )
      })}
    </Box>
  )
}
