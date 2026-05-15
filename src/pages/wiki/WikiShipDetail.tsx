/**
 * Wiki Ship Detail
 *
 * Loadout diagram, description, components, and ship silhouette.
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Stack,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useParams, useNavigate } from "react-router-dom"
import { useGetShipDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { ShipSilhouette, getShipColor } from "../../components/wiki/ShipSilhouette"
import { FALLBACK_IMAGE_URL } from "../../util/constants"

interface LoadoutNode {
  name?: string
  item_name?: string
  display_name?: string
  game_item_id?: string
  item_id?: string
  id?: string
  type?: string
  item_type?: string
  [key: string]: LoadoutNode | LoadoutNode[] | string | number | boolean | null | undefined
}

function LoadoutTree({ data, navigate, depth = 0 }: {
  data: LoadoutNode | LoadoutNode[] | string | number | null | undefined
  navigate: (path: string) => void
  depth?: number
}) {
  if (!data || typeof data !== "object") return <Typography variant="caption">{String(data)}</Typography>

  const entries = Array.isArray(data)
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data)

  return (
    <Stack spacing={0} sx={{ pl: depth > 0 ? 2 : 0, borderLeft: depth > 0 ? "1px solid" : "none", borderColor: "divider" }}>
      {entries.map(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const name = value.name || value.item_name || value.display_name
          const itemId = value.game_item_id || value.item_id || value.id
          const type = value.type || value.item_type
          return (
            <Box key={key} sx={{ py: 0.25 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                  {key.replace(/_/g, " ")}
                </Typography>
                {name ? (
                  <Chip
                    label={name}
                    size="small"
                    sx={{ height: 20, fontSize: "0.7rem", cursor: itemId ? "pointer" : "default" }}
                    onClick={itemId ? () => navigate(`/wiki/items/${itemId}`) : undefined}
                    color={itemId ? "primary" : "default"}
                    variant="outlined"
                  />
                ) : null}
                {type && <Typography variant="caption" color="text.disabled">{type}</Typography>}
              </Stack>
              {Object.keys(value).length > 3 && (
                <LoadoutTree data={value} navigate={navigate} depth={depth + 1} />
              )}
            </Box>
          )
        }
        if (Array.isArray(value) && value.length > 0) {
          return (
            <Box key={key} sx={{ py: 0.25 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {key.replace(/_/g, " ")} ({value.length})
              </Typography>
              <LoadoutTree data={value} navigate={navigate} depth={depth + 1} />
            </Box>
          )
        }
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          return (
            <Stack key={key} direction="row" spacing={1} sx={{ py: 0.125 }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                {key.replace(/_/g, " ")}
              </Typography>
              <Typography variant="caption">{String(value)}</Typography>
            </Stack>
          )
        }
        return null
      })}
    </Stack>
  )
}

export function WikiShipDetail() {
  const theme = useTheme<ExtendedTheme>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ship, isLoading, error } = useGetShipDetailQuery({ id: id! })

  if (isLoading) {
    return (
      <StandardPageLayout title="Ship Details" headerTitle="Ship Details" sidebarOpen={true} maxWidth="xl">
        <Grid item xs={12}><DetailPageSkeleton /></Grid>
      </StandardPageLayout>
    )
  }

  if (error || !ship) {
    return (
      <StandardPageLayout title="Ship Details" headerTitle="Ship Details" sidebarOpen={true} maxWidth="xl">
        <Grid item xs={12}>
          <Alert severity="error">Failed to load ship details. Please try again.</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const shipColor = getShipColor(ship.career, ship.role)

  return (
    <StandardPageLayout title="Ship Details" headerTitle={ship.name} sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <Grid container spacing={3}>

          {/* Header card: silhouette + info */}
          <Grid item xs={12}>
            <Card sx={{ overflow: "hidden" }}>
              {/* Career-color accent bar */}
              <Box sx={{ height: 4, bgcolor: shipColor }} />
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">

                  {/* Silhouette or fallback */}
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
                      <ShipSilhouette
                        shipCode={ship.ship_code}
                        career={ship.career}
                        role={ship.role}
                        height={150}
                        opacity={0.9}
                      />
                    ) : ship.image_url ? (
                      <Box
                        component="img"
                        src={ship.image_url}
                        alt={ship.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </Box>

                  {/* Ship info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                      {ship.manufacturer && <Chip label={ship.manufacturer} color="primary" />}
                      {ship.career && <Chip label={ship.career} color="secondary" variant="outlined" />}
                      {ship.role && <Chip label={ship.role} color="primary" variant="outlined" />}
                      {ship.focus && <Chip label={ship.focus} />}
                      {ship.size && <Chip label={ship.size} />}
                      {ship.movement_class && <Chip label={ship.movement_class} />}
                    </Stack>

                    {/* Key stats row */}
                    <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                      {ship.crew_size != null && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Crew:</strong> {ship.crew_size}
                        </Typography>
                      )}
                      {(ship.length_m != null || ship.width_m != null || ship.height_m != null) && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Dimensions:</strong>{" "}
                          {[ship.length_m, ship.width_m, ship.height_m]
                            .filter(v => v != null)
                            .map(v => `${v}m`)
                            .join(" × ")}
                        </Typography>
                      )}
                    </Stack>

                    {ship.description && (
                      <Typography variant="body1" color="text.secondary">
                        {ship.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Ship Attributes */}
          {Object.keys(ship.attributes).length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Ship Specifications</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(ship.attributes)
                          .filter(([key]) => !key.includes("loadout"))
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

          {/* Default Loadout */}
          {ship.default_loadout && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Default Loadout</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    <LoadoutTree data={ship.default_loadout} navigate={navigate} />
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
