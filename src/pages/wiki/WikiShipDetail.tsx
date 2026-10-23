/**
 * Wiki Ship Detail — full page (mobile) view
 */

import React from "react"
import { Helmet } from "@unhead/react/helmet"
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Alert, Divider, Table, TableBody, TableCell,
  TableContainer, TableRow, Paper, Stack,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate } from "react-router-dom"
import { useGetShipDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { ShipSilhouette, getShipColor } from "../../components/wiki/ShipSilhouette"
import { FALLBACK_IMAGE_URL, FRONTEND_URL } from "../../util/constants"
import { formatShipRole, formatShipCareer, getShipRoleColor } from "../../util/shipDisplay"
import { WIKI_PATHS } from "../../routes/paths"
import { AnswerLead } from "../../components/game-data/AnswerSummary"
import { buildShipSummary } from "../../util/answerContent"

export function WikiShipDetail() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ship, isLoading, error } = useGetShipDetailQuery({ id: id! })

  if (isLoading) {
    return (
      <StandardPageLayout title={t("wiki.shipDetail.title", "Ship Details")} headerTitle={t("wiki.shipDetail.title", "Ship Details")} sidebarOpen={true} maxWidth="md">
        <Grid item xs={12}><DetailPageSkeleton /></Grid>
      </StandardPageLayout>
    )
  }

  if (error || !ship) {
    return (
      <StandardPageLayout title={t("wiki.shipDetail.title", "Ship Details")} headerTitle={t("wiki.shipDetail.title", "Ship Details")} sidebarOpen={true} maxWidth="md">
        <Grid item xs={12}>
          <Alert severity="error">{t("wiki.shipDetail.failedToLoad", "Failed to load ship details. Please try again.")}</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const shipColor = getShipColor(ship.career, ship.role, ship.focus)
  const chipColor = getShipRoleColor(ship.career, ship.role, ship.focus)

  const seoTitle = `${ship.name} — Star Citizen Ship | SC Market`
  const seoDescription = `${ship.name}${ship.manufacturer ? " by " + ship.manufacturer : ""} — ${ship.focus || ship.role || "spacecraft"}. Specs, loadout, and market availability in Star Citizen.`.slice(0, 160)
  // Built from the resolved ship, not the raw path param: this page is reachable
  // by full UUID or short slug, and the sitemap only lists the slug form.
  const canonicalPath = WIKI_PATHS.ship(ship.id, ship.name)
  const canonicalUrl = `${FRONTEND_URL}${canonicalPath}`
  const ogImage = ship.image_url || `${FRONTEND_URL}/logo512.png`

  return (
    <StandardPageLayout title={seoTitle} description={seoDescription} canonicalUrl={canonicalPath} headerTitle={ship.name} breadcrumbs={[{ label: t("wiki.shipDetail.breadcrumbWiki", "Wiki"), href: WIKI_PATHS.hub }, { label: t("wiki.shipDetail.breadcrumbShips", "Ships & Vehicles"), href: WIKI_PATHS.ships }, { label: ship.name }]} sidebarOpen={true} maxWidth="md">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: ship.name,
            description: ship.description || seoDescription,
            image: ship.image_url || undefined,
            url: canonicalUrl,
            ...(ship.manufacturer && { manufacturer: { "@type": "Organization", name: ship.manufacturer } }),
            category: [ship.career, ship.role, ship.focus].filter(Boolean).join(" / "),
            additionalProperty: [
              ...(ship.crew_size ? [{ "@type": "PropertyValue", name: "Crew Size", value: ship.crew_size }] : []),
              ...(ship.length_m ? [{ "@type": "PropertyValue", name: "Length", value: `${ship.length_m}m` }] : []),
            ],
          })}
        </script>
      </Helmet>
      <Grid item xs={12}>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <AnswerLead summary={buildShipSummary(ship, t)} />
            <Card sx={{ overflow: "hidden" }}>
              <Box sx={{ height: 4, bgcolor: shipColor }} />
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 240 },
                      flexShrink: 0,
                      height: 180,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        bgcolor: shipColor,
                        opacity: 0.08,
                      },
                    }}
                  >
                    {ship.ship_code ? (
                      <ShipSilhouette shipCode={ship.ship_code} career={ship.career} role={ship.role} focus={ship.focus} height={150} opacity={0.9} />
                    ) : ship.image_url ? (
                      <Box component="img" src={ship.image_url} alt={ship.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                      {ship.manufacturer && <Chip label={ship.manufacturer} color="primary" />}
                      {ship.career && <Chip label={formatShipCareer(ship.career)} color={chipColor} variant="outlined" />}
                      {ship.role && <Chip label={formatShipRole(ship.role)} color={chipColor} />}
                      {ship.focus && !ship.role && <Chip label={ship.focus} />}
                      {ship.size && <Chip label={t("wiki.shipDetail.sizeChip", "Size {{size}}", { size: ship.size })} />}
                      {ship.movement_class && <Chip label={ship.movement_class} />}
                    </Stack>

                    <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                      {ship.crew_size != null && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t("wiki.shipDetail.crew", "Crew:")}</strong> {ship.crew_size}
                        </Typography>
                      )}
                      {(ship.length_m != null || ship.width_m != null || ship.height_m != null) && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t("wiki.shipDetail.dimensions", "Dimensions:")}</strong>{" "}
                          {[ship.length_m, ship.width_m, ship.height_m]
                            .filter(v => v != null)
                            .map(v => `${v}m`)
                            .join(" × ")}
                        </Typography>
                      )}
                    </Stack>

                    {ship.description && (
                      <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                        {ship.description.replace(/\\n/g, "\n")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {Object.keys(ship.attributes).length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("wiki.shipDetail.specifications", "Ship Specifications")}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(ship.attributes)
                          .filter(([key]) => !key.includes("loadout") && key !== "description" && key !== "ship_focus")
                          .map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                                {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </TableCell>
                              <TableCell>
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {ship.default_loadout && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("wiki.shipDetail.defaultLoadout", "Default Loadout")}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {ship.default_loadout}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
