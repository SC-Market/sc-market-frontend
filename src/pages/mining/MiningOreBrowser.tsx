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
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { useSearchMiningOresQuery, type MiningOreSearchResult } from "../../store/api/v2/mining"
import { useDebounce } from "../../hooks/useDebounce"
import { MiningOreDetailModal } from "./MiningOreDetailModal"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

const PAGE_SIZE = 24

export function MiningOreBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchText = searchParams.get("q") || ""
  const system = searchParams.get("system") || ""
  const method = searchParams.get("mining_method") || ""
  const rarity = searchParams.get("rarity") || ""
  const page = parseInt(searchParams.get("page") || "1") || 1

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== "page") params.delete("page")
    setSearchParams(params, { replace: true })
  }

  const debouncedSearch = useDebounce(searchText, 300)
  const [selectedOre, setSelectedOre] = useState<string | null>(null)

  const { data, isLoading, error } = useSearchMiningOresQuery({
    text: debouncedSearch || undefined,
    system: system || undefined,
    mining_method: method || undefined,
    rarity: rarity || undefined,
    page,
    page_size: PAGE_SIZE,
  })

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        placeholder={t("mining.searchOres", "Search ores...")}
        value={searchText}
        onChange={(e) => updateParam("q", e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />
      <TextField
        select fullWidth size="small"
        label={t("mining.system", "System")}
        value={system}
        onChange={(e) => updateParam("system", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="stanton">Stanton</MenuItem>
        <MenuItem value="pyro">Pyro</MenuItem>
        <MenuItem value="nyx">Nyx</MenuItem>
      </TextField>
      <TextField
        select fullWidth size="small"
        label={t("mining.method", "Mining Method")}
        value={method}
        onChange={(e) => updateParam("mining_method", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="ship">Ship</MenuItem>
        <MenuItem value="ground">Ground Vehicle</MenuItem>
        <MenuItem value="fps">FPS (Hand)</MenuItem>
      </TextField>
      <TextField
        select fullWidth size="small"
        label={t("mining.rarity", "Rarity")}
        value={rarity}
        onChange={(e) => updateParam("rarity", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {["common", "uncommon", "rare", "epic", "legendary"].map((r) => (
          <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>
        ))}
      </TextField>
    </Stack>
  )

  return (
    <>
      <FilterSidebarLayout filters={filtersContent} filterTitle={t("mining.filters", "Filters")}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        )}
        {error && <Alert severity="error">{t("mining.error", "Failed to load ores.")}</Alert>}
        {data && (
          <>
            <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
              {data.ores.map((ore) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ore.element_id}>
                  <OreCard ore={ore} onClick={() => setSelectedOre(ore.name)} />
                </Grid>
              ))}
            </Grid>
            {data.ores.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <Typography color="text.secondary">{t("mining.noOres", "No ores found.")}</Typography>
              </Box>
            )}
            {data.total > PAGE_SIZE && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={Math.ceil(data.total / PAGE_SIZE)}
                  page={page}
                  onChange={(_, p) => updateParam("page", String(p))}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </FilterSidebarLayout>
      <MiningOreDetailModal
        oreName={selectedOre}
        open={!!selectedOre}
        onClose={() => setSelectedOre(null)}
      />
    </>
  )
}

const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

function OreCard({ ore, onClick }: { ore: MiningOreSearchResult; onClick: () => void }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {ore.resource_name || ore.name}
            </Typography>
            {ore.rarity && (
              <Chip
                label={ore.rarity}
                size="small"
                sx={{ ...microChip, bgcolor: RARITY_COLORS[ore.rarity.toLowerCase()] || "#757575", color: "#fff", ml: 0.5 }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
            {ore.instability != null && (
              <Chip label={`Inst: ${ore.instability.toFixed(0)}`} size="small" variant="outlined" sx={microChip} />
            )}
            {ore.resistance != null && (
              <Chip label={`Res: ${ore.resistance.toFixed(2)}`} size="small" variant="outlined" sx={microChip} />
            )}
          </Stack>
          {ore.market_price != null && (
            <Typography variant="caption" color="success.main" fontWeight={600}>
              {ore.market_price.toLocaleString()} aUEC
            </Typography>
          )}
          {ore.top_locations.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {ore.top_locations.slice(0, 2).map((l) => l.location_name).join(", ")}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
