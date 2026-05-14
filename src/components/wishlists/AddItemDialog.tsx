/**
 * AddItemDialog Component
 *
 * Dialog for adding items to a shopping list with search, quantity, quality,
 * priority, notes, and buy/craft acquisition mode.
 */

import React, { useState, useCallback } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Box, CircularProgress,
  Alert, Autocomplete, Slider, FormControl, InputLabel, Select, MenuItem,
  ToggleButtonGroup, ToggleButton, Chip,
} from "@mui/material"
import { Star, StarBorder, ShoppingCart, Build } from "@mui/icons-material"
import {
  useSearchGameItemsQuery,
  useAddWishlistItemMutation,
  useSearchBlueprintsQuery,
  type AcquisitionMode,
} from "../../store/api/v2/market"
import { debounce } from "lodash"
import { Link } from "react-router-dom"

export interface AddItemDialogProps {
  open: boolean
  onClose: () => void
  wishlistId: string
}

interface GameItemOption {
  id: string
  name: string
  type: string
}

export function AddItemDialog({ open, onClose, wishlistId }: AddItemDialogProps) {
  const [selectedItem, setSelectedItem] = useState<GameItemOption | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [qualityTier, setQualityTier] = useState<number | null>(null)
  const [priority, setPriority] = useState<number>(3)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("buy")
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null)

  const { data: searchResults = [], isLoading: isSearching } = useSearchGameItemsQuery(
    { query: searchQuery },
    { skip: searchQuery.length < 2 },
  )
  const [addItem, { isLoading: isAdding }] = useAddWishlistItemMutation()

  // Search for blueprints that produce the selected item
  const { data: blueprintData } = useSearchBlueprintsQuery(
    { text: selectedItem?.name || "" },
    { skip: !selectedItem },
  )
  const blueprintResults = blueprintData?.blueprints ?? []

  // Filter to blueprints that actually produce this item
  const itemBlueprints = blueprintResults.filter(
    (bp) => bp.output_item_name?.toLowerCase() === selectedItem?.name?.toLowerCase(),
  )
  const hasCraftingOption = itemBlueprints.length > 0

  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    [],
  )

  const resetForm = () => {
    setSelectedItem(null)
    setSearchQuery("")
    setQuantity(1)
    setQualityTier(null)
    setPriority(3)
    setNotes("")
    setError(null)
    setAcquisitionMode("buy")
    setSelectedBlueprintId(null)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleItemChange = (_: React.SyntheticEvent, newValue: GameItemOption | null) => {
    setSelectedItem(newValue)
    setAcquisitionMode("buy")
    setSelectedBlueprintId(null)
  }

  const handleAcquisitionModeChange = (_: React.MouseEvent<HTMLElement>, newMode: AcquisitionMode | null) => {
    if (newMode) {
      setAcquisitionMode(newMode)
      if (newMode === "craft" && itemBlueprints.length === 1) {
        setSelectedBlueprintId(itemBlueprints[0].blueprint_id)
      } else if (newMode === "buy") {
        setSelectedBlueprintId(null)
      }
    }
  }

  const handleSubmit = async () => {
    if (!selectedItem) { setError("Please select an item"); return }
    if (quantity < 1) { setError("Quantity must be at least 1"); return }
    if (acquisitionMode === "craft" && !selectedBlueprintId) { setError("Please select a blueprint for crafting"); return }

    setError(null)
    try {
      await addItem({
        wishlistId,
        addWishlistItemRequest: {
          game_item_id: selectedItem.id,
          desired_quantity: quantity,
          desired_quality_tier: qualityTier || undefined,
          blueprint_id: acquisitionMode === "craft" ? selectedBlueprintId || undefined : undefined,
          acquisition_mode: acquisitionMode,
          priority,
          notes: notes || undefined,
        },
      }).unwrap()
      handleClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add item."
      setError(message)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Item to Shopping List</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={1}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

          {/* Item Search */}
          <Autocomplete
            size="small"
            value={selectedItem}
            onChange={handleItemChange}
            onInputChange={(_, v) => debouncedSetSearchQuery(v)}
            options={searchResults}
            getOptionLabel={(o) => o.name}
            loading={isSearching}
            filterOptions={(x) => x}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Search Item *" placeholder="Type to search..."
                InputProps={{ ...params.InputProps, endAdornment: (<>{isSearching ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>) }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{option.type}</Typography>
                </Box>
              </li>
            )}
            noOptionsText={searchQuery.length < 2 ? "Type at least 2 characters" : "No items found"}
          />

          {/* Acquisition Mode — only show when item has blueprints */}
          {selectedItem && hasCraftingOption && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>How do you want to get this item?</Typography>
              <ToggleButtonGroup
                value={acquisitionMode}
                exclusive
                onChange={handleAcquisitionModeChange}
                fullWidth
                size="small"
              >
                <ToggleButton value="buy">
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  Buy from Market
                </ToggleButton>
                <ToggleButton value="craft">
                  <Build sx={{ mr: 1 }} fontSize="small" />
                  Craft (add ingredients)
                </ToggleButton>
              </ToggleButtonGroup>

              {acquisitionMode === "craft" && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Select a blueprint — its ingredients will be tracked in your shopping list
                  </Typography>
                  {itemBlueprints.length === 1 ? (
                    <Chip
                      label={itemBlueprints[0].blueprint_name}
                      color="primary"
                      variant="outlined"
                      component={Link}
                      to={`/blueprints/${itemBlueprints[0].blueprint_code}`}
                      clickable
                      size="small"
                    />
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel>Blueprint *</InputLabel>
                      <Select
                        value={selectedBlueprintId || ""}
                        label="Blueprint *"
                        onChange={(e) => setSelectedBlueprintId(e.target.value || null)}
                      >
                        {itemBlueprints.map((bp) => (
                          <MenuItem key={bp.blueprint_id} value={bp.blueprint_id}>
                            {bp.blueprint_name}
                            {bp.item_subcategory && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({bp.item_subcategory})
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Quantity */}
          <TextField
            size="small" value={quantity} type="number" fullWidth label="Quantity *"
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 0) setQuantity(v) }}
            inputProps={{ min: 1, step: 1 }}
          />

          {/* Quality Tier */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Quality Tier (Optional)</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[1, 2, 3, 4, 5].map((tier) => (
                <Box key={tier} onClick={() => setQualityTier(qualityTier === tier ? null : tier)}
                  sx={{ cursor: "pointer", "&:hover": { transform: "scale(1.2)" }, transition: "transform 0.2s" }}>
                  {qualityTier && tier <= qualityTier ? <Star fontSize="large" color="primary" /> : <StarBorder fontSize="large" color="action" />}
                </Box>
              ))}
              {qualityTier && <Button size="small" onClick={() => setQualityTier(null)}>Clear</Button>}
            </Box>
          </Box>

          {/* Priority */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Priority: {priority}</Typography>
            <Slider value={priority} onChange={(_, v) => setPriority(v as number)}
              min={1} max={5} step={1}
              marks={[{ value: 1, label: "Low" }, { value: 3, label: "Medium" }, { value: 5, label: "Critical" }]}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Notes */}
          <TextField
            size="small" value={notes} onChange={(e) => setNotes(e.target.value)}
            multiline rows={2} fullWidth label="Notes (Optional)"
            placeholder="Add any notes..." inputProps={{ maxLength: 500 }}
            helperText={`${notes.length}/500`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isAdding}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained"
          disabled={isAdding || !selectedItem || quantity < 1 || (acquisitionMode === "craft" && !selectedBlueprintId)}>
          {isAdding ? <CircularProgress size={20} /> : acquisitionMode === "craft" ? "Add Ingredients" : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
