import React, { useState, useCallback } from "react";
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
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import LoadingButton from "@mui/lab/LoadingButton";
import { AddCircleOutlineRounded, DeleteOutline, ExpandMoreRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { FormPaper } from "../../../components/paper/FormPaper";
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy";
import { GameItemSearchAutocomplete } from "../components/GameItemSearchAutocomplete";
import { getQualityMode } from "../../../util/qualityMode";
import { SelectPhotosArea, UploadedImageStatus } from "../../../components/modal/SelectPhotosArea";
import { LocationSelector } from "../components/stock/LocationSelector";
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor";
import { QualityBandSelect } from "../../../components/game-data/QualityBandSelect";
import { useCreateListingMutation, useSearchResourcesQuery } from "../../../store/api/v2/market";
import { useUploadImageMutation } from "../../../store/api/v2/market-overrides";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { useGetUserProfileQuery } from "../../profile/api/profileApi";
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute";
import { Alert } from "@mui/material";
import { PriceComparisonAlert } from "../components/PriceComparisonAlert";
import type {
  CreateListingRequest,
  StockLotInput,
  VariantAttributes,
} from "../../../store/api/v2/market";

/**
 * Stock lot form data with variant attributes
 */
interface StockLotFormData {
  id: string;
  quantity: number;
  quality_tier?: number;
  quality_value?: number;
  crafted_source?: "crafted" | "store" | "looted" | "unknown";
  location_id?: string;
  price?: number;
  notes?: string;
  listed?: boolean;
}

export function CreateListingV2() {
  const { t } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const issueAlert = useAlertHook();
  const { data: profile } = useGetUserProfileQuery();
  const { shop } = useShopRouteContext();
  const isVerified = profile?.rsi_confirmed;

  // Form state — prefilled from ?game_item_id=&game_item_name=&game_item_type= query params
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameItemId, setGameItemId] = useState<string | null>(searchParams.get("game_item_id"));
  const [gameItemName, setGameItemName] = useState<string | null>(searchParams.get("game_item_name"));
  const [gameItemType, setGameItemType] = useState<string | null>(searchParams.get("game_item_type"));
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">("unified");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoResourceIds, setPhotoResourceIds] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageStatus[]>([]);
  const isUploading = uploadedImages.some((img) => img.status === "uploading");
  const [pickupMethod, setPickupMethod] = useState<"delivery" | "pickup" | "any" | "">("");
  const [quantityUnit, setQuantityUnit] = useState<"unit" | "scu">("unit");
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | null>(null);
  const [maxOrderQuantity, setMaxOrderQuantity] = useState<number | null>(null);
  const [minOrderValue, setMinOrderValue] = useState<number | null>(null);
  const [maxOrderValue, setMaxOrderValue] = useState<number | null>(null);
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<Array<{ min_quantity: number; discount_percent: number }>>([]);
  const [saleType, setSaleType] = useState<"fixed" | "auction" | "negotiable">("fixed");
  const [listingStatus, setListingStatus] = useState<"active" | "inactive">("active");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [auctionEndTime, setAuctionEndTime] = useState<string>("");
  const [minBidIncrement, setMinBidIncrement] = useState<number>(1000);
  const [reservePrice, setReservePrice] = useState<number | null>(null);

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Fetch quality bands for commodity items
  const qualityMode = getQualityMode(gameItemType)
  const { data: resourceData } = useSearchResourcesQuery(
    { text: gameItemName || undefined, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemName },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

  // RTK Query mutations
  const [createListing, { isLoading }] = useCreateListingMutation();
  const [uploadImage] = useUploadImageMutation();

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
    (id: string, field: keyof StockLotFormData, value: StockLotFormData[keyof StockLotFormData]) => {
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

      const validationError = validateForm();
      if (validationError) {
        issueAlert({
          message: validationError,
          severity: "error",
        });
        return;
      }

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
        shop_id: shop.shop_id,
        visibility: shop.owner_contractor_id ? visibility : undefined,
        sale_type: saleType,
        status: listingStatus,
        auction_details: saleType === "auction" ? {
          end_time: new Date(auctionEndTime).toISOString(),
          min_bid_increment: minBidIncrement,
          reserve_price: reservePrice ?? undefined,
        } : undefined,
        photo_resource_ids: photoResourceIds.length > 0 ? photoResourceIds : undefined,
      };

      try {
        const result = await createListing({ createListingRequest: request }).unwrap();

        issueAlert({
          message: t("CreateListingV2.success", "Listing created successfully"),
          severity: "success",
        });

        navigate(`/market/${result.listing_id}`);
      } catch (error) {
        const err = error as { data?: { message?: string } }
        issueAlert({
          message:
            err?.data?.message ||
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
      shop.shop_id,
      shop.owner_contractor_id,
      photoResourceIds,
      createListing,
      issueAlert,
      navigate,
      t,
    ]
  );

  // Two-phase upload: upload each file immediately and track status
  const handleFileUpload = useCallback((files: File[]) => {
    for (const file of files) {
      const tempId = `temp-${crypto.randomUUID()}`;
      const newEntry: UploadedImageStatus = {
        resource_id: tempId,
        url: "",
        status: "uploading",
        file,
      };

      setUploadedImages((prev) => [...prev, newEntry]);

      uploadImage(file)
        .unwrap()
        .then((result) => {
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.resource_id === tempId
                ? { ...img, resource_id: result.resource_id, url: result.url, status: "success" as const }
                : img
            )
          );
          setPhotoResourceIds((prev) => [...prev, result.resource_id]);
        })
        .catch((err: any) => {
          const errBody = err?.data?.error || err?.data || {};
          const detail = errBody?.message || errBody?.validationErrors?.[0]?.message || "Upload failed";
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.resource_id === tempId
                ? { ...img, status: "error" as const, error: detail }
                : img
            )
          );
        });
    }
  }, [uploadImage]);

  const handleRemoveUploadedImage = useCallback((resourceId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.resource_id !== resourceId));
    setPhotoResourceIds((prev) => prev.filter((id) => id !== resourceId));
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
      <Grid item xs={12}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* Verification Warning */}
          {profile && !isVerified && (
            <Grid item xs={12}>
              <Alert severity="warning">
                {t(
                  "market.verificationRequired",
                  "Your account must be verified to create market listings. Please verify your account with RSI/Citizen iD to continue.",
                )}
              </Alert>
            </Grid>
          )}

          {/* ============================================================ */}
          {/* ESSENTIAL FIELDS — always visible                            */}
          {/* ============================================================ */}

          {/* About Section */}
          <FormPaper title={t("CreateListingV2.about", "About")}>
            <Grid item xs={12}>
              <GameItemSearchAutocomplete
                autoFocus
                value={gameItemName}
                onChange={(itemName, itemType, itemId) => {
                  setGameItemName(itemName);
                  setGameItemId(itemId);
                  setGameItemType(itemType);
                  setQuantityUnit(itemType === "Commodity" ? "scu" : "unit");
                  if (!title && itemName) {
                    setTitle(itemName);
                  }
                }}
                label={t("CreateListingV2.selectGameItem", "Select Game Item")}
              />
            </Grid>

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

            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                {t("CreateListingV2.imageHint", "Add photos to your listing")}{" "}
                {t("CreateListingV2.imageSizeLimit", "(Max 2.5MB per image)")}
              </Typography>
              <SelectPhotosArea
                setPhotos={setPhotos}
                photos={photos}
                onFileUpload={handleFileUpload}
                onAlert={(severity, message) => issueAlert({ severity, message })}
                onImageUploaded={(resourceId, url) => {
                  // Already handled in handleFileUpload
                }}
                uploadedImages={uploadedImages}
                onRemoveUploadedImage={handleRemoveUploadedImage}
              />
            </Grid>
          </FormPaper>

          {/* Pricing & Quantity — simplified view */}
          <FormPaper title={t("CreateListingV2.pricing", "Pricing & Quantity")}>
            <Grid item xs={12} sm={6}>
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
                label={t("CreateListingV2.basePrice", "Price")}
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
                    "Enter price"
                  ),
                }}
              />
              {gameItemId && basePrice > 0 && (
                <PriceComparisonAlert gameItemId={gameItemId} currentPrice={basePrice} />
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                size="small"
                fullWidth
                onValueChange={(values) => {
                  handleUpdateStockLot(stockLots[0]?.id, "quantity", values.floatValue || 0);
                }}
                label={t("CreateListingV2.quantity", "Quantity")}
                value={stockLots[0]?.quantity ?? 1}
                color="secondary"
                required
                inputProps={{
                  inputMode: "numeric",
                  "aria-label": t("CreateListingV2.quantityAriaLabel", "Enter quantity"),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("CreateListingV2.pickupMethod", "Pickup Method")}
                value={pickupMethod}
                onChange={(e) => setPickupMethod(e.target.value as "delivery" | "pickup" | "any" | "")}
                helperText={t("CreateListingV2.pickupMethodHelper", "How will the buyer receive the item?")}
              >
                <MenuItem value="">{t("CreateListingV2.notSpecified", "Not specified")}</MenuItem>
                <MenuItem value="delivery">{t("CreateListingV2.delivery", "Delivery (seller delivers)")}</MenuItem>
                <MenuItem value="pickup">{t("CreateListingV2.pickup", "Pickup (buyer picks up)")}</MenuItem>
                <MenuItem value="any">{t("CreateListingV2.either", "Either (delivery or pickup)")}</MenuItem>
              </TextField>
            </Grid>
          </FormPaper>

          {/* ============================================================ */}
          {/* ADVANCED OPTIONS — collapsed by default                      */}
          {/* ============================================================ */}

          <Grid item xs={12}>
            <Button
              variant="text"
              color="secondary"
              onClick={() => setShowAdvanced((prev) => !prev)}
              endIcon={
                <ExpandMoreRounded
                  sx={{
                    transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              }
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              {showAdvanced
                ? t("CreateListingV2.hideAdvanced", "Hide advanced options")
                : t("CreateListingV2.showAdvanced", "Show advanced options")}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={showAdvanced}>
              <Grid container spacing={theme.layoutSpacing.layout}>

                {/* Listing Options */}
                <FormPaper title={t("CreateListingV2.listingOptions", "Listing Options")}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={t("CreateListingV2.listingStatus", "Listing Status")}
                      value={listingStatus}
                      onChange={(e) => setListingStatus(e.target.value as "active" | "inactive")}
                      helperText={listingStatus === "inactive"
                        ? t("CreateListingV2.inactiveHelp", "Listing will be saved as a draft and won't be visible to buyers")
                        : t("CreateListingV2.activeHelp", "Listing will be immediately visible to buyers")
                      }
                    >
                      <MenuItem value="active">{t("CreateListingV2.active", "Active")}</MenuItem>
                      <MenuItem value="inactive">{t("CreateListingV2.inactive", "Inactive (Draft)")}</MenuItem>
                    </TextField>
                  </Grid>
                  {shop.owner_contractor_id && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("market.visibility", "Visibility")}
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                        helperText={visibility === "private"
                          ? t("market.visibilityPrivateHelp", "Only visible to organization members")
                          : t("market.visibilityPublicHelp", "Visible to all buyers")
                        }
                      >
                        <MenuItem value="public">{t("market.visibilityPublic", "Public")}</MenuItem>
                        <MenuItem value="private">{t("market.visibilityPrivate", "Private (org members only)")}</MenuItem>
                      </TextField>
                    </Grid>
                  )}
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

                {/* Sale Type */}
                <FormPaper title={t("CreateListingV2.saleType", "Sale Type")}>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={saleType}
                        onChange={(e) => setSaleType(e.target.value as "fixed" | "auction" | "negotiable")}
                      >
                        <FormControlLabel value="fixed" control={<Radio color="secondary" />} label={t("CreateListingV2.fixed", "Fixed Price")} />
                        <FormControlLabel value="auction" control={<Radio color="secondary" />} label={t("CreateListingV2.auction", "Auction")} />
                        <FormControlLabel value="negotiable" control={<Radio color="secondary" />} label={t("CreateListingV2.negotiable", "Negotiable")} />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {saleType === "auction" && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t("CreateListingV2.auctionEndTime", "Auction End Time")}
                          type="datetime-local"
                          value={auctionEndTime}
                          onChange={(e) => setAuctionEndTime(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t("CreateListingV2.minBidIncrement", "Min Bid Increment (aUEC)")}
                          type="number"
                          value={minBidIncrement}
                          onChange={(e) => setMinBidIncrement(parseInt(e.target.value) || 0)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t("CreateListingV2.reservePrice", "Reserve Price (optional)")}
                          type="number"
                          value={reservePrice ?? ""}
                          onChange={(e) => setReservePrice(e.target.value ? parseInt(e.target.value) : null)}
                          helperText={t("CreateListingV2.reservePriceHelp", "Auction won't sell below this price")}
                        />
                      </Grid>
                    </>
                  )}
                </FormPaper>

                {/* Pricing Mode */}
                <FormPaper title={t("CreateListingV2.pricingMode", "Pricing Mode")}>
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
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
                </FormPaper>

                {/* Order Limits */}
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

                {/* Stock Lots Section */}
                <FormPaper
                  title={t("CreateListingV2.stockLots", "Stock Lots")}
                  subtitle={t(
                    "CreateListingV2.stockLotsSubtitle",
                    "Add inventory with variant attributes (quality, source, location)"
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

                          {/* Quality — conditional based on item type */}
                          {(() => {
                            const qm = getQualityMode(gameItemType)
                            if (qm === "none") return null
                            return qm === "value" ? (
                              <Grid item xs={12} sm={6} md={4}>
                                {qualityBands && qualityBands.length > 0 ? (
                                  <QualityBandSelect
                                    bands={qualityBands}
                                    value={lot.quality_value}
                                    onChange={(val) => handleUpdateStockLot(lot.id, "quality_value", val ?? undefined)}
                                    label={t("CreateListingV2.qualityValue", "Quality Value")}
                                  />
                                ) : (
                                  <NumericFormat
                                    decimalScale={0}
                                    allowNegative={false}
                                    customInput={TextField}
                                    size="small"
                                    fullWidth
                                    isAllowed={({ floatValue }) => !floatValue || floatValue <= 1000}
                                    onValueChange={(values) => {
                                      handleUpdateStockLot(lot.id, "quality_value", values.floatValue);
                                    }}
                                    label={t("CreateListingV2.qualityValue", "Quality Value")}
                                    value={lot.quality_value ?? ""}
                                    color="secondary"
                                    helperText={t("CreateListingV2.qualityValueHelp", "Optional: 0-1000")}
                                    inputProps={{
                                      inputMode: "decimal",
                                      "aria-label": t("CreateListingV2.qualityValueAriaLabel", "Enter quality value"),
                                    }}
                                  />
                                )}
                              </Grid>
                            ) : (
                              <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                  select fullWidth size="small"
                                  label={t("CreateListingV2.qualityTier", "Quality Tier")}
                                  value={lot.quality_tier ?? ""}
                                  onChange={(e) => handleUpdateStockLot(lot.id, "quality_tier", e.target.value ? Number(e.target.value) : undefined)}
                                  color="secondary"
                                  helperText={t("CreateListingV2.qualityTierHelp", "Optional: 1-5")}
                                >
                                  <MenuItem value="">{t("CreateListingV2.notSpecified", "Not specified")}</MenuItem>
                                  {[1, 2, 3, 4, 5].map((tier) => (
                                    <MenuItem key={tier} value={tier}>{t("CreateListingV2.tier", "Tier")} {tier}</MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                            )
                          })()}

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
                                handleUpdateStockLot(lot.id, "location_id", locationId ?? undefined)
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

              </Grid>
            </Collapse>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} container justifyContent="flex-end">
            <LoadingButton
              size="large"
              variant="contained"
              color="secondary"
              type="submit"
              loading={isLoading}
              disabled={isUploading}
              aria-label={t("CreateListingV2.submit", "Create Listing")}
            >
              {isUploading
                ? t("CreateListingV2.uploadingPhotos", "Uploading photos...")
                : t("CreateListingV2.submit", "Create Listing")}
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
      </Grid>
    </StandardPageLayout>
  );
}
