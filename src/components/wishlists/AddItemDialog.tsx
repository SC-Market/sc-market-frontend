/**
 * AddItemDialog Component
 *
 * Dialog for adding items to a shopping list with search, quantity, quality,
 * priority, notes, and buy/craft acquisition mode.
 */

import React, { useEffect, useMemo, useState } from "react"
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
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material"
import { Star, StarBorder, ShoppingCart, Build } from "@mui/icons-material"
import {
  useSearchGameItemsQuery,
  useSearchBlueprintsQuery,
} from "../../features/game-data/api/gameDataApi"
import type { AcquisitionMode } from "../../features/wishlists/api/wishlistsApi"
import { useAddWishlistItem } from "../../features/wishlists/hooks/useWishlistActions"
import { debounce } from "lodash"
import { Link } from "react-router-dom"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useTranslation } from "react-i18next"

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

export function AddItemDialog({
  open,
  onClose,
  wishlistId,
}: AddItemDialogProps) {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState<GameItemOption | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [qualityTier, setQualityTier] = useState<number | null>(null)
  const [priority, setPriority] = useState<number>(3)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("buy")
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null,
  )

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchGameItemsQuery(
      { query: searchQuery },
      { skip: searchQuery.length < 2 },
    )
  const { add: addItem, isAdding } = useAddWishlistItem(wishlistId)

  // Search for blueprints that produce the selected item
  const { data: blueprintData } = useSearchBlueprintsQuery(
    { text: selectedItem?.name || "" },
    { skip: !selectedItem },
  )
  const blueprintResults = blueprintData?.blueprints ?? []

  // Filter to blueprints that actually produce this item
  const itemBlueprints = blueprintResults.filter(
    (bp) =>
      bp.output_item_name?.toLowerCase() === selectedItem?.name?.toLowerCase(),
  )
  const hasCraftingOption = itemBlueprints.length > 0

  const debouncedSearch = useMemo(() => debounce(setSearchQuery, 300), [])
  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

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

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleItemChange = (
    _: React.SyntheticEvent,
    newValue: GameItemOption | null,
  ) => {
    setSelectedItem(newValue)
    setAcquisitionMode("buy")
    setSelectedBlueprintId(null)
  }

  const handleAcquisitionModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: AcquisitionMode | null,
  ) => {
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
    if (!selectedItem) {
      setError(t("marketUi.addItemDialog.selectItemError"))
      return
    }
    if (quantity < 1) {
      setError(t("marketUi.addItemDialog.quantityMinError"))
      return
    }
    if (acquisitionMode === "craft" && !selectedBlueprintId) {
      setError(t("marketUi.addItemDialog.selectBlueprintError"))
      return
    }

    setError(null)
    const failure = await addItem({
      game_item_id: selectedItem.id,
      desired_quantity: quantity,
      desired_quality_tier: qualityTier || undefined,
      blueprint_id:
        acquisitionMode === "craft"
          ? selectedBlueprintId || undefined
          : undefined,
      acquisition_mode: acquisitionMode,
      priority,
      notes: notes || undefined,
    })
    if (failure) setError(failure)
    else handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("marketUi.addItemDialog.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={1}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Item Search */}
          <Autocomplete
            size="small"
            value={selectedItem}
            onChange={handleItemChange}
            onInputChange={(_, v) => debouncedSearch(v)}
            options={searchResults}
            getOptionLabel={(o) => o.name}
            loading={isSearching}
            filterOptions={(x) => x}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("marketUi.addItemDialog.searchItem")}
                placeholder={t("marketUi.addItemDialog.searchPlaceholder")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
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
                ? t("marketUi.addItemDialog.minChars", { count: 2 })
                : t("marketUi.addItemDialog.noItemsFound")
            }
          />

          {/* Acquisition Mode — only show when item has blueprints */}
          {selectedItem && hasCraftingOption && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("marketUi.addItemDialog.howToGet")}
              </Typography>
              <ToggleButtonGroup
                value={acquisitionMode}
                exclusive
                onChange={handleAcquisitionModeChange}
                fullWidth
                size="small"
              >
                <ToggleButton value="buy">
                  <ShoppingCart sx={{ mr: 1 }} fontSize="small" />
                  {t("marketUi.addItemDialog.buyFromMarket")}
                </ToggleButton>
                <ToggleButton value="craft">
                  <Build sx={{ mr: 1 }} fontSize="small" />
                  {t("marketUi.addItemDialog.craftAddIngredients")}
                </ToggleButton>
              </ToggleButtonGroup>

              {acquisitionMode === "craft" && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={1}
                  >
                    {t("marketUi.addItemDialog.selectBlueprintHint")}
                  </Typography>
                  {itemBlueprints.length === 1 ? (
                    <Chip
                      label={itemBlueprints[0].blueprint_name}
                      color="primary"
                      variant="outlined"
                      component={Link}
                      to={GAME_DATA_PATHS.blueprint(
                        itemBlueprints[0].blueprint_name,
                      )}
                      clickable
                      size="small"
                    />
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel id="add-item-dialog-blueprint-label">
                        {t("marketUi.addItemDialog.blueprintRequired")}
                      </InputLabel>
                      <Select
                        labelId="add-item-dialog-blueprint-label"
                        value={selectedBlueprintId || ""}
                        label={t("marketUi.addItemDialog.blueprintRequired")}
                        onChange={(e) =>
                          setSelectedBlueprintId(e.target.value || null)
                        }
                      >
                        {itemBlueprints.map((bp) => (
                          <MenuItem
                            key={bp.blueprint_id}
                            value={bp.blueprint_id}
                          >
                            {bp.blueprint_name}
                            {bp.item_subcategory && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
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
            size="small"
            value={quantity}
            type="number"
            fullWidth
            label={t("marketUi.addItemDialog.quantityRequired")}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0) setQuantity(v)
            }}
            inputProps={{ min: 1, step: 1 }}
          />

          {/* Quality Tier */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("marketUi.addItemDialog.qualityTierOptional")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[1, 2, 3, 4, 5].map((tier) => (
                <Box
                  key={tier}
                  onClick={() =>
                    setQualityTier(qualityTier === tier ? null : tier)
                  }
                  sx={{
                    cursor: "pointer",
                    "&:hover": { transform: "scale(1.2)" },
                    transition: "transform 0.2s",
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
                  {t("marketUi.addItemDialog.clear")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Priority */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("marketUi.addItemDialog.priorityValue", { priority })}
            </Typography>
            <Slider
              aria-label={t("marketUi.addItemDialog.priority")}
              value={priority}
              onChange={(_, v) => setPriority(v as number)}
              min={1}
              max={5}
              step={1}
              marks={[
                { value: 1, label: t("marketUi.addItemDialog.priorityLow") },
                { value: 3, label: t("marketUi.addItemDialog.priorityMedium") },
                {
                  value: 5,
                  label: t("marketUi.addItemDialog.priorityCritical"),
                },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Notes */}
          <TextField
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
            label={t("marketUi.addItemDialog.notesOptional")}
            placeholder={t("marketUi.addItemDialog.notesPlaceholder")}
            inputProps={{ maxLength: 500 }}
            helperText={`${notes.length}/500`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isAdding}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            isAdding ||
            !selectedItem ||
            quantity < 1 ||
            (acquisitionMode === "craft" && !selectedBlueprintId)
          }
        >
          {isAdding ? (
            <CircularProgress size={20} />
          ) : acquisitionMode === "craft" ? (
            t("marketUi.addItemDialog.addIngredients")
          ) : (
            t("marketUi.addItemDialog.addItem")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
