/**
 * Wiki Commodity Browser — table layout with all commodity data
 */

import React, { useMemo, useCallback } from "react"
import {
  Box, Grid, Typography, TextField, MenuItem, Select, FormControl, InputLabel,
  Pagination, Alert, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Paper, Avatar,
} from "@mui/material"
import { CheckCircle, Cancel } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetCommoditiesQuery, useGetResourceCategoriesQuery } from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"
import { getCommodityColor } from "../../util/gameIcons"
import { FALLBACK_IMAGE_URL } from "../../util/constants"

function AcqChip({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label={label} size="small" color="success"
      sx={{ height: 18, fontSize: "0.6rem", fontWeight: 600 }} />
  ) : null
}

export function WikiCommodityBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const text = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const page = Number(searchParams.get("page")) || 1

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    if (key !== "page") p.delete("page")
    setSearchParams(p, { replace: true })
  }, [searchParams, setSearchParams])

  const { data, isLoading, error } = useGetCommoditiesQuery({
    category: category || undefined,
    page,
    pageSize: 50,
  })

  const { data: categoriesData } = useGetResourceCategoriesQuery({})
  const categories = useMemo(() => {
    if (!categoriesData) return []
    return [...new Set(categoriesData.map(c => c.category))].sort()
  }, [categoriesData])

  const filtered = useMemo(() => {
    const items = data?.commodities || []
    if (!text) return items
    const q = text.toLowerCase()
    return items.filter(c => c.name.toLowerCase().includes(q) || c.resource_category?.toLowerCase().includes(q) || c.resource_subcategory?.toLowerCase().includes(q))
  }, [data, text])

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <StandardPageLayout title="Commodities" headerTitle="Commodities" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        {/* Filters inline */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <TextField size="small" label="Search" value={text}
            onChange={(e) => updateParam("q", e.target.value)} placeholder="Name..."
            sx={{ minWidth: 200, flex: 1 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => updateParam("category", e.target.value as string)}>
              <MenuItem value="">All</MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
            {filtered.length} results
          </Typography>
        </Stack>

        {isLoading && <TableSkeleton rows={15} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load commodities.</Alert>}

        {data && (
          <>
            <Paper>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 40 }} />
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Subcategory</TableCell>
                    <TableCell align="center">Acquisition</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.resource_id} hover sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/wiki/commodities/${c.resource_id}`)}>
                      <TableCell sx={{ py: 0.5 }}>
                        <Avatar src={c.image_url || FALLBACK_IMAGE_URL} variant="rounded"
                          sx={{ width: 28, height: 28, bgcolor: getCommodityColor(c.resource_subcategory) || "grey.300" }}
                          imgProps={{ style: { objectFit: "contain" } }} />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip label={c.resource_category} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        {c.resource_subcategory && (
                          <Typography variant="caption" color="text.secondary">{c.resource_subcategory}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }} align="center">
                        <Stack direction="row" spacing={0.25} justifyContent="center" flexWrap="wrap" useFlexGap>
                          <AcqChip value={c.can_be_mined} label="Mine" />
                          <AcqChip value={c.can_be_purchased} label="Buy" />
                          <AcqChip value={c.can_be_salvaged} label="Salvage" />
                          <AcqChip value={c.can_be_looted} label="Loot" />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {filtered.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">No commodities found.</Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => updateParam("page", String(p))} color="primary" />
              </Box>
            )}
          </>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
