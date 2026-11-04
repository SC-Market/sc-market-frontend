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
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor";
import {
  useGetListingDetailQuery,
  useGetMyShopsQuery,
  useGetStockLotsQuery,
  useUpdateListingMutation,
} from "../../../store/api/v2/market";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { PriceComparisonAlert } from "../components/PriceComparisonAlert";
import { SelectPhotosArea } from "../../../components/modal/SelectPhotosArea";
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths";
import { withShopContext } from "../../../components/sidebar/shopContextState";
import {
  focusListingField,
  LISTING_FIELD_IDS,
  listingApiError,
  type ListingFormError,
  type ListingFormField,
} from "../domain/listingFormErrors";
import { lotUpdatesForQuantityChange, type LotQuantity } from "../domain/lotQuantityUpdates";
import type {
  UpdateListingRequest,
  VariantPriceUpdate,
  LotUpdate,
} from "../../../store/api/v2/market";
import { usePhotoUploads } from "../hooks/usePhotoUploads";

/**
 * Variant form data for editing — matches what the listing detail shows
 */
interface VariantFormData {
  variant_id: string;
  /** The variant's listed lots, newest first: a quantity change is applied to them */
  lots: LotQuantity[];
  /** The quantity as loaded: saving sends only the change from it */
  originalQuantity: number;
  quantity: number;
  quality_tier?: number;
  quality_value?: number;
  crafted_source?: "crafted" | "store" | "looted" | "unknown" | "duped";
  price?: number; // For per_variant pricing mode
  display_name: string;
  short_name: string;
  locations: string[];
  isModified: boolean;
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

  // Scoped to the listing's shop: without it the lookup only covers your own
  // shops, so an org shop's lots were never found and quantity edits dropped.
  const shopId = listingData?.listing.shop_id;
  const { data: stockLotsData } = useGetStockLotsQuery(
    { listingId: id!, listed: true, pageSize: 100, shopId },
    { skip: !shopId },
  );

  // The listing's shop, if you manage it: saving and archiving stay in its context
  const { data: myShops } = useGetMyShopsQuery();
  const shopSlug = myShops?.find((s) => s.shop_id === shopId)?.slug;
  const navState = shopSlug ? { state: withShopContext(shopSlug) } : undefined;

  // The error being shown: next to its field, and above the submit button
  const [formError, setFormError] = useState<ListingFormError | null>(null);
  const fieldError = (field: ListingFormField) =>
    formError?.field === field ? formError.message : undefined;
  const clearError = (field: ListingFormField) =>
    setFormError((prev) => (prev?.field === field ? null : prev));
  const showError = (error: ListingFormError) => {
    setFormError(error);
    focusListingField(error.field);
  };

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">("unified");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [pickupMethod, setPickupMethod] = useState<"delivery" | "pickup" | "any" | "">(""); 
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<Array<{ min_quantity: number; discount_percent: number }>>([]);

  // Variant state — mirrors what listing detail shows
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  // RTK Query mutations
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();

  // Visibility state
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const {
    uploadedImages,
    photoResourceIds,
    isUploading,
    upload: handleFileUpload,
    remove: handleRemoveUploadedImage,
  } = usePhotoUploads(t("SelectPhotosArea.uploadFailed", "Upload failed"));

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
    setVisibility(listingData.listing.visibility === "private" ? "private" : "public");

    // Get first item (assuming single item listings for now)
    const firstItem = listingData.items[0];
    if (firstItem) {
      setPricingMode(firstItem.pricing_mode);
      setBasePrice(firstItem.base_price || 0);
      setBulkDiscountTiers((firstItem as { bulk_discount_tiers?: { min_quantity: number; discount_percent: number }[] }).bulk_discount_tiers || []);

      // Build variant form data from listing detail variants
      // Each variant's listed lots (newest first, as the API returns them), so
      // a quantity change can be sent as lot_updates on save
      const lotsByVariant = new Map<string, LotQuantity[]>();
      for (const lot of stockLotsData?.lots || []) {
        const lots = lotsByVariant.get(lot.variant.variant_id) ?? [];
        lots.push({ lot_id: lot.lot_id, quantity_total: lot.quantity_total });
        lotsByVariant.set(lot.variant.variant_id, lots);
      }

      const variantData: VariantFormData[] = firstItem.variants.map((v) => ({
        variant_id: v.variant_id,
        lots: lotsByVariant.get(v.variant_id) ?? [],
        originalQuantity: v.quantity,
        quantity: v.quantity,
        quality_tier: v.attributes.quality_tier,
        quality_value: v.attributes.quality_value,
        crafted_source: v.attributes.crafted_source,
        price: v.price,
        display_name: v.display_name,
        short_name: v.short_name,
        locations: v.locations,
        isModified: false,
      }));

      setVariants(variantData);
    }
  }, [listingData, stockLotsData]);

  // Update variant field
  const handleUpdateVariant = useCallback(
    (variant_id: string, field: keyof VariantFormData, value: VariantFormData[keyof VariantFormData]) => {
      setVariants((prev) =>
        prev.map((v) =>
          v.variant_id === variant_id ? { ...v, [field]: value, isModified: true } : v
        )
      );
    },
    []
  );

  // Validate form. The description is optional.
  const validateForm = (): ListingFormError | null => {
    if (!title.trim()) {
      return { field: "title", message: t("EditListingV2.validation.titleRequired", "Title is required") };
    }
    if (title.length > 500) {
      return {
        field: "title",
        message: t("EditListingV2.validation.titleTooLong", "Title must be 500 characters or less"),
      };
    }
    if (pricingMode === "unified" && (!basePrice || basePrice <= 0)) {
      return {
        field: "base_price",
        message: t("EditListingV2.validation.basePriceRequired", "Base price must be greater than 0"),
      };
    }

    // Validate each variant
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (v.quantity < 0) {
        return {
          field: "form",
          message: t(
            "EditListingV2.validation.quantityInvalid",
            "Quantity must be 0 or greater for variant {{index}}",
            { index: i + 1 }
          ),
        };
      }
      if (pricingMode === "per_variant" && (!v.price || v.price <= 0)) {
        return {
          field: "form",
          message: t(
            "EditListingV2.validation.variantPriceRequired",
            "Price must be greater than 0 for variant {{index}} in per-variant pricing mode",
            { index: i + 1 }
          ),
        };
      }
    }

    return null;
  };

  // Submit form
  const handleSubmit = async (event: React.FormEvent) => {
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
        showError(validationError);
        issueAlert({
          message: validationError.message,
          severity: "error",
        });
        return;
      }
      setFormError(null);

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

      // Sync photos: detect removals and newly-added external URLs separately.
      const originalPhotos = listingData?.listing.photos || [];
      const originalSet = new Set(originalPhotos);
      const newExternalUrls = photos.filter((p) => !originalSet.has(p));
      // If any existing photo was removed, send the replace-set (minus the new
      // URLs, which don't exist in the DB yet — they'll be handled separately).
      const keptPhotos = photos.filter((p) => originalSet.has(p));
      if (JSON.stringify(keptPhotos) !== JSON.stringify(originalPhotos)) {
        request.photos = keptPhotos;
      }
      // Send newly pasted external URLs for creation.
      if (newExternalUrls.length > 0) {
        request.external_photo_urls = newExternalUrls;
      }

      // Include visibility if changed
      const currentVisibility = listingData?.listing.visibility === "private" ? "private" : "public";
      if (visibility !== currentVisibility) {
        request.visibility = visibility;
      }

      // Include bulk discount tiers
      const currentTiers = (listingData?.items[0] as { bulk_discount_tiers?: { min_quantity: number; discount_percent: number }[] })?.bulk_discount_tiers || [];
      if (JSON.stringify(bulkDiscountTiers) !== JSON.stringify(currentTiers)) {
        request.bulk_discount_tiers = bulkDiscountTiers;
      }

      // Handle pricing updates
      if (pricingMode === "unified") {
        if (basePrice !== (listingData?.items[0]?.base_price || 0)) {
          request.base_price = basePrice;
        }
      } else {
        // Per-variant pricing
        const variantPrices: VariantPriceUpdate[] = variants
          .filter((v) => v.isModified && v.price !== undefined)
          .map((v) => ({
            variant_id: v.variant_id,
            price: v.price!,
          }));

        if (variantPrices.length > 0) {
          request.variant_prices = variantPrices;
        }
      }

      // Quantity changes go to the variant's lots as lot_updates. Only the
      // change is sent: writing the variant's total into its first lot
      // multiplied the stock when the variant was spread over several lots.
      const lotUpdates: LotUpdate[] = [];
      for (const v of variants) {
        if (!v.isModified) continue;
        const updates = lotUpdatesForQuantityChange(v.lots, v.quantity - v.originalQuantity);
        if (!updates) {
          issueAlert({
            message: t(
              "ItemStock.quantityUseStockPage",
              "Change this listing's quantity per lot on the Stock page",
            ),
            severity: "error",
          });
          return;
        }
        lotUpdates.push(...updates);
      }

      if (lotUpdates.length > 0) {
        request.lot_updates = lotUpdates;
      }

      // Include newly uploaded photo resource IDs
      if (photoResourceIds.length > 0) {
        request.photo_resource_ids = photoResourceIds;
      }

      // Check if there are any changes (an emptied description is one)
      if (Object.keys(request).length === 0) {
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

        issueAlert({
          message: t("EditListingV2.success", "Listing updated successfully"),
          severity: "success",
        });

        // Navigate back to listing detail page
        // The slug URL: /market/<id> is redirected to it, which drops the
        // router state that keeps the shop context
        navigate(MARKET_PATHS.listing(id!, title.trim()), navState);
      } catch (error) {
        const apiError = listingApiError(error, t("EditListingV2.error", "Failed to update listing"));
        showError(apiError);
        issueAlert({ message: apiError.message, severity: "error" });
      }
  };



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
      <form onSubmit={handleSubmit} noValidate>
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
                        issueAlert({ message: t("marketV2.activated"), severity: "success" })
                      } catch { issueAlert({ message: t("marketV2.activateFailed"), severity: "error" }) }
                    }}
                  >
                    {t("marketV2.activate")}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<PauseCircleRounded />}
                    onClick={async () => {
                      try {
                        await updateListing({ id: id!, updateListingRequest: { status: "inactive" } }).unwrap()
                        issueAlert({ message: t("marketV2.deactivated"), severity: "success" })
                      } catch { issueAlert({ message: t("marketV2.deactivateFailed"), severity: "error" }) }
                    }}
                  >
                    {t("marketV2.deactivate")}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<ArchiveRounded />}
                  onClick={async () => {
                    try {
                      await updateListing({ id: id!, updateListingRequest: { status: "cancelled" } }).unwrap()
                      issueAlert({ message: t("marketV2.archived"), severity: "success" })
                      navigate(shopSlug ? SHOP_PATHS.listings(shopSlug) : MARKET_PATHS.manage)
                    } catch { issueAlert({ message: t("marketV2.archiveFailed"), severity: "error" }) }
                  }}
                >
                  {t("marketV2.archive")}
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
                id={LISTING_FIELD_IDS.title}
                label={t("EditListingV2.title", "Title")}
                value={title}
                onChange={(e) => {
                  clearError("title");
                  setTitle(e.target.value);
                }}
                color="secondary"
                required
                error={!!fieldError("title")}
                disabled={!canEdit}
                inputProps={{
                  maxLength: 500,
                  "aria-label": t("EditListingV2.titleAriaLabel", "Enter listing title"),
                }}
                helperText={fieldError("title") ?? (title.length > 450 ? `${title.length}/500` : undefined)}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <MarkdownEditor
                onChange={(value: string) => {
                  clearError("description");
                  setDescription(value);
                }}
                value={description}
                TextFieldProps={{
                  id: LISTING_FIELD_IDS.description,
                  label: t("CreateListingV2.descriptionOptional", "Description (optional)"),
                  error: !!fieldError("description"),
                  helperText:
                    fieldError("description") ??
                    (description.length > 1900
                      ? `${description.length}/2000`
                      : t(
                          "EditListingV2.descriptionHelp",
                          "Provide a detailed description (markdown supported)"
                        )),
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
                {t(
                  "EditListingV2.imageSizeLimit",
                  "(Large images are optimized automatically)",
                )}
              </Typography>
              <SelectPhotosArea
                setPhotos={setPhotos}
                photos={photos}
                onFileUpload={handleFileUpload}
                onAlert={(severity: "warning" | "error", message: string) => issueAlert({ severity, message })}
                onImageUploaded={(resourceId, url) => {
                  // Already handled in handleFileUpload
                }}
                uploadedImages={uploadedImages}
                onRemoveUploadedImage={handleRemoveUploadedImage}
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
                onChange={(e) => setPickupMethod(e.target.value as typeof pickupMethod)}
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

          {/* Visibility */}
          <FormPaper title={t("market.visibility", "Visibility")}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("market.visibility", "Visibility")}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                disabled={!canEdit}
                helperText={visibility === "private"
                  ? t("market.visibilityPrivateHelp", "Only visible to organization members")
                  : t("market.visibilityPublicHelp", "Visible to all buyers")
                }
              >
                <MenuItem value="public">{t("market.visibilityPublic", "Public")}</MenuItem>
                <MenuItem value="private">{t("market.visibilityPrivate", "Private (org members only)")}</MenuItem>
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
                    clearError("base_price");
                    setBasePrice(values.floatValue || 0);
                  }}
                  id={LISTING_FIELD_IDS.base_price}
                  label={t("EditListingV2.basePrice", "Base Price")}
                  value={basePrice}
                  color="secondary"
                  disabled={!canEdit}
                  InputProps={{
                    endAdornment: <Typography>aUEC</Typography>,
                    inputMode: "numeric",
                  }}
                  required
                  error={!!fieldError("base_price")}
                  helperText={fieldError("base_price")}
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
          {variants.length > 0 && (
          <FormPaper
            title={t("EditListingV2.variants", "Variants")}
            subtitle={t(
              "EditListingV2.variantsSubtitle",
              "Update quantities and prices for each variant"
            )}
          >
            {variants.map((v, index) => (
              <Grid item xs={12} key={v.variant_id}>
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
                      {v.display_name || t("marketV2.variantN", { n: index + 1 })}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {v.locations.length > 0 && (
                        <Chip label={v.locations[0]} size="small" variant="outlined" />
                      )}
                      {v.isModified && (
                        <Chip
                          label={t("EditListingV2.modified", "Modified")}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Stack>
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
                          handleUpdateVariant(
                            v.variant_id,
                            "quantity",
                            values.floatValue || 0
                          );
                        }}
                        label={t("EditListingV2.quantity", "Quantity")}
                        value={v.quantity}
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
                    {v.quality_tier !== undefined && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.qualityTier", "Quality Tier")}
                          value={`Tier ${v.quality_tier}`}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

                    {/* Quality Value (Read-only) */}
                    {v.quality_value !== undefined && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.qualityValue", "Quality Value")}
                          value={v.quality_value.toFixed(2)}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

                    {/* Crafted Source (Read-only) */}
                    {v.crafted_source && (
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t("EditListingV2.craftedSource", "Source")}
                          value={v.crafted_source}
                          color="secondary"
                          disabled
                        />
                      </Grid>
                    )}

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
                            handleUpdateVariant(
                              v.variant_id,
                              "price",
                              values.floatValue || 0
                            );
                          }}
                          label={t("EditListingV2.price", "Price")}
                          value={v.price ?? ""}
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
          )}

          {formError && (
            <Grid item xs={12}>
              <Alert severity="error" role="alert">
                {formError.message}
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12} container justifyContent="space-between">
            <Button
              size="large"
              variant="outlined"
              color="secondary"
              onClick={() => navigate(MARKET_PATHS.listing(id!, listingData?.listing.title), navState)}
            >
              {t("EditListingV2.cancel", "Cancel")}
            </Button>

            <LoadingButton
              size="large"
              variant="contained"
              color="secondary"
              type="submit"
              loading={isUpdating}
              disabled={!canEdit || isUploading}
              aria-label={t("EditListingV2.submit", "Update Listing")}
            >
              {isUploading
                ? t("EditListingV2.uploadingPhotos", "Uploading photos...")
                : t("EditListingV2.submit", "Update Listing")}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
      </Grid>
    </StandardPageLayout>
  );
}
