/**
 * Wiki Item Browser
 * 
 * Search and filter game items by type, size, grade, manufacturer
 * Task 8.10.2
 */

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Box,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useSearchItemsQuery } from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function WikiItemBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [type, setType] = useState("")
  const [size, setSize] = useState("")
  const [grade, setGrade] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchText, 300)

  const { data, isLoading, error } = useSearchItemsQuery({
    text: debouncedSearch || undefined,
    type: type || undefined,
    size: size || undefined,
    grade: grade || undefined,
    manufacturer: manufacturer || undefined,
    page,
    page_size: 20,
  })

  const handleItemClick = (itemId: string) => {
    navigate(`/wiki/items/${itemId}`)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <StandardPageLayout
      title={t("wiki.items.title", "Game Items Database")}
      headerTitle={t("wiki.items.title", "Game Items Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse all game items with detailed stats and information
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search items"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by name..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={type}
                    label="Type"
                    size="small"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="WeaponGun">Weapon Gun</MenuItem>
                    <MenuItem value="WeaponMissile">Weapon Missile</MenuItem>
                    <MenuItem value="Shield">Shield</MenuItem>
                    <MenuItem value="PowerPlant">Power Plant</MenuItem>
                    <MenuItem value="Cooler">Cooler</MenuItem>
                    <MenuItem value="QuantumDrive">Quantum Drive</MenuItem>
                    <MenuItem value="Armor">Armor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={size}
                    label="Size"
                    size="small"
                    onChange={(e) => setSize(e.target.value)}
                  >
                    <MenuItem value="">All Sizes</MenuItem>
                    <MenuItem value="1">Size 1</MenuItem>
                    <MenuItem value="2">Size 2</MenuItem>
                    <MenuItem value="3">Size 3</MenuItem>
                    <MenuItem value="4">Size 4</MenuItem>
                    <MenuItem value="5">Size 5</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={grade}
                    label="Grade"
                    size="small"
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <MenuItem value="">All Grades</MenuItem>
                    <MenuItem value="A">Grade A</MenuItem>
                    <MenuItem value="B">Grade B</MenuItem>
                    <MenuItem value="C">Grade C</MenuItem>
                    <MenuItem value="D">Grade D</MenuItem>
                    <MenuItem value="F">Grade F</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g., Aegis Dynamics"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load items. Please try again.
          </Alert>
        )}

        {data && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Found {data.total} items
            </Typography>

            <Grid container spacing={2}>
              {data.items.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleItemClick(item.id)}
                  >
                    {item.image_url && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.image_url}
                        alt={item.name}
                        sx={{ objectFit: "contain", bgcolor: "background.default" }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                        {item.type && (
                          <Chip label={item.type} size="small" color="primary" />
                        )}
                        {item.size && (
                          <Chip label={`S${item.size}`} size="small" />
                        )}
                        {item.grade && (
                          <Chip label={`Grade ${item.grade}`} size="small" />
                        )}
                      </Stack>
                      {item.manufacturer && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                          {item.manufacturer}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {data.items.length === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                <Typography color="text.secondary">
                  {t("wiki.items.noResults", "No results found. Try adjusting your filters.")}
                </Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
