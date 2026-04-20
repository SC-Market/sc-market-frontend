/**
 * Wiki Ship Browser
 * 
 * Ship grid with focus/manufacturer filters
 * Task 8.10.4
 */

import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
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
} from "@mui/material"
import { useSearchWikiShipsQuery } from "../../store/wikiApi"
import { useNavigate } from "react-router-dom"

export function WikiShipBrowser() {
  const navigate = useNavigate()
  const [manufacturer, setManufacturer] = useState("")
  const [focus, setFocus] = useState("")
  const [size, setSize] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useSearchWikiShipsQuery({
    manufacturer: manufacturer || undefined,
    focus: focus || undefined,
    size: size || undefined,
    page,
    page_size: 20,
  })

  const handleShipClick = (shipId: string) => {
    navigate(`/wiki/ships/${shipId}`)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ships Database
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse all ships with detailed specifications and loadouts
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Manufacturer</InputLabel>
                <Select
                  value={manufacturer}
                  label="Manufacturer"
                  onChange={(e) => setManufacturer(e.target.value)}
                >
                  <MenuItem value="">All Manufacturers</MenuItem>
                  <MenuItem value="Aegis Dynamics">Aegis Dynamics</MenuItem>
                  <MenuItem value="Anvil Aerospace">Anvil Aerospace</MenuItem>
                  <MenuItem value="Crusader Industries">Crusader Industries</MenuItem>
                  <MenuItem value="Drake Interplanetary">Drake Interplanetary</MenuItem>
                  <MenuItem value="Origin Jumpworks">Origin Jumpworks</MenuItem>
                  <MenuItem value="RSI">Roberts Space Industries</MenuItem>
                  <MenuItem value="Misc">MISC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Focus</InputLabel>
                <Select
                  value={focus}
                  label="Focus"
                  onChange={(e) => setFocus(e.target.value)}
                >
                  <MenuItem value="">All Focus Types</MenuItem>
                  <MenuItem value="Combat">Combat</MenuItem>
                  <MenuItem value="Exploration">Exploration</MenuItem>
                  <MenuItem value="Mining">Mining</MenuItem>
                  <MenuItem value="Cargo">Cargo</MenuItem>
                  <MenuItem value="Racing">Racing</MenuItem>
                  <MenuItem value="Multi-Role">Multi-Role</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Size</InputLabel>
                <Select
                  value={size}
                  label="Size"
                  onChange={(e) => setSize(e.target.value)}
                >
                  <MenuItem value="">All Sizes</MenuItem>
                  <MenuItem value="Small">Small</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Large">Large</MenuItem>
                  <MenuItem value="Capital">Capital</MenuItem>
                </Select>
              </FormControl>
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
          Failed to load ships. Please try again.
        </Alert>
      )}

      {data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {data.total} ships
          </Typography>

          <Grid container spacing={3}>
            {data.ships.map((ship) => (
              <Grid item xs={12} sm={6} md={4} key={ship.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => handleShipClick(ship.id)}
                >
                  {ship.image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={ship.image_url}
                      alt={ship.name}
                      sx={{ objectFit: "cover", bgcolor: "background.default" }}
                    />
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {ship.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                      {ship.focus && (
                        <Chip label={ship.focus} size="small" color="primary" />
                      )}
                      {ship.size && (
                        <Chip label={ship.size} size="small" />
                      )}
                    </Stack>
                    {ship.manufacturer && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        {ship.manufacturer}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

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
    </Box>
  )
}
