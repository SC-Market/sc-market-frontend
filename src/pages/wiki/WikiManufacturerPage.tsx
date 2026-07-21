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
  Chip,
  Stack,
  Divider,
  Box,
} from "@mui/material"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate } from "react-router-dom"
import { useGetManufacturerDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { FRONTEND_URL } from "../../util/constants"

export function WikiManufacturerPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: manufacturer, isLoading, error } = useGetManufacturerDetailQuery({ id: id! })

  const handleItemClick = (itemId: string) => {
    navigate(`/wiki/items/${itemId}`)
  }

  const seoTitle = manufacturer
    ? `${manufacturer.manufacturer} — Star Citizen Manufacturer | SC Market`
    : t("wiki.manufacturerDetail.title", "Manufacturer Details")
  const seoDescription = manufacturer
    ? `${manufacturer.manufacturer} manufactures ${manufacturer.item_count} items in Star Citizen. Browse their full product catalog on SC Market.`.slice(0, 160)
    : undefined

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/wiki/manufacturers/${id}`}
      headerTitle={manufacturer?.manufacturer ?? t("wiki.manufacturerDetail.title", "Manufacturer Details")}
      breadcrumbs={[
        { label: "Wiki", href: "/wiki" },
        { label: "Manufacturers", href: "/wiki/manufacturers" },
        { label: manufacturer?.manufacturer ?? "Detail" },
      ]}
      sidebarOpen={true}
      maxWidth="md"
      isLoading={isLoading}
      error={error}
      skeleton={<Grid item xs={12}><DetailPageSkeleton /></Grid>}
    >
      {manufacturer && (
      <Grid item xs={12}>
        <Helmet>
          <title>{seoTitle}</title>
          {seoDescription && <meta name="description" content={seoDescription} />}
          <link rel="canonical" href={`${FRONTEND_URL}/wiki/manufacturers/${id}`} />
          <meta property="og:title" content={seoTitle} />
          {seoDescription && <meta property="og:description" content={seoDescription} />}
          <meta property="og:url" content={`${FRONTEND_URL}/wiki/manufacturers/${id}`} />
        </Helmet>
        <Card sx={{ mb: 3 }}>
          <CardContent>
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
      )}
    </StandardPageLayout>
  )
}
