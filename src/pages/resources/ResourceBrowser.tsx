/**
 * ResourceBrowser - Search and filter game resources
 * Requirements: 44.1-44.7
 */

import React, { useState } from "react"
import {
  Grid,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  Typography,
  Stack,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import {
  useSearchResourcesQuery,
  useGetResourceCategoriesQuery,
} from "../../store/api/v2/market"
import { ResourceCard } from "../../components/game-data/ResourceCard"
import { useDebounce } from "../../hooks/useDebounce"

export function ResourceBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()

  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("")
  const [acquisition, setAcquisition] = useState<"" | "mined" | "purchased" | "salvaged" | "looted">("")
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchText, 300)

  const { data, isLoading, error } = useSearchResourcesQuery({
    text: debouncedSearch || undefined,
    resourceCategory: category || undefined,
    acquisitionMethod: acquisition || undefined,
    page,
    pageSize: 24,
  })

  const { data: categories } = useGetResourceCategoriesQuery({})

  const uniqueCategories = categories
    ? [...new Set(categories.map((c) => c.category))]
    : []

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        placeholder={t("resources.search", "Search resources...")}
        value={searchText}
        onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><Search /></InputAdornment>
          ),
        }}
      />
      <TextField
        select
        fullWidth
        size="small"
        label={t("resources.category", "Category")}
        value={category}
        onChange={(e) => { setCategory(e.target.value); setPage(1) }}
      >
        <MenuItem value="">{t("common.all", "All")}</MenuItem>
        {uniqueCategories.map((cat) => (
          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        fullWidth
        size="small"
        label={t("resources.acquisition", "Acquisition")}
        value={acquisition}
        onChange={(e) => { setAcquisition(e.target.value as typeof acquisition); setPage(1) }}
      >
        <MenuItem value="">{t("common.all", "All")}</MenuItem>
        <MenuItem value="mined">{t("resources.mined", "Mined")}</MenuItem>
        <MenuItem value="purchased">{t("resources.purchased", "Purchased")}</MenuItem>
        <MenuItem value="salvaged">{t("resources.salvaged", "Salvaged")}</MenuItem>
        <MenuItem value="looted">{t("resources.looted", "Looted")}</MenuItem>
      </TextField>
    </Stack>
  )

  return (
    <StandardPageLayout
      title={t("resources.title", "Resources")}
      headerTitle={t("resources.title", "Resources")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters">
          {/* Loading */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error">
              {t("resources.error", "Failed to load resources.")}
            </Alert>
          )}

          {/* Results */}
          {data && (
            <>
              <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
                {data.resources.map((resource) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={resource.resource_id}>
                    <ResourceCard
                      resource={resource}
                      onClick={(id) => navigate(`/resources/${id}`)}
                    />
                  </Grid>
                ))}
              </Grid>

              {data.resources.length === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    {t("resources.noResults", "No results found. Try adjusting your filters.")}
                  </Typography>
                </Box>
              )}

              {data.total > 24 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={Math.ceil(data.total / 24)}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
