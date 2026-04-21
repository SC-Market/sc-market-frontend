/**
 * BlueprintDetail - Display comprehensive blueprint information
 * 
 * Displays full blueprint information including:
 * - Full blueprint metadata (name, description, rarity, tier, etc.)
 * - Ingredient list with quantities and quality requirements
 * - Missions that reward this blueprint
 * - Crafting recipe details
 * - Market pricing for ingredients
 * - User inventory status
 * 
 * Task 12.3 - Create BlueprintDetail component
 * Requirements: 50.1, 50.2, 50.3, 50.4, 50.5, 50.6, 50.7, 50.8, 50.9, 50.10
 */

import React from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetBlueprintDetailQuery } from "../../store/api/v2/market"

/**
 * BlueprintDetail Component
 * 
 * Features:
 * - Displays full blueprint information
 * - Lists all required ingredients with names (50.1)
 * - Displays required quantity for each ingredient (50.2)
 * - Displays ingredient quality requirements if applicable (50.3)
 * - Highlights ingredients the player doesn't have (50.4)
 * - Displays ingredient icons or images (50.5)
 * - Supports clicking ingredients to view details (50.6)
 * - Displays total ingredient count (50.7)
 * - Groups ingredients by category (50.8)
 * - Displays alternative ingredients if substitutions are allowed (50.9)
 * - Calculates total material cost based on market prices (50.10)
 * - Shows missions that reward this blueprint
 * - Displays crafting recipe details
 * - Responsive layout
 */
export function BlueprintDetail() {
  const { blueprintId } = useParams<{ blueprintId: string }>()
  const navigate = useNavigate()

  // Fetch blueprint detail
  const { data, isLoading, error } = useGetBlueprintDetailQuery({
    blueprintId: blueprintId!,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load blueprint details. Please try again.
        </Alert>
      </Box>
    )
  }

  const { blueprint, output_item, ingredients, missions_rewarding, crafting_recipe, user_owns, user_acquisition } = data

  // Group ingredients by category (Requirement 50.8)
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.game_item.type || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(ingredient)
    return acc
  }, {} as Record<string, typeof ingredients>)

  // Calculate total material cost (Requirement 50.10)
  const totalMaterialCost = ingredients.reduce((sum, ingredient) => {
    const avgPrice = ingredient.market_price_min && ingredient.market_price_max
      ? (ingredient.market_price_min + ingredient.market_price_max) / 2
      : ingredient.market_price_min || ingredient.market_price_max || 0
    return sum + (avgPrice * ingredient.quantity_required)
  }, 0)

  // Count total ingredients (Requirement 50.7)
  const totalIngredientCount = ingredients.length

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Blueprint Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            {/* Blueprint Icon */}
            {(blueprint.icon_url || output_item.icon_url) && (
              <Box
                component="img"
                src={blueprint.icon_url || output_item.icon_url}
                alt={blueprint.blueprint_name}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  bgcolor: "background.default",
                  borderRadius: 2,
                  p: 2,
                }}
              />
            )}

            {/* Blueprint Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {blueprint.blueprint_name}
              </Typography>

              {/* Blueprint Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 0.5 }}>
                {blueprint.rarity && (
                  <Chip label={blueprint.rarity} size="small" color="primary" />
                )}
                {blueprint.tier && (
                  <Chip label={`Tier ${blueprint.tier}`} size="small" color="secondary" />
                )}
                {blueprint.item_category && (
                  <Chip label={blueprint.item_category} size="small" variant="outlined" />
                )}
                {blueprint.item_subcategory && (
                  <Chip label={blueprint.item_subcategory} size="small" variant="outlined" />
                )}
                {user_owns && (
                  <Chip label="✓ Owned" size="small" color="success" />
                )}
              </Stack>

              {/* Blueprint Description */}
              {blueprint.blueprint_description && (
                <Typography variant="body1" paragraph>
                  {blueprint.blueprint_description}
                </Typography>
              )}

              {/* Output Item */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Crafts
                </Typography>
                <Typography variant="h6">
                  {blueprint.output_quantity > 1 && `${blueprint.output_quantity}x `}
                  {output_item.name}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Blueprint Metadata Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {blueprint.crafting_station_type && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Crafting Station
                </Typography>
                <Typography variant="body2">{blueprint.crafting_station_type}</Typography>
              </Grid>
            )}

            {blueprint.crafting_time_seconds && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Crafting Time
                </Typography>
                <Typography variant="body2">
                  {formatCraftingTime(blueprint.crafting_time_seconds)}
                </Typography>
              </Grid>
            )}

            {blueprint.required_skill_level && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Required Skill Level
                </Typography>
                <Typography variant="body2">{blueprint.required_skill_level}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* User Acquisition Info */}
      {user_owns && user_acquisition && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Acquisition Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Acquired On
                </Typography>
                <Typography variant="body2">
                  {new Date(user_acquisition.acquisition_date).toLocaleDateString()}
                </Typography>
              </Grid>

              {user_acquisition.acquisition_method && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Method
                  </Typography>
                  <Typography variant="body2">{user_acquisition.acquisition_method}</Typography>
                </Grid>
              )}

              {user_acquisition.acquisition_location && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2">{user_acquisition.acquisition_location}</Typography>
                </Grid>
              )}
            </Grid>

            {user_acquisition.acquisition_notes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body2">{user_acquisition.acquisition_notes}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingredients Section (Requirements 50.1-50.10) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">
              Ingredients ({totalIngredientCount}) {/* Requirement 50.7 */}
            </Typography>

            {/* Total Material Cost (Requirement 50.10) */}
            {totalMaterialCost > 0 && (
              <Paper sx={{ px: 2, py: 1, bgcolor: "primary.dark" }}>
                <Typography variant="subtitle2" color="primary.contrastText">
                  Est. Total Cost
                </Typography>
                <Typography variant="h6" color="primary.contrastText">
                  {totalMaterialCost.toLocaleString()} aUEC
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Grouped Ingredients (Requirement 50.8) */}
          {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {category}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="center">Quality</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                      <TableCell align="center">Inventory</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryIngredients.map((ingredient) => {
                      const avgPrice = ingredient.market_price_min && ingredient.market_price_max
                        ? (ingredient.market_price_min + ingredient.market_price_max) / 2
                        : ingredient.market_price_min || ingredient.market_price_max || 0
                      const totalCost = avgPrice * ingredient.quantity_required
                      const hasInventory = ingredient.user_inventory_quantity && ingredient.user_inventory_quantity > 0
                      const hasEnough = ingredient.user_inventory_quantity && ingredient.user_inventory_quantity >= ingredient.quantity_required

                      return (
                        <TableRow
                          key={ingredient.ingredient_id}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                            // Highlight ingredients the player doesn't have (Requirement 50.4)
                            bgcolor: !hasEnough ? "error.dark" : undefined,
                            opacity: !hasEnough ? 0.9 : 1,
                          }}
                          onClick={() => {
                            // Support clicking ingredients to view details (Requirement 50.6)
                            // Navigate to item detail page (to be implemented)
                            console.log("Navigate to item:", ingredient.game_item.game_item_id)
                          }}
                        >
                          {/* Ingredient Name and Icon (Requirements 50.1, 50.5) */}
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {ingredient.game_item.icon_url && (
                                <Box
                                  component="img"
                                  src={ingredient.game_item.icon_url}
                                  alt={ingredient.game_item.name}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    objectFit: "contain",
                                    borderRadius: 1,
                                  }}
                                />
                              )}
                              <Box>
                                <Typography variant="body2">
                                  {ingredient.game_item.name}
                                </Typography>
                                {ingredient.is_alternative && (
                                  <Chip
                                    label={`Alt ${ingredient.alternative_group}`}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Required Quantity (Requirement 50.2) */}
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {ingredient.quantity_required}
                            </Typography>
                          </TableCell>

                          {/* Quality Requirements (Requirement 50.3) */}
                          <TableCell align="center">
                            {ingredient.min_quality_tier || ingredient.recommended_quality_tier ? (
                              <Box>
                                {ingredient.min_quality_tier && (
                                  <Chip
                                    label={`Min: T${ingredient.min_quality_tier}`}
                                    size="small"
                                    color="warning"
                                    sx={{ mb: 0.5 }}
                                  />
                                )}
                                {ingredient.recommended_quality_tier && (
                                  <Chip
                                    label={`Rec: T${ingredient.recommended_quality_tier}`}
                                    size="small"
                                    color="success"
                                  />
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Any
                              </Typography>
                            )}
                          </TableCell>

                          {/* Unit Price */}
                          <TableCell align="right">
                            {avgPrice > 0 ? (
                              <Typography variant="body2">
                                {avgPrice.toLocaleString()} aUEC
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>

                          {/* Total Cost */}
                          <TableCell align="right">
                            {totalCost > 0 ? (
                              <Typography variant="body2" fontWeight="bold">
                                {totalCost.toLocaleString()} aUEC
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>

                          {/* Inventory Status */}
                          <TableCell align="center">
                            {hasInventory ? (
                              <Chip
                                label={`${ingredient.user_inventory_quantity}/${ingredient.quantity_required}`}
                                size="small"
                                color={hasEnough ? "success" : "warning"}
                              />
                            ) : (
                              <Chip
                                label="0"
                                size="small"
                                color="error"
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Alternative Ingredients Note (Requirement 50.9) */}
              {categoryIngredients.some(i => i.is_alternative) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This recipe allows alternative ingredients. Items marked with "Alt" can be substituted for each other within the same alternative group.
                </Alert>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Crafting Recipe Section */}
      {crafting_recipe && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Estimated Output
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Quality Calculation
                </Typography>
                <Typography variant="body2">{crafting_recipe.quality_calculation_type}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Output Quality Range
                </Typography>
                <Typography variant="body2">
                  Tier {crafting_recipe.min_output_quality_tier} – Tier {crafting_recipe.max_output_quality_tier}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Output
                </Typography>
                <Typography variant="body2">
                  {blueprint.output_quantity > 1 ? `${blueprint.output_quantity}× ` : ""}{output_item.name}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Quality impact per ingredient */}
            <Typography variant="subtitle2" gutterBottom>
              Quality Impact by Ingredient
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Higher quality ingredients produce higher quality output. Using the recommended tier or above has a positive impact.
            </Typography>

            <Stack spacing={0.5}>
              {ingredients.map((ingredient) => {
                const recTier = ingredient.recommended_quality_tier || 3
                const minTier = ingredient.min_quality_tier || 1
                const isAboveRec = minTier >= recTier
                return (
                  <Stack key={ingredient.ingredient_id} direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 120 }} noWrap>
                      {ingredient.game_item.name}
                    </Typography>
                    {ingredient.recommended_quality_tier && (
                      <Chip
                        size="small"
                        label={`Rec: T${ingredient.recommended_quality_tier}`}
                        color="info"
                        variant="outlined"
                      />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={isAboveRec ? "success.main" : "warning.main"}
                    >
                      {isAboveRec ? "✓ Positive impact" : "↓ Below recommended"}
                    </Typography>
                  </Stack>
                )
              })}
            </Stack>

            {/* Link to full calculator */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/crafting/calculator?blueprint_id=${blueprint.blueprint_id}`)}
              >
                Open Full Calculator
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Missions Rewarding This Blueprint */}
      {missions_rewarding && missions_rewarding.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Missions Rewarding This Blueprint ({missions_rewarding.length})
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {missions_rewarding.map((mission) => (
                <Card
                  key={mission.mission_id}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => navigate(`/missions/${mission.mission_id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="subtitle1">{mission.mission_name}</Typography>
                        {mission.star_system && (
                          <Typography variant="body2" color="text.secondary">
                            {mission.star_system}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={`${mission.drop_probability.toFixed(1)}% chance`}
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Blueprint Metadata */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Additional Information
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Blueprint Code
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {blueprint.blueprint_code}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2">
                {blueprint.is_active ? "Active" : "Inactive"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {new Date(blueprint.updated_at).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

/**
 * Format crafting time from seconds to human-readable format
 */
function formatCraftingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
