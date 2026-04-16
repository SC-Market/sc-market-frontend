import React, { useCallback, useState } from "react"
import {
  Button,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
  RadioGroup,
  Radio,
  IconButton,
  Box,
} from "@mui/material"
import { AddCircleOutlineRounded, DeleteOutlineRounded } from "@mui/icons-material"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { useNavigate } from "react-router-dom"
import { NumericFormat } from "react-number-format"
import { FormPaper } from "../../../components/paper/FormPaper"
import { GameItemSearchAutocomplete } from "../../../features/market/components/GameItemSearchAutocomplete"
import LoadingButton from "@mui/lab/LoadingButton"
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useCreateListingMutation } from "../../../store/api/v2/market"

interface LotInput {
  id: string
  quantity: number
  quality_tier: number
  quality_value: number
  crafted_source: "crafted" | "store" | "looted" | "unknown"
  location_id?: string
  price?: number
}

/**
 * CreateListingV2 Component
 * 
 * Form for creating new V2 listings with:
 * - Title, description, game item selection
 * - Pricing mode selector (unified/per_variant)
 * - Base price input (for unified mode)
 * - Variant lot inputs with quality attributes
 * 
 * CRITICAL: Maintains visual parity with V1 MarketListingForm
 * CRITICAL: Uses TSOA-generated RTK Query client (useCreateListingMutation)
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */
export function CreateListingV2() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()
  const [currentOrg] = useCurrentOrg()

  // ⚠️ CRITICAL: Use RTK Query mutation from generated API
  const [createListing, { isLoading }] = useCreateListingMutation()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [gameItemId, setGameItemId] = useState<string | null>(null)
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">("unified")
  const [basePrice, setBasePrice] = useState<number>(0)
  const [lots, setLots] = useState<LotInput[]>([
    {
      id: "lot-1",
      quantity: 1,
      quality_tier: 1,
      quality_value: 25,
      crafted_source: "store",
      location_id: undefined,
      price: undefined,
    },
  ])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleAddLot = () => {
    setLots([
      ...lots,
      {
        id: `lot-${Date.now()}`,
        quantity: 1,
        quality_tier: 1,
        quality_value: 25,
        crafted_source: "store",
        location_id: undefined,
        price: pricingMode === "per_variant" ? 0 : undefined,
      },
    ])
  }

  const handleRemoveLot = (id: string) => {
    setLots(lots.filter((lot) => lot.id !== id))
  }

  const handleLotChange = (id: string, field: keyof LotInput, value: any) => {
    setLots(
      lots.map((lot) =>
        lot.id === id ? { ...lot, [field]: value } : lot
      )
    )
  }

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (!gameItemId) {
        issueAlert({
          message: t("CreateListingV2.selectItem", "Please select a game item"),
          severity: "error",
        })
        return
      }

      if (!title.trim()) {
        issueAlert({
          message: t("CreateListingV2.enterTitle", "Please enter a title"),
          severity: "error",
        })
        return
      }

      try {
        const result = await createListing({
          createListingRequest: {
            title,
            description,
            game_item_id: gameItemId,
            pricing_mode: pricingMode,
            base_price: pricingMode === "unified" ? basePrice : undefined,
            lots: lots.map((lot) => ({
              quantity: lot.quantity,
              variant_attributes: {
                quality_tier: lot.quality_tier,
                quality_value: lot.quality_value,
                crafted_source: lot.crafted_source,
              },
              location_id: lot.location_id,
              price: pricingMode === "per_variant" ? lot.price : undefined,
            })),
          },
        }).unwrap()

        issueAlert({
          message: t("CreateListingV2.success", "Listing created successfully"),
          severity: "success",
        })

        // Navigate to listing detail
        navigate(`/market/${result.listing.listing_id}`)
      } catch (error: any) {
        issueAlert({
          message: error?.data?.message || t("CreateListingV2.error", "Failed to create listing"),
          severity: "error",
        })
      }
    },
    [
      createListing,
      title,
      description,
      gameItemId,
      pricingMode,
      basePrice,
      lots,
      navigate,
      issueAlert,
      t,
    ]
  )

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <FormPaper title={t("CreateListingV2.about", "About")}>
          {/* Item Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("CreateListingV2.itemSelection", "Item Selection")}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <GameItemSearchAutocomplete
              value={gameItemId}
              onChange={(newValue) => setGameItemId(newValue)}
            />
          </Grid>

          {/* Listing Details */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("CreateListingV2.listingDetails", "Listing Details")}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label={t("CreateListingV2.title", "Title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              TextFieldProps={{
                label: t("CreateListingV2.description", "Description"),
                helperText:
                  description.length > 1900
                    ? `${description.length}/2000`
                    : t("CreateListingV2.descriptionHelp", "Markdown supported"),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography color={"text.secondary"} variant={"body2"}>
              {t("CreateListingV2.imageHint", "Add images to your listing")}{" "}
              {t("CreateListingV2.imageSizeLimit", "(Max 2.5MB per image)")}
            </Typography>
            <SelectPhotosArea
              photos={uploadedFiles.map((file) => URL.createObjectURL(file))}
              onPhotosChange={(files) => setUploadedFiles(files)}
            />
          </Grid>
        </FormPaper>

        {/* Pricing Configuration */}
        <FormPaper title={t("CreateListingV2.pricing", "Pricing")}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {t("CreateListingV2.pricingMode", "Pricing Mode")}
            </Typography>
            <RadioGroup
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as "unified" | "per_variant")}
            >
              <FormControlLabel
                value="unified"
                control={<Radio />}
                label={t("CreateListingV2.unifiedPricing", "Unified Pricing (same price for all variants)")}
              />
              <FormControlLabel
                value="per_variant"
                control={<Radio />}
                label={t("CreateListingV2.perVariantPricing", "Per-Variant Pricing (different prices per quality)")}
              />
            </RadioGroup>
          </Grid>

          {pricingMode === "unified" && (
            <Grid item xs={12} md={6}>
              <NumericFormat
                customInput={TextField}
                thousandSeparator
                fullWidth
                size="small"
                label={t("CreateListingV2.basePrice", "Base Price")}
                value={basePrice}
                onValueChange={(values) => setBasePrice(values.floatValue || 0)}
                InputProps={{
                  endAdornment: <Typography>aUEC</Typography>,
                }}
              />
            </Grid>
          )}
        </FormPaper>

        {/* Variant Lots */}
        <FormPaper title={t("CreateListingV2.variants", "Variant Lots")}>
          {lots.map((lot, index) => (
            <Grid item xs={12} key={lot.id}>
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {t("CreateListingV2.lot", "Lot")} {index + 1}
                </Typography>

                {lots.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveLot(lot.id)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <DeleteOutlineRounded />
                  </IconButton>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={t("CreateListingV2.quantity", "Quantity")}
                      value={lot.quantity}
                      onChange={(e) =>
                        handleLotChange(lot.id, "quantity", parseInt(e.target.value) || 1)
                      }
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label={t("CreateListingV2.qualityTier", "Quality Tier")}
                      value={lot.quality_tier}
                      onChange={(e) =>
                        handleLotChange(lot.id, "quality_tier", parseInt(e.target.value))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((tier) => (
                        <MenuItem key={tier} value={tier}>
                          Tier {tier}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={t("CreateListingV2.qualityValue", "Quality Value (%)")}
                      value={lot.quality_value}
                      onChange={(e) =>
                        handleLotChange(lot.id, "quality_value", parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label={t("CreateListingV2.source", "Source")}
                      value={lot.crafted_source}
                      onChange={(e) =>
                        handleLotChange(lot.id, "crafted_source", e.target.value)
                      }
                    >
                      <MenuItem value="crafted">Crafted</MenuItem>
                      <MenuItem value="store">Store</MenuItem>
                      <MenuItem value="looted">Looted</MenuItem>
                      <MenuItem value="unknown">Unknown</MenuItem>
                    </TextField>
                  </Grid>

                  {pricingMode === "per_variant" && (
                    <Grid item xs={12} sm={6}>
                      <NumericFormat
                        customInput={TextField}
                        thousandSeparator
                        fullWidth
                        size="small"
                        label={t("CreateListingV2.price", "Price")}
                        value={lot.price || 0}
                        onValueChange={(values) =>
                          handleLotChange(lot.id, "price", values.floatValue || 0)
                        }
                        InputProps={{
                          endAdornment: <Typography>aUEC</Typography>,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              startIcon={<AddCircleOutlineRounded />}
              onClick={handleAddLot}
              variant="outlined"
            >
              {t("CreateListingV2.addLot", "Add Another Lot")}
            </Button>
          </Grid>
        </FormPaper>

        {/* Submit Button */}
        <Grid item xs={12}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isLoading}
            fullWidth
          >
            {t("CreateListingV2.submit", "Create Listing")}
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  )
}
