/**
 * Wiki Ship Detail
 * 
 * Loadout diagram, description, components
 * Task 8.10.5
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
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
import { useParams } from "react-router-dom"
import { useGetWikiShipDetailQuery } from "../../store/wikiApi"

export function WikiShipDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: ship, isLoading, error } = useGetWikiShipDetailQuery(id!)

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !ship) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load ship details. Please try again.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {ship.image_url && (
                  <Box
                    component="img"
                    src={ship.image_url}
                    alt={ship.name}
                    sx={{
                      width: 300,
                      height: 200,
                      objectFit: "cover",
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {ship.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                    {ship.manufacturer && <Chip label={ship.manufacturer} color="primary" />}
                    {ship.focus && <Chip label={ship.focus} />}
                    {ship.size && <Chip label={ship.size} />}
                    {ship.movement_class && <Chip label={ship.movement_class} />}
                  </Stack>
                  {ship.description && (
                    <Typography variant="body1" color="text.secondary" paragraph>
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
                <Typography variant="h6" gutterBottom>
                  Ship Specifications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {Object.entries(ship.attributes)
                        .filter(([key]) => !key.includes("loadout"))
                        .map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                <Typography variant="h6" gutterBottom>
                  Default Loadout
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    maxHeight: 400,
                    overflow: "auto",
                    bgcolor: "background.default",
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  <pre style={{ margin: 0, fontSize: "0.875rem" }}>
                    {JSON.stringify(ship.default_loadout, null, 2)}
                  </pre>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
