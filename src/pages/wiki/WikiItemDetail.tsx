/**
 * Wiki Item Detail
 * 
 * Full stats, description, craftable from blueprints, rewarded by missions
 * Links to market listings with active listing count and price range
 * Task 8.10.3
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
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Stack,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetWikiItemDetailQuery } from "../../store/wikiApi"
import { ShoppingCart, Gavel } from "@mui/icons-material"

export function WikiItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, error } = useGetWikiItemDetailQuery(id!)

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !item) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load item details. Please try again.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {item.image_url && (
                  <Box
                    component="img"
                    src={item.image_url}
                    alt={item.name}
                    sx={{
                      width: 200,
                      height: 200,
                      objectFit: "contain",
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {item.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                    {item.type && <Chip label={item.type} color="primary" />}
                    {item.size && <Chip label={`Size ${item.size}`} />}
                    {item.grade && <Chip label={`Grade ${item.grade}`} />}
                    {item.manufacturer && <Chip label={item.manufacturer} />}
                  </Stack>

                  {/* Market Stats */}
                  {item.market_stats.listing_count > 0 && (
                    <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Market Availability
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.market_stats.listing_count} active listing
                        {item.market_stats.listing_count !== 1 ? "s" : ""}
                      </Typography>
                      {item.market_stats.min_price && item.market_stats.max_price && (
                        <Typography variant="body2" color="text.secondary">
                          Price range: {item.market_stats.min_price.toLocaleString()} -{" "}
                          {item.market_stats.max_price.toLocaleString()} aUEC
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/market?item=${item.id}`)}
                      >
                        View on Market
                      </Button>
                    </Card>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Attributes */}
          {Object.keys(item.attributes).length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Item Attributes
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {Object.entries(item.attributes).map(([key, value]) => (
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
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Craftable From */}
          {item.craftable_from.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Craftable From
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {item.craftable_from.map((blueprint) => (
                  <Box key={blueprint.blueprint_id} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {blueprint.blueprint_name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {blueprint.rarity && (
                        <Chip label={blueprint.rarity} size="small" />
                      )}
                      {blueprint.tier && (
                        <Chip label={`Tier ${blueprint.tier}`} size="small" />
                      )}
                    </Stack>
                    {blueprint.crafting_time_seconds && (
                      <Typography variant="caption" color="text.secondary">
                        Crafting time: {Math.floor(blueprint.crafting_time_seconds / 60)}m
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Rewarded By Missions */}
          {item.rewarded_by.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rewarded By Missions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {item.rewarded_by.map((mission) => (
                  <Box key={`${mission.mission_id}-${mission.blueprint_id}`} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {mission.mission_name}
                    </Typography>
                    {mission.star_system && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {mission.star_system}
                      </Typography>
                    )}
                    <Typography variant="caption" color="primary">
                      Drop chance: {mission.drop_probability.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      via {mission.blueprint_name}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
