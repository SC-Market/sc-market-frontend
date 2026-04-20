import React, { useState, useCallback, useMemo } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Button,
  IconButton,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import LoadingButton from "@mui/lab/LoadingButton";
import { AddCircleOutlineRounded, DeleteOutline } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { FormPaper } from "../../../components/paper/FormPaper";
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy";
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete";
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea";
import { LocationSelector } from "../components/stock/LocationSelector";
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor";
import { useCreateListingMutation } from "../../../store/api/v2/market";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import type {
  CreateListingRequest,
  StockLotInput,
  VariantAttributes,
} from "../../../store/api/v2/market";

/**
 * Stock lot form data with variant attributes
 */
interface StockLotFormData {
  id: string; // Temporary ID for form management
  quantity: number;
  quality_tier?: number;
  quality_value?: number;
  crafted_source?: "crafted" | "store" | "looted" | "unknown";
  location_id?: string;
  price?: number; // For per_variant pricing mode
  notes?: string;
  listed?: boolean;
}

/**
 * CreateListingV2 - Form component for creating V2 listings with variant support
 *
 * Features:
 * - Reuses FormPaper, MarkdownEditor, GameItemSearchAutocomplete
 * - Reuses SelectPhotosArea for photo upload
 * - Reuses NumericFormat for price inputs
 * - Pricing mode selector (unified vs per_variant)
 * - Stock lot input section with variant attribute fields
 * - Quality tier dropdown (1-5)
 * - Quality value input (0-100)
 * - Crafted source dropdown (crafted, store, looted, unknown)
 * - Location selector
 * - Validates all inputs before submission
 * - Shows success message and redirects to listing detail
 *
 * Requirements: 11.7, 14.1-14.12
 */
export function CreateListingV2() {
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const navigate = useNavigate();
  const issueAlert = useAlertHook();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameItemId, setGameItemId] = useState<string | null>(null);
  const [gameItemName, setGameItemName] = useState<string | null>(null);
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">("unified");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pickupMethod, setPickupMethod] = useState<"delivery" | "pickup" | "any" | "">(""); 
  const [quantityUnit, setQuantityUnit] = useState<"unit" | "scu">("unit");
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | null>(null);
  const [maxOrderQuantity, setMaxOrderQuantity] = useState<number | null>(null);
  const [minOrderValue, setMinOrderValue] = useState<number | null>(null);
  const [maxOrderValue, setMaxOrderValue] = useState<number | null>(null);
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<Array<{ min_quantity: number; discount_percent: number }>>([]);

  // Stock lots state
  const [stockLots, setStockLots] = useState<StockLotFormData[]>([
    {
      id: crypto.randomUUID(),
      quantity: 1,
      quality_tier: undefined,
      quality_value: undefined,
      crafted_source: undefined,
      location_id: undefined,
      price: undefined,
      notes: undefined,
      listed: true,
    },
  ]);

  // RTK Query mutation
  const [createListing, { isLoading }] = useCreateListingMutation();

  // Add new stock lot
  const handleAddStockLot = useCallback(() => {
    setStockLots((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        quantity: 1,
        quality_tier: undefined,
        quality_value: undefined,
        crafted_source: undefined,
        location_id: undefined,
        price: undefined,
        notes: undefined,
        listed: true,
      },
    ]);
  }, []);

  // Remove stock lot
  const handleRemoveStockLot = useCallback((id: string) => {
    setStockLots((prev) => prev.filter((lot) => lot.id !== id));
  }, []);

  // Update stock lot field
  const handleUpdateStockLot = useCallback(
    (id: string, field: keyof StockLotFormData, value: any) => {
      setStockLots((prev) =>
        prev.map((lot) => (lot.id === id ? { ...lot, [field]: value } : lot))
      );
    },
    []
  );

  // Validate form
  const validateForm = useCallback((): string | null => {
    if (!title.trim()) {
      return t("CreateListingV2.validation.titleRequired", "Title is required");
    }
    if (title.length > 500) {
      return t(
        "CreateListingV2.validation.titleTooLong",
        "Title must be 500 characters or less"
      );
    }
    if (!description.trim()) {
      return t("CreateListingV2.validation.descriptionRequired", "Description is required");
    }
    if (!gameItemId) {
      return t("CreateListingV2.validation.gameItemRequired", "Game item is required");
    }
    if (pricingMode === "unified" && (!basePrice || basePrice <= 0)) {
      return t(
        "CreateListingV2.validation.basePriceRequired",
        "Base price must be greater than 0"
      );
    }
    if (stockLots.length === 0) {
      return t(
        "CreateListingV2.validation.stockLotRequired",
        "At least one stock lot is required"
      );
    }

    // Validate each stock lot
    for (let i = 0; i < stockLots.length; i++) {
      const lot = stockLots[i];
      if (!lot.quantity || lot.quantity <= 0) {
        return t(
          "CreateListingV2.validation.quantityRequired",
          "Quantity must be greater than 0 for lot {{index}}",
          { index: i + 1 }
        );
      }
      if (lot.quality_tier !== undefined && (lot.quality_tier < 1 || lot.quality_tier > 5)) {
        return t(
          "CreateListingV2.validation.qualityTierRange",
          "Quality tier must be between 1 and 5 for lot {{index}}",
          { index: i + 1 }
        );
      }
      if (
        lot.quality_value !== undefined &&
        (lot.quality_value < 0 || lot.quality_value > 1000)
      ) {
        return t(
          "CreateListingV2.validation.qualityValueRange",
          "Quality value must be between 0 and 1000 for lot {{index}}",
          { index: i + 1 }
        );
      }
      if (pricingMode === "per_variant" && (!lot.price || lot.price <= 0)) {
        return t(
          "CreateListingV2.validation.variantPriceRequired",
          "Price must be greater than 0 for lot {{index}} in per-variant pricing mode",
          { index: i + 1 }
        );
      }
    }

    return null;
  }, [title, description, gameItemId, pricingMode, basePrice, stockLots, t]);

  // Submit form
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        issueAlert({
          message: validationError,
          severity: "error",
        });
        return;
      }

      // Transform stock lots to API format
      const lots: StockLotInput[] = stockLots.map((lot) => {
        const variant_attributes: VariantAttributes = {};
        if (lot.quality_tier !== undefined) {
          variant_attributes.quality_tier = lot.quality_tier;
        }
        if (lot.quality_value !== undefined) {
          variant_attributes.quality_value = lot.quality_value;
        }
        if (lot.crafted_source !== undefined) {
          variant_attributes.crafted_source = lot.crafted_source;
        }

        return {
          quantity: lot.quantity,
          variant_attributes,
          location_id: lot.location_id,
          price: pricingMode === "per_variant" ? lot.price : undefined,
        };
      });

      // Create request payload
      const request: CreateListingRequest = {
        title: title.trim(),
        description: description.trim(),
        game_item_id: gameItemId!,
        pricing_mode: pricingMode,
        base_price: pricingMode === "unified" ? basePrice : undefined,
        lots,
        pickup_method: pickupMethod || undefined,
        quantity_unit: quantityUnit,
        min_order_quantity: minOrderQuantity ?? undefined,
        max_order_quantity: maxOrderQuantity ?? undefined,
        min_order_value: minOrderValue ?? undefined,
        max_order_value: maxOrderValue ?? undefined,
        bulk_discount_tiers: bulkDiscountTiers.length ? bulkDiscountTiers : undefined,
      };

      try {
        const result = await createListing({ createListingRequest: request }).unwrap();

        issueAlert({
          message: t("CreateListingV2.success", "Listing created successfully"),
          severity: "success",
        });

        // Navigate to listing detail page
        navigate(`/market/v2/${result.listing_id}`);
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.message ||
            t("CreateListingV2.error", "Failed to create listing"),
          severity: "error",
        });
      }
    },
    [
      validateForm,
      stockLots,
      title,
      description,
      gameItemId,
      pricingMode,
      basePrice,
      createListing,
      issueAlert,
      navigate,
      t,
    ]
  );

  // Handle file upload
  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);

  return (
    <StandardPageLayout
      title={t("CreateListingV2.pageTitle", "Create Listing")}
      headerTitle={
        <Typography variant="h4" fontWeight="bold" color="text.secondary">
          {t("CreateListingV2.headerTitle", "Create New Listing")}
        </Typography>
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* About Section */}
          <FormPaper title={t("CreateListingV2.about", "About")}>
            {/* Game Item Selection */}
            <Grid item xs={12}>
              <GameItemSearchAutocomplete
                value={gameItemName}
                onChange={(itemName, itemType, itemId) => {
                  setGameItemName(itemName);
                  setGameItemId(itemId);
                  setQuantityUnit(itemType === "Commodity" ? "scu" : "unit");
                  if (!title && itemName) {
                    setTitle(itemName);
                  }
                }}
                label={t("CreateListingV2.selectGameItem", "Select Game Item")}
              />
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label={t("CreateListingV2.title", "Title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                color="secondary"
                required
                inputProps={{
                  maxLength: 500,
                  "aria-label": t("CreateListingV2.titleAriaLabel", "Enter listing title"),
                }}
                helperText={
                  title.length > 450 ? `${title.length}/500` : undefined
                }
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <MarkdownEditor
                onChange={(value: string) => setDescription(value)}
                value={description}
                TextFieldProps={{
                  label: t("CreateListingV2.description", "Description"),
                  helperText:
                    description.length > 1900
                      ? `${description.length}/2000`
                      : t(
                          "CreateListingV2.descriptionHelp",
                          "Provide a detailed description (markdown supported)"
                        ),
                  inputProps: { maxLength: 2000 },
                }}
                variant="vertical"
              />
            </Grid>

            {/* Photos */}
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                {t("CreateListingV2.imageHint", "Add photos to your listing")}{" "}
                {t("CreateListingV2.imageSizeLimit", "(Max 2.5MB per image)")}
              </Typography>
              <SelectPhotosArea
                setPhotos={setPhotos}
                photos={photos}
                onFileUpload={handleFileUpload}
                pendingFiles={uploadedFiles}
                onRemovePendingFile={(file) => {
                  setUploadedFiles((prev) => prev.filter((f) => f !== file));
                }}
                onAlert={(severity, message) => issueAlert({ severity, message })}
              />
            </Grid>
          </FormPaper>

          {/* Pickup Method & Quantity Unit */}
          <FormPaper title={t("CreateListingV2.listingOptions", "Listing Options")}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("CreateListingV2.pickupMethod", "Pickup Method")}
                value={pickupMethod}
                onChange={(e) => setPickupMethod(e.target.value as any)}
                helperText={t("CreateListingV2.pickupMethodHelper", "How will the buyer receive the item?")}
              >
                <MenuItem value="">{t("CreateListingV2.notSpecified", "Not specified")}</MenuItem>
                <MenuItem value="delivery">{t("CreateListingV2.delivery", "Delivery (seller delivers)")}</MenuItem>
                <MenuItem value="pickup">{t("CreateListingV2.pickup", "Pickup (buyer picks up)")}</MenuItem>
                <MenuItem value="any">{t("CreateListingV2.either", "Either (delivery or pickup)")}</MenuItem>
              </TextField>
            </Grid>
            {/* Quantity Unit — only shown for custom items; auto-inferred for known items */}
            {!gameItemId && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={t("CreateListingV2.quantityUnit", "Quantity Unit")}
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value as "unit" | "scu")}
                  helperText={
                    quantityUnit === "scu"
                      ? t("CreateListingV2.scuHelp", "Quantities measured in cSCU (100 cSCU = 1 SCU)")
                      : t("CreateListingV2.unitHelp", "Discrete items (weapons, armor, components)")
                  }
                >
                  <MenuItem value="unit">{t("CreateListingV2.unitDiscrete", "Units (discrete items)")}</MenuItem>
                  <MenuItem value="scu">{t("CreateListingV2.unitSCU", "SCU (cargo / commodities)")}</MenuItem>
                </TextField>
              </Grid>
            )}
          </FormPaper>

          {/* Per-Listing Order Limits */}
          <FormPaper title={t("CreateListingV2.orderLimits", "Order Limits")}>
            <Grid item xs={12} sm={6} md={3}>
              <NumericFormat
                decimalScale={0} allowNegative={false} customInput={TextField}
                thousandSeparator size="small" fullWidth color="secondary"
                label={t("CreateListingV2.minQuantity", "Min Quantity")}
                value={minOrderQuantity ?? ""}
                onValueChange={(v) => setMinOrderQuantity(v.floatValue ?? null)}
                helperText={t("CreateListingV2.minQuantityHelp", "Optional")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumericFormat
                decimalScale={0} allowNegative={false} customInput={TextField}
                thousandSeparator size="small" fullWidth color="secondary"
                label={t("CreateListingV2.maxQuantity", "Max Quantity")}
                value={maxOrderQuantity ?? ""}
                onValueChange={(v) => setMaxOrderQuantity(v.floatValue ?? null)}
                helperText={t("CreateListingV2.maxQuantityHelp", "Optional")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumericFormat
                decimalScale={0} allowNegative={false} customInput={TextField}
                thousandSeparator size="small" fullWidth color="secondary"
                label={t("CreateListingV2.minValue", "Min Value (aUEC)")}
                value={minOrderValue ?? ""}
                onValueChange={(v) => setMinOrderValue(v.floatValue ?? null)}
                InputProps={{ endAdornment: <Typography variant="caption">aUEC</Typography> }}
                helperText={t("CreateListingV2.minValueHelp", "Optional")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumericFormat
                decimalScale={0} allowNegative={false} customInput={TextField}
                thousandSeparator size="small" fullWidth color="secondary"
                label={t("CreateListingV2.maxValue", "Max Value (aUEC)")}
                value={maxOrderValue ?? ""}
                onValueChange={(v) => setMaxOrderValue(v.floatValue ?? null)}
                InputProps={{ endAdornment: <Typography variant="caption">aUEC</Typography> }}
                helperText={t("CreateListingV2.maxValueHelp", "Optional")}
              />
            </Grid>
          </FormPaper>

          {/* Bulk Discount Tiers */}
          <FormPaper title={t("market.bulkDiscountTiers", "Bulk Discounts")}>
            <Grid item xs={12}>
              <BulkDiscountTierEditor tiers={bulkDiscountTiers} onChange={setBulkDiscountTiers} />
            </Grid>
          </FormPaper>

          {/* Pricing Section */}
          <FormPaper title={t("CreateListingV2.pricing", "Pricing")}>
            {/* Pricing Mode Selector */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {t("CreateListingV2.pricingMode", "Pricing Mode")}
                  </Typography>
                </FormLabel>
                <RadioGroup
                  row
                  value={pricingMode}
                  onChange={(e) =>
                    setPricingMode(e.target.value as "unified" | "per_variant")
                  }
                >
                  <FormControlLabel
                    value="unified"
                    control={<Radio color="secondary" />}
                    label={t("CreateListingV2.unifiedPricing", "Unified Price")}
                  />
                  <FormControlLabel
                    value="per_variant"
                    control={<Radio color="secondary" />}
                    label={t("CreateListingV2.perVariantPricing", "Per-Variant Pricing")}
                  />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  {pricingMode === "unified"
                    ? t(
                        "CreateListingV2.unifiedPricingHelp",
                        "All variants will have the same price"
                      )
                    : t(
                        "CreateListingV2.perVariantPricingHelp",
                        "Set different prices for each variant"
                      )}
                </Typography>
              </FormControl>
            </Grid>

            {/* Base Price (Unified Mode) */}
            {pricingMode === "unified" && (
              <Grid item xs={12} md={6}>
                <NumericFormat
                  decimalScale={0}
                  allowNegative={false}
                  customInput={TextField}
                  thousandSeparator
                  size="small"
                  fullWidth
                  onValueChange={(values) => {
                    setBasePrice(values.floatValue || 0);
                  }}
                  label={t("CreateListingV2.basePrice", "Base Price")}
                  value={basePrice}
                  color="secondary"
                  InputProps={{
                    endAdornment: <Typography>aUEC</Typography>,
                    inputMode: "numeric",
                  }}
                  required
                  inputProps={{
                    "aria-label": t(
                      "CreateListingV2.basePriceAriaLabel",
                      "Enter base price"
                    ),
                  }}
                />
              </Grid>
            )}
          </FormPaper>

          {/* Stock Lots Section */}
          <FormPaper
            title={t("CreateListingV2.stockLots", "Stock Lots")}
            subtitle={t(
              "CreateListingV2.stockLotsSubtitle",
              "Add inventory with variant attributes"
            )}
          >
            {stockLots.map((lot, index) => (
              <Grid item xs={12} key={lot.id}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
                    position: "relative",
                  }}
                >
                  {/* Lot Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {t("CreateListingV2.lot", "Lot")} {index + 1}
                    </Typography>
                    {stockLots.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveStockLot(lot.id)}
                        aria-label={t("CreateListingV2.removeLot", "Remove lot")}
                      >
                        <DeleteOutline />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {/* Quantity */}
                    <Grid item xs={12} sm={6} md={4}>
                      <NumericFormat
                        decimalScale={0}
                        allowNegative={false}
                        customInput={TextField}
                        thousandSeparator
                        size="small"
                        fullWidth
                        onValueChange={(values) => {
                          handleUpdateStockLot(lot.id, "quantity", values.floatValue || 0);
                        }}
                        label={t("CreateListingV2.quantity", "Quantity")}
                        value={lot.quantity}
                        color="secondary"
                        required
                        inputProps={{
                          inputMode: "numeric",
                          "aria-label": t(
                            "CreateListingV2.quantityAriaLabel",
                            "Enter quantity"
                          ),
                        }}
                      />
                    </Grid>

                    {/* Quality Tier */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("CreateListingV2.qualityTier", "Quality Tier")}
                        value={lot.quality_tier ?? ""}
                        onChange={(e) =>
                          handleUpdateStockLot(
                            lot.id,
                            "quality_tier",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        color="secondary"
                        helperText={t(
                          "CreateListingV2.qualityTierHelp",
                          "Optional: 1-5"
                        )}
                      >
                        <MenuItem value="">
                          {t("CreateListingV2.notSpecified", "Not specified")}
                        </MenuItem>
                        {[1, 2, 3, 4, 5].map((tier) => (
                          <MenuItem key={tier} value={tier}>
                            {t("CreateListingV2.tier", "Tier")} {tier}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Quality Value */}
                    <Grid item xs={12} sm={6} md={4}>
                      <NumericFormat
                        decimalScale={0}
                        allowNegative={false}
                        customInput={TextField}
                        size="small"
                        fullWidth
                        isAllowed={({ floatValue }) => !floatValue || floatValue <= 1000}
                        onValueChange={(values) => {
                          handleUpdateStockLot(
                            lot.id,
                            "quality_value",
                            values.floatValue
                          );
                        }}
                        label={t("CreateListingV2.qualityValue", "Quality Value")}
                        value={lot.quality_value ?? ""}
                        color="secondary"
                        helperText={t(
                          "CreateListingV2.qualityValueHelp",
                          "Optional: 0-1000"
                        )}
                        inputProps={{
                          inputMode: "decimal",
                          "aria-label": t(
                            "CreateListingV2.qualityValueAriaLabel",
                            "Enter quality value"
                          ),
                        }}
                      />
                    </Grid>

                    {/* Crafted Source */}
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("CreateListingV2.craftedSource", "Source")}
                        value={lot.crafted_source ?? ""}
                        onChange={(e) =>
                          handleUpdateStockLot(
                            lot.id,
                            "crafted_source",
                            e.target.value || undefined
                          )
                        }
                        color="secondary"
                        helperText={t(
                          "CreateListingV2.craftedSourceHelp",
                          "Optional: How item was obtained"
                        )}
                      >
                        <MenuItem value="">
                          {t("CreateListingV2.notSpecified", "Not specified")}
                        </MenuItem>
                        <MenuItem value="crafted">
                          {t("CreateListingV2.crafted", "Crafted")}
                        </MenuItem>
                        <MenuItem value="store">
                          {t("CreateListingV2.store", "Store")}
                        </MenuItem>
                        <MenuItem value="looted">
                          {t("CreateListingV2.looted", "Looted")}
                        </MenuItem>
                        <MenuItem value="unknown">
                          {t("CreateListingV2.unknown", "Unknown")}
                        </MenuItem>
                        <MenuItem value="duped">
                          {t("CreateListingV2.duped", "Duped")}
                        </MenuItem>
                      </TextField>
                    </Grid>

                    {/* Location */}
                    <Grid item xs={12} sm={6} md={4}>
                      <LocationSelector
                        value={lot.location_id ?? null}
                        onChange={(locationId) =>
                          handleUpdateStockLot(lot.id, "location_id", locationId)
                        }
                        size="small"
                        fullWidth
                        label={t("CreateListingV2.location", "Location")}
                      />
                    </Grid>

                    {/* Per-Variant Price */}
                    {pricingMode === "per_variant" && (
                      <Grid item xs={12} sm={6} md={4}>
                        <NumericFormat
                          decimalScale={0}
                          allowNegative={false}
                          customInput={TextField}
                          thousandSeparator
                          size="small"
                          fullWidth
                          onValueChange={(values) => {
                            handleUpdateStockLot(lot.id, "price", values.floatValue || 0);
                          }}
                          label={t("CreateListingV2.price", "Price")}
                          value={lot.price ?? ""}
                          color="secondary"
                          required
                          InputProps={{
                            endAdornment: <Typography>aUEC</Typography>,
                            inputMode: "numeric",
                          }}
                          inputProps={{
                            "aria-label": t(
                              "CreateListingV2.priceAriaLabel",
                              "Enter price for this variant"
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    {/* Notes */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        size="small"
                        fullWidth
                        label={t("CreateListingV2.notes", "Notes")}
                        value={lot.notes ?? ""}
                        onChange={(e) =>
                          handleUpdateStockLot(lot.id, "notes", e.target.value || undefined)
                        }
                        color="secondary"
                        helperText={t("CreateListingV2.notesHelp", "Optional: Internal notes for this lot")}
                      />
                    </Grid>

                    {/* Listed */}
                    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={lot.listed !== false}
                            onChange={(e) =>
                              handleUpdateStockLot(lot.id, "listed", e.target.checked)
                            }
                            color="secondary"
                          />
                        }
                        label={t("CreateListingV2.listed", "Listed for sale")}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}

            {/* Add Stock Lot Button */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddCircleOutlineRounded />}
                onClick={handleAddStockLot}
              >
                {t("CreateListingV2.addStockLot", "Add Stock Lot")}
              </Button>
            </Grid>
          </FormPaper>

          {/* Submit Button */}
          <Grid item xs={12} container justifyContent="flex-end">
            <LoadingButton
              size="large"
              variant="contained"
              color="secondary"
              type="submit"
              loading={isLoading}
              aria-label={t("CreateListingV2.submit", "Create Listing")}
            >
              {t("CreateListingV2.submit", "Create Listing")}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </StandardPageLayout>
  );
}
