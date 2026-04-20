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
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useGetWikiManufacturersQuery } from "../../store/wikiApi"
import { BusinessCenter } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function WikiManufacturerList() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const { data: manufacturers, isLoading, error } = useGetWikiManufacturersQuery()

  const handleManufacturerClick = (manufacturer: string) => {
    navigate(`/wiki/manufacturers/${encodeURIComponent(manufacturer)}`)
  }

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.manufacturers.title", "Manufacturers")}
        headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error) {
    return (
      <StandardPageLayout
        title={t("wiki.manufacturers.title", "Manufacturers")}
        headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">Failed to load manufacturers. Please try again.</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("wiki.manufacturers.title", "Manufacturers")}
      headerTitle={t("wiki.manufacturers.title", "Manufacturers")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
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
      </Grid>
    </StandardPageLayout>
  )
}
