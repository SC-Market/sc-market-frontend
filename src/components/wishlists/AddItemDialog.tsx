/**
 * AddItemDialog Component
 * 
 * Dialog for adding items to a shopping list with search, quantity, quality, priority, and notes.
 * 
 * Features:
 * - Item search/autocomplete (Requirement 8.1)
 * - Quantity input (Requirement 8.2)
 * - Quality tier selection (1-5 stars) (Requirement 8.3)
 * - Priority selection (1-5) (Requirement 8.1)
 * - Notes field (Requirement 8.1)
 * - Form validation (quantity > 0, quality tier 1-5, priority 1-5)
 * 
 * Task 14.3 - Create AddItemDialog component
 * Requirements: 8.1, 8.2, 8.3
 */

import React, { useState, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { Star, StarBorder } from "@mui/icons-material"
import { useSearchGameItemsQuery, useAddWishlistItemMutation } from "../../store/api/v2/market"
import { debounce } from "lodash"

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

/**
 * AddItemDialog Component
 * 
 * Provides a form for adding items to a shopping list with:
 * - Item search/autocomplete
 * - Quantity input (must be > 0)
 * - Quality tier selection (1-5 stars)
 * - Priority selection (1-5)
 * - Optional notes field
 * - Validation and error handling
 */
export function AddItemDialog({ open, onClose, wishlistId }: AddItemDialogProps) {
  // Form state
  const [selectedItem, setSelectedItem] = useState<GameItemOption | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [qualityTier, setQualityTier] = useState<number | null>(null)
  const [priority, setPriority] = useState<number>(3)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  // RTK Query hooks
  const { data: searchResults = [], isLoading: isSearching } = useSearchGameItemsQuery(
    { query: searchQuery },
    { skip: searchQuery.length < 2 }
  )
  const [addItem, { isLoading: isAdding }] = useAddWishlistItemMutation()

  // Debounced search handler
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value)
    }, 300),
    []
  )

  // Reset form
  const resetForm = () => {
    setSelectedItem(null)
    setSearchQuery("")
    setQuantity(1)
    setQualityTier(null)
    setPriority(3)
    setNotes("")
    setError(null)
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validate item selection (Requirement 8.1)
    if (!selectedItem) {
      setError("Please select an item")
      return
    }

    // Validate quantity (Requirement 8.2, must be > 0)
    if (quantity < 1) {
      setError("Quantity must be at least 1")
      return
    }

    if (!Number.isInteger(quantity)) {
      setError("Quantity must be a whole number")
      return
    }

    // Validate quality tier (Requirement 8.3, 1-5 if provided)
    if (qualityTier !== null && (qualityTier < 1 || qualityTier > 5)) {
      setError("Quality tier must be between 1 and 5")
      return
    }

    // Validate priority (1-5)
    if (priority < 1 || priority > 5) {
      setError("Priority must be between 1 and 5")
      return
    }

    // Validate notes length
    if (notes.length > 500) {
      setError("Notes must be 500 characters or less")
      return
    }

    setError(null)

    try {
      // Submit item (Requirements 8.1, 8.2, 8.3)
      await addItem({
        wishlistId: wishlistId,
        addWishlistItemRequest: {
          game_item_id: selectedItem.id,
          desired_quantity: quantity,
          desired_quality_tier: qualityTier || undefined,
          priority,
          notes: notes || undefined,
        },
      }).unwrap()

      // Close dialog on success
      handleClose()
    } catch (err: any) {
      // Handle error
      const errorMessage =
        err?.data?.message || err?.message || "Failed to add item. Please try again."
      setError(errorMessage)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Item to Shopping List</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Item Search/Autocomplete (Requirement 8.1) */}
          <Autocomplete
            size="small"
            value={selectedItem}
            onChange={(_, newValue) => setSelectedItem(newValue)}
            onInputChange={(_, newInputValue) => {
              debouncedSetSearchQuery(newInputValue)
            }}
            options={searchResults}
            getOptionLabel={(option) => option.name}
            loading={isSearching}
            filterOptions={(x) => x} // Disable client-side filtering (server-side search)
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Item *"
                placeholder="Type to search for items..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                helperText="Start typing to search for game items"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.type}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText={
              searchQuery.length < 2
                ? "Type at least 2 characters to search"
                : "No items found"
            }
          />

          {/* Quantity Input (Requirement 8.2) */}
          <TextField
            size="small"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10)
              if (!isNaN(value) && value >= 0) {
                setQuantity(value)
              }
            }}
            type="number"
            fullWidth
            label="Quantity *"
            inputProps={{ min: 1, step: 1 }}
            helperText="How many of this item do you want?"
          />

          {/* Quality Tier Selection (Requirement 8.3) */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Desired Quality Tier (Optional)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Select the quality tier you want for this item (1-5 stars)
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[1, 2, 3, 4, 5].map((tier) => (
                <Box
                  key={tier}
                  onClick={() => setQualityTier(qualityTier === tier ? null : tier)}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.2)",
                    },
                  }}
                >
                  {qualityTier && tier <= qualityTier ? (
                    <Star fontSize="large" color="primary" />
                  ) : (
                    <StarBorder fontSize="large" color="action" />
                  )}
                </Box>
              ))}
              {qualityTier && (
                <Button size="small" onClick={() => setQualityTier(null)}>
                  Clear
                </Button>
              )}
            </Box>
            {qualityTier && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Selected: {qualityTier} / 5 stars
              </Typography>
            )}
          </Box>

          {/* Priority Selection (Requirement 8.1) */}
          <FormControl fullWidth size="small">
            <InputLabel>Priority *</InputLabel>
            <Select
              value={priority}
              label="Priority *"
              onChange={(e) => setPriority(e.target.value as number)}
            >
              <MenuItem value={1}>1 - Low</MenuItem>
              <MenuItem value={2}>2 - Below Average</MenuItem>
              <MenuItem value={3}>3 - Medium</MenuItem>
              <MenuItem value={4}>4 - High</MenuItem>
              <MenuItem value={5}>5 - Critical</MenuItem>
            </Select>
          </FormControl>

          {/* Priority Slider (Alternative Visual) */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Priority Level: {priority}
            </Typography>
            <Slider
              value={priority}
              onChange={(_, newValue) => setPriority(newValue as number)}
              min={1}
              max={5}
              step={1}
              marks={[
                { value: 1, label: "Low" },
                { value: 3, label: "Medium" },
                { value: 5, label: "Critical" },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Notes Field (Requirement 8.1) */}
          <TextField
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            label="Notes (Optional)"
            placeholder="Add any notes about this item..."
            inputProps={{ maxLength: 500 }}
            helperText={`${notes.length}/500 characters`}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isAdding}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isAdding || !selectedItem || quantity < 1}
        >
          {isAdding ? <CircularProgress size={20} /> : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
