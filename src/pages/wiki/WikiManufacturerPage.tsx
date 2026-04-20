/**
 * Wiki Manufacturer Page
 * 
 * Lore + all items by that manufacturer
 * Task 8.10.8
 */

import React from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Box,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate } from "react-router-dom"
import { useGetManufacturerDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function WikiManufacturerPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: manufacturer, isLoading, error } = useGetManufacturerDetailQuery({ id: id! })

  const handleItemClick = (itemId: string) => {
    navigate(`/wiki/items/${itemId}`)
  }

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.manufacturerDetail.title", "Manufacturer Details")}
        headerTitle={t("wiki.manufacturerDetail.title", "Manufacturer Details")}
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

  if (error || !manufacturer) {
    return (
      <StandardPageLayout
        title={t("wiki.manufacturerDetail.title", "Manufacturer Details")}
        headerTitle={t("wiki.manufacturerDetail.title", "Manufacturer Details")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">Failed to load manufacturer details. Please try again.</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("wiki.manufacturerDetail.title", "Manufacturer Details")}
      headerTitle={manufacturer.manufacturer}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {manufacturer.manufacturer}
            </Typography>
            {manufacturer.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {manufacturer.description}
              </Typography>
            )}
            <Chip
              label={`${manufacturer.item_count} items`}
              color="primary"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        <Typography variant="h5" gutterBottom>
          Products
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {manufacturer.items.map((item) => (
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {manufacturer.items.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
            <Typography color="text.secondary">
              {t("wiki.manufacturerDetail.noItems", "No results found. Try adjusting your filters.")}
            </Typography>
          </Box>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
