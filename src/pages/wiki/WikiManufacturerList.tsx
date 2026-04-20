/**
 * Wiki Manufacturer List
 * 
 * List of all manufacturers with item counts
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useGetWikiManufacturersQuery } from "../../store/wikiApi"
import { BusinessCenter } from "@mui/icons-material"

export function WikiManufacturerList() {
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetWikiManufacturersQuery()

  const handleManufacturerClick = (manufacturer: string) => {
    navigate(`/wiki/manufacturers/${encodeURIComponent(manufacturer)}`)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load manufacturers. Please try again.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manufacturers
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse all manufacturers and their products
      </Typography>

      <Grid container spacing={2}>
        {manufacturers?.map((manufacturer) => (
          <Grid item xs={12} sm={6} md={4} key={manufacturer.manufacturer}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleManufacturerClick(manufacturer.manufacturer)}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <BusinessCenter fontSize="large" color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {manufacturer.manufacturer}
                    </Typography>
                    <Chip
                      label={`${manufacturer.item_count} items`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
