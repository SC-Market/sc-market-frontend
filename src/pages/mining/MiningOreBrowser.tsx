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
import { useSearchOresQuery, type OreSearchResult } from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import { MiningOreDetailModal } from "./MiningOreDetailModal"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const PAGE_SIZE = 24
const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

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

  const { data, isLoading, error } = useSearchOresQuery({
    text: debouncedSearch || undefined,
    system: system || undefined,
    miningMethod: (method as any) || undefined,
    rarity: (rarity as any) || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField
        fullWidth size="small"
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
                <Grid item xs={12} sm={6} md={4} lg={3} key={ore.name}>
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

function OreCard({ ore, onClick }: { ore: OreSearchResult; onClick: () => void }) {
  const rarityColor = RARITY_COLORS[(ore.rarity || "").toLowerCase()] || "#757575"
  const displayName = ore.resourceName ? friendlyName(ore.resourceName) : friendlyName(ore.name)

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderLeft: `3px solid ${rarityColor}` }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, pb: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {displayName}
            </Typography>
            {ore.rarity && (
              <Chip
                label={ore.rarity.charAt(0).toUpperCase() + ore.rarity.slice(1)}
                size="small"
                sx={{ ...microChip, bgcolor: rarityColor, color: "#fff", ml: 0.5 }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            {ore.instability != null && (
              <Chip label={`Inst: ${ore.instability.toFixed(0)}`} size="small" variant="outlined" sx={microChip} />
            )}
            {ore.resistance != null && (
              <Chip label={`Res: ${ore.resistance.toFixed(2)}`} size="small" variant="outlined" sx={microChip} />
            )}
            {ore.explosionMultiplier != null && (
              <Chip label={`Exp: ${ore.explosionMultiplier.toFixed(0)}`} size="small" variant="outlined" sx={microChip} />
            )}
          </Stack>
        </CardContent>
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
          {ore.marketPrice != null && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Market Price</Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                {ore.marketPrice.toLocaleString()} aUEC
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Locations</Typography>
            <Typography variant="caption">{ore.locationCount}</Typography>
          </Box>
          {(ore.topLocations?.length ?? 0) > 0 && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mt: 0.25 }}>
              {(ore.topLocations || []).slice(0, 2).map((l) => friendlyName(l.name)).join(", ")}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  )
}
