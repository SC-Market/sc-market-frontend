import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip,
  Alert,
  Skeleton,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import LoadingButton from "@mui/lab/LoadingButton";
import { AddCircleOutlineRounded, DeleteOutline, CheckCircleRounded, PauseCircleRounded, ArchiveRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { FormPaper } from "../../../components/paper/FormPaper";
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy";
import { LocationSelector } from "../components/stock/LocationSelector";
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor";
import {
  useGetListingDetailQuery,
  useGetStockLotsQuery,
  useUpdateListingMutation,
  useUploadPhotosMutation,
} from "../../../store/api/v2/market";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { PriceComparisonAlert } from "../components/PriceComparisonAlert";
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea";
import type {
  UpdateListingRequest,
  VariantPriceUpdate,
  LotUpdate,
} from "../../../store/api/v2/market";

/**
 * Stock lot form data for editing
 */
interface StockLotFormData {
  lot_id: string; // Existing lot ID
  variant_id: string;
  quantity: number;
  quality_tier?: number;
  quality_value?: number;
  crafted_source?: "crafted" | "store" | "looted" | "unknown" | "duped";
  location_id?: string;
  price?: number; // For per_variant pricing mode
  display_name: string; // For display purposes
  isModified: boolean; // Track if lot has been modified
}

/**
 * EditListingV2 - Form component for editing V2 listings
 *
 * Features:
 * - Reuses CreateListingV2 form structure
 * - Pre-populates form with existing listing data
 * - Allows updating title, description, prices, quantities
 * - Shows variant breakdown with inline editing
 * - Uses useUpdateListingMutation hook
 * - Prevents editing sold or cancelled listings
 * - Shows success message after update
 *
 * Requirements: 17.1-17.12
 */
export function EditListingV2() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const navigate = useNavigate();
  const issueAlert = useAlertHook();

  // Fetch existing listing data
  const {
    data: listingData,
    isLoading: isLoadingListing,
    error: loadError,
  } = useGetListingDetailQuery({ id: id! });
  const { data: stockLotsData } = useGetStockLotsQuery({ listingId: id! });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">("unified");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [pickupMethod, setPickupMethod] = useState<"delivery" | "pickup" | "any" | "">(""); 
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<Array<{ min_quantity: number; discount_percent: number }>>([]);

  // Stock lots state - flattened from variants
  const [stockLots, setStockLots] = useState<StockLotFormData[]>([]);

  // RTK Query mutation
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const [uploadPhotos] = useUploadPhotosMutation();

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Check if listing can be edited
  const canEdit = useMemo(() => {
    if (!listingData) return false;
    const status = listingData.listing.status;
    return status !== "sold" && status !== "cancelled";
  }, [listingData]);

  // Pre-populate form when listing data loads
  useEffect(() => {
    if (!listingData) return;

    setTitle(listingData.listing.title);
    setDescription(listingData.listing.description || "");
    setPickupMethod(listingData.listing.pickup_method || "");
    setPhotos(listingData.listing.photos || []);

    // Get first item (assuming single item listings for now)
    const firstItem = listingData.items[0];
    if (firstItem) {
      setPricingMode(firstItem.pricing_mode);
      setBasePrice(firstItem.base_price || 0);
      setBulkDiscountTiers((firstItem as any).bulk_discount_tiers || []);

      // Build stock lots from actual lot data (not variant aggregates)
      const actualLots = stockLotsData?.lots || [];
      const lots: StockLotFormData[] = actualLots.map((lot) => ({
        lot_id: lot.lot_id,
        variant_id: lot.variant.variant_id,
        quantity: lot.quantity_total,
        quality_tier: lot.variant.attributes.quality_tier,
        quality_value: lot.variant.attributes.quality_value,
        crafted_source: lot.variant.attributes.crafted_source,
        location_id: lot.location?.location_id,
        price: firstItem.variants.find((v) => v.variant_id === lot.variant.variant_id)?.price ?? 0,
        display_name: lot.variant.display_name,
        isModified: false,
      }));

      setStockLots(lots);
    }
  }, [listingData, stockLotsData]);

  // Update stock lot field
  const handleUpdateStockLot = useCallback(
    (lot_id: string, field: keyof StockLotFormData, value: any) => {
      setStockLots((prev) =>
        prev.map((lot) =>
          lot.lot_id === lot_id ? { ...lot, [field]: value, isModified: true } : lot
        )
      );
    },
    []
  );

  // Validate form
  const validateForm = useCallback((): string | null => {
    if (!title.trim()) {
      return t("EditListingV2.validation.titleRequired", "Title is required");
    }
    if (title.length > 500) {
      return t(
        "EditListingV2.validation.titleTooLong",
        "Title must be 500 characters or less"
      );
    }
    if (!description.trim()) {
      return t("EditListingV2.validation.descriptionRequired", "Description is required");
    }
    if (pricingMode === "unified" && (!basePrice || basePrice <= 0)) {
      return t(
        "EditListingV2.validation.basePriceRequired",
        "Base price must be greater than 0"
      );
    }

    // Validate each stock lot
    for (let i = 0; i < stockLots.length; i++) {
      const lot = stockLots[i];
      if (!lot.quantity || lot.quantity < 0) {
        return t(
          "EditListingV2.validation.quantityInvalid",
          "Quantity must be 0 or greater for lot {{index}}",
          { index: i + 1 }
        );
      }
      if (pricingMode === "per_variant" && (!lot.price || lot.price <= 0)) {
        return t(
          "EditListingV2.validation.variantPriceRequired",
          "Price must be greater than 0 for lot {{index}} in per-variant pricing mode",
          { index: i + 1 }
        );
      }
    }

    return null;
  }, [title, description, pricingMode, basePrice, stockLots, t]);

  // Submit form
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!canEdit) {
        issueAlert({
          message: t(
            "EditListingV2.cannotEdit",
            "Cannot edit sold or cancelled listings"
          ),
          severity: "error",
        });
        return;
      }

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        issueAlert({
          message: validationError,
          severity: "error",
        });
        return;
      }

      // Build update request
      const request: UpdateListingRequest = {};

      // Only include changed fields
      if (title !== listingData?.listing.title) {
        request.title = title.trim();
      }
      if (description !== (listingData?.listing.description || "")) {
        request.description = description.trim();
      }

      const currentPickup = listingData?.listing.pickup_method || "";
      if (pickupMethod !== currentPickup) {
        request.pickup_method = pickupMethod || null;
      }

      // Include bulk discount tiers
      const currentTiers = (listingData?.items[0] as any)?.bulk_discount_tiers || [];
      if (JSON.stringify(bulkDiscountTiers) !== JSON.stringify(currentTiers)) {
        (request as any).bulk_discount_tiers = bulkDiscountTiers;
      }

      // Handle pricing updates
      if (pricingMode === "unified") {
        if (basePrice !== (listingData?.items[0]?.base_price || 0)) {
          request.base_price = basePrice;
        }
      } else {
        // Per-variant pricing
        const variantPrices: VariantPriceUpdate[] = stockLots
          .filter((lot) => lot.isModified && lot.price !== undefined)
          .map((lot) => ({
            variant_id: lot.variant_id,
            price: lot.price!,
          }));

        if (variantPrices.length > 0) {
          request.variant_prices = variantPrices;
        }
      }

      // Handle lot updates (quantity and location changes)
      const lotUpdates: LotUpdate[] = stockLots
        .filter((lot) => lot.isModified)
        .map((lot) => ({
          lot_id: lot.lot_id,
          quantity_total: lot.quantity,
          location_id: lot.location_id,
        }));

      if (lotUpdates.length > 0) {
        request.lot_updates = lotUpdates;
      }

      // Check if there are any changes
      if (
        !request.title &&
        !request.description &&
        !request.base_price &&
        !request.variant_prices &&
        !request.lot_updates
      ) {
        issueAlert({
          message: t("EditListingV2.noChanges", "No changes to save"),
          severity: "info",
        });
        return;
      }

      try {
        await updateListing({
          id: id!,
          updateListingRequest: request,
        }).unwrap();

        // Upload new photos if any files were selected
        if (uploadedFiles.length > 0) {
          try {
            await uploadPhotos({ id: id!, photos: uploadedFiles }).unwrap();
          } catch {
            issueAlert({
              message: t("EditListingV2.photoUploadError", "Listing updated but photo upload failed"),
              severity: "warning",
            });
          }
        }

        issueAlert({
          message: t("EditListingV2.success", "Listing updated successfully"),
          severity: "success",
        });

        // Navigate back to listing detail page
        navigate(`/market/${id}`);
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.message ||
            t("EditListingV2.error", "Failed to update listing"),
          severity: "error",
        });
      }
    },
    [
      canEdit,
      validateForm,
      title,
      description,
      pricingMode,
      basePrice,
      stockLots,
      listingData,
      updateListing,
      id,
      issueAlert,
      navigate,
      t,
    ]
  );

  // Show loading state
  if (isLoadingListing) {
    return (
      <StandardPageLayout
        title={t("EditListingV2.pageTitle", "Edit Listing")}
        isLoading={true}
        sidebarOpen={true}
        maxWidth="lg"
        skeleton={
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, width: "50%" }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, width: "50%" }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1, width: 120, ml: "auto" }} />
            </Stack>
          </Grid>
        }
      >
        <Box />
      </StandardPageLayout>
    );
  }

  // Show error state
  if (loadError || !listingData) {
    return (
      <StandardPageLayout
        title={t("EditListingV2.pageTitle", "Edit Listing")}
        error="not_found"
        sidebarOpen={true}
        maxWidth="lg"
      >
        <Box />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t("EditListingV2.pageTitle", "Edit Listing")}
      headerTitle={
        <Typography variant="h4" fontWeight="bold" color="text.secondary">
          {t("EditListingV2.headerTitle", "Edit Listing")}
        </Typography>
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      {!canEdit && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t(
            "EditListingV2.cannotEditWarning",
            "This listing cannot be edited because it is {{status}}",
            { status: listingData.listing.status }
          )}
        </Alert>
      )}

      <Grid item xs={12}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* Status Actions */}
          {listingData.listing.status !== "sold" && listingData.listing.status !== "cancelled" && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {listingData.listing.status !== "active" ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleRounded />}
                    onClick={async () => {
                      try {
                        await updateListing({ id: id!, updateListingRequest: { status: "active" } }).unwrap()
                        issueAlert({ message: "Listing activated", severity: "success" })
                      } catch { issueAlert({ message: "Failed to activate", severity: "error" }) }
                    }}
                  >
                    Activate
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<PauseCircleRounded />}
                    onClick={async () => {
                      try {
                        await updateListing({ id: id!, updateListingRequest: { status: "expired" } }).unwrap()
                        issueAlert({ message: "Listing deactivated", severity: "success" })
                      } catch { issueAlert({ message: "Failed to deactivate", severity: "error" }) }
                    }}
                  >
                    Deactivate
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<ArchiveRounded />}
                  onClick={async () => {
                    try {
                      await updateListing({ id: id!, updateListingRequest: { status: "cancelled" } }).unwrap()
                      issueAlert({ message: "Listing archived", severity: "success" })
                      navigate("/market/manage")
                    } catch { issueAlert({ message: "Failed to archive", severity: "error" }) }
                  }}
                >
                  Archive
                </Button>
              </Box>
            </Grid>
          )}

          {/* About Section */}
          <FormPaper title={t("EditListingV2.about", "About")}>
            {/* Game Item (Read-only) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label={t("EditListingV2.gameItem", "Game Item")}
                value={listingData.items[0]?.game_item.name || ""}
                color="secondary"
                disabled
                helperText={t(
                  "EditListingV2.gameItemHelp",
                  "Game item cannot be changed"
                )}
              />
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                autoFocus
                label={t("EditListingV2.title", "Title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                color="secondary"
                required
                disabled={!canEdit}
                inputProps={{
                  maxLength: 500,
                  "aria-label": t("EditListingV2.titleAriaLabel", "Enter listing title"),
                }}
                helperText={title.length > 450 ? `${title.length}/500` : undefined}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <MarkdownEditor
                onChange={(value: string) => setDescription(value)}
                value={description}
                TextFieldProps={{
                  label: t("EditListingV2.description", "Description"),
                  helperText:
                    description.length > 1900
                      ? `${description.length}/2000`
                      : t(
                          "EditListingV2.descriptionHelp",
                          "Provide a detailed description (markdown supported)"
                        ),
                  inputProps: { maxLength: 2000 },
                  disabled: !canEdit,
                }}
                variant="vertical"
              />
            </Grid>
          </FormPaper>

          {/* Photos */}
          <FormPaper title={t("EditListingV2.photos", "Photos")}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("EditListingV2.imageSizeLimit", "(Max 2.5MB per image)")}
              </Typography>
              <SelectPhotosArea
                setPhotos={setPhotos}
                photos={photos}
                onFileUpload={(files: File[]) => setUploadedFiles((prev) => [...prev, ...files])}
                pendingFiles={uploadedFiles}
                onRemovePendingFile={(file: File) => setUploadedFiles((prev) => prev.filter((f) => f !== file))}
                onAlert={(severity: "warning" | "error", message: string) => issueAlert({ severity, message })}
              />
            </Grid>
          </FormPaper>

          {/* Pickup Method */}
          <FormPaper title={t("EditListingV2.pickupMethod", "Pickup Method")}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("EditListingV2.pickupMethod", "Pickup Method")}
                value={pickupMethod}
                onChange={(e) => setPickupMethod(e.target.value as any)}
                disabled={!canEdit}
                helperText={t("EditListingV2.pickupMethodHelper", "How will the buyer receive the item?")}
              >
                <MenuItem value="">{t("EditListingV2.notSpecified", "Not specified")}</MenuItem>
                <MenuItem value="delivery">{t("EditListingV2.delivery", "Delivery (seller delivers)")}</MenuItem>
                <MenuItem value="pickup">{t("EditListingV2.pickup", "Pickup (buyer picks up)")}</MenuItem>
                <MenuItem value="any">{t("EditListingV2.either", "Either (delivery or pickup)")}</MenuItem>
              </TextField>
            </Grid>
          </FormPaper>

          {/* Bulk Discount Tiers */}
          <FormPaper title={t("market.bulkDiscountTiers", "Bulk Discounts")}>
            <Grid item xs={12}>
              <BulkDiscountTierEditor tiers={bulkDiscountTiers} onChange={setBulkDiscountTiers} />
            </Grid>
          </FormPaper>

          {/* Pricing Section */}
          <FormPaper title={t("EditListingV2.pricing", "Pricing")}>
            {/* Pricing Mode (Read-only) */}
            <Grid item xs={12}>
              <FormControl component="fieldset" disabled>
                <FormLabel component="legend">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {t("EditListingV2.pricingMode", "Pricing Mode")}
                  </Typography>
                </FormLabel>
                <RadioGroup row value={pricingMode}>
                  <FormControlLabel
                    value="unified"
                    control={<Radio color="secondary" />}
                    label={t("EditListingV2.unifiedPricing", "Unified Price")}
                  />
                  <FormControlLabel
                    value="per_variant"
                    control={<Radio color="secondary" />}
                    label={t("EditListingV2.perVariantPricing", "Per-Variant Pricing")}
                  />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "EditListingV2.pricingModeHelp",
                    "Pricing mode cannot be changed after creation"
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
                  label={t("EditListingV2.basePrice", "Base Price")}
                  value={basePrice}
                  color="secondary"
                  disabled={!canEdit}
                  InputProps={{
                    endAdornment: <Typography>aUEC</Typography>,
                    inputMode: "numeric",
                  }}
                  required
                  inputProps={{
                    "aria-label": t(
                      "EditListingV2.basePriceAriaLabel",
                      "Enter base price"
                    ),
                  }}
                />
                {listingData.items[0]?.game_item?.id && basePrice > 0 && (
                  <PriceComparisonAlert gameItemId={listingData.items[0].game_item.id} currentPrice={basePrice} />
                )}
              </Grid>
            )}
          </FormPaper>

          {/* Variant Breakdown Section */}
          <FormPaper
            title={t("EditListingV2.variants", "Variants")}
            subtitle={t(
              "EditListingV2.variantsSubtitle",
              "Update quantities and prices for each variant"
            )}
          >
            {stockLots.map((lot, index) => (
              <Grid item xs={12} key={lot.lot_id}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
                    position: "relative",
                  }}
                >
                  {/* Variant Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {lot.display_name || `Variant ${index + 1}`}
                    </Typography>
                    {lot.isModified && (
                      <Chip
                        label={t("EditListingV2.modified", "Modified")}
                        color="primary"
                        size="small"
                      />
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
                          handleUpdateStockLot(
                            lot.lot_id,
                            "quantity",
                            values.floatValue || 0
                          );
                        }}
                        label={t("EditListingV2.quantity", "Quantity")}
                        value={lot.quantity}
                        color="secondary"
                        disabled={!canEdit}
                        required
                        inputProps={{
                          inputMode: "numeric",
                          "aria-label": t(
                            "EditListingV2.quantityAriaLabel",
                            "Enter quantity"
                          ),
                        }}
                      />
                    </Grid>

                    {/* Quality Tier (Read-only) */}
                    {lot.quality_tier !== undefined && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.qualityTier", "Quality Tier")}
                          value={`Tier ${lot.quality_tier}`}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

                    {/* Quality Value (Read-only) */}
                    {lot.quality_value !== undefined && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.qualityValue", "Quality Value")}
                          value={lot.quality_value.toFixed(2)}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

                    {/* Crafted Source (Read-only) */}
                    {lot.crafted_source && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.craftedSource", "Source")}
                          value={lot.crafted_source}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

                    {/* Location */}
                    <Grid item xs={12} sm={6} md={4}>
                      <LocationSelector
                        value={lot.location_id ?? null}
                        onChange={(locationId) =>
                          handleUpdateStockLot(lot.lot_id, "location_id", locationId)
                        }
                        size="small"
                        fullWidth
                        disabled={!canEdit}
                        label={t("EditListingV2.location", "Location")}
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
                            handleUpdateStockLot(
                              lot.lot_id,
                              "price",
                              values.floatValue || 0
                            );
                          }}
                          label={t("EditListingV2.price", "Price")}
                          value={lot.price ?? ""}
                          color="secondary"
                          disabled={!canEdit}
                          required
                          InputProps={{
                            endAdornment: <Typography>aUEC</Typography>,
                            inputMode: "numeric",
                          }}
                          inputProps={{
                            "aria-label": t(
                              "EditListingV2.priceAriaLabel",
                              "Enter price for this variant"
                            ),
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>
            ))}
          </FormPaper>

          {/* Action Buttons */}
          <Grid item xs={12} container justifyContent="space-between">
            <Button
              size="large"
              variant="outlined"
              color="secondary"
              onClick={() => navigate(`/market/${id}`)}
            >
              {t("EditListingV2.cancel", "Cancel")}
            </Button>

            <LoadingButton
              size="large"
              variant="contained"
              color="secondary"
              type="submit"
              loading={isUpdating}
              disabled={!canEdit}
              aria-label={t("EditListingV2.submit", "Update Listing")}
            >
              {t("EditListingV2.submit", "Update Listing")}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
      </Grid>
    </StandardPageLayout>
  );
}
