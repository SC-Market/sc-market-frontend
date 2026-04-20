/**
 * Wiki Commodity Browser
 * 
 * Resources grouped by category, mining stats
 * Task 8.10.6
 */

import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
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
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { useSearchWikiCommoditiesQuery } from "../../store/wikiApi"
import { CheckCircle, Cancel } from "@mui/icons-material"

export function WikiCommodityBrowser() {
  const [category, setCategory] = useState("")
  const [canBeMined, setCanBeMined] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useSearchWikiCommoditiesQuery({
    category: category || undefined,
    can_be_mined: canBeMined,
    page,
    page_size: 20,
  })

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Commodities & Resources
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse all resources with acquisition methods and mining statistics
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Metals">Metals</MenuItem>
                  <MenuItem value="Gases">Gases</MenuItem>
                  <MenuItem value="Minerals">Minerals</MenuItem>
                  <MenuItem value="Agricultural">Agricultural</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Processed">Processed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={canBeMined === true}
                    onChange={(e) => setCanBeMined(e.target.checked ? true : undefined)}
                  />
                }
                label="Mineable only"
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
          Failed to load commodities. Please try again.
        </Alert>
      )}

      {data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {data.total} resources
          </Typography>

          <Grid container spacing={2}>
            {data.commodities.map((commodity) => (
              <Grid item xs={12} sm={6} md={4} key={commodity.resource_id}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      {commodity.image_url && (
                        <Box
                          component="img"
                          src={commodity.image_url}
                          alt={commodity.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: "contain",
                            bgcolor: "background.default",
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {commodity.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1 }} flexWrap="wrap">
                          <Chip label={commodity.resource_category} size="small" color="primary" />
                          {commodity.resource_subcategory && (
                            <Chip label={commodity.resource_subcategory} size="small" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Acquisition Methods:
                        </Typography>
                        <List dense disablePadding>
                          {commodity.can_be_mined && (
                            <ListItem disablePadding>
                              <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              <ListItemText primary="Mining" primaryTypographyProps={{ variant: "caption" }} />
                            </ListItem>
                          )}
                          {commodity.can_be_purchased && (
                            <ListItem disablePadding>
                              <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              <ListItemText primary="Purchase" primaryTypographyProps={{ variant: "caption" }} />
                            </ListItem>
                          )}
                          {commodity.can_be_salvaged && (
                            <ListItem disablePadding>
                              <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              <ListItemText primary="Salvage" primaryTypographyProps={{ variant: "caption" }} />
                            </ListItem>
                          )}
                          {commodity.can_be_looted && (
                            <ListItem disablePadding>
                              <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                              <ListItemText primary="Loot" primaryTypographyProps={{ variant: "caption" }} />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Stack>
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
