import React, { useState, useCallback } from "react"
import { Grid, Typography, Collapse } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate, useSearchParams } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { FormPaper } from "../../../components/paper/FormPaper"
import { formatMarketUrl } from "../domain/urls"
import { getQualityMode } from "../../../util/qualityMode"
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor"
import { useSearchResourcesQuery } from "../../../store/api/v2/market"
import { useCreateListingSubmit } from "../hooks/useListingMutations"
import { useListingPhotoUploads } from "../hooks/useListingPhotoUploads"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { Alert } from "@mui/material"
import { HelpLink } from "../../help/components/HelpLink"
import { withShopContext } from "../../../components/sidebar/shopContextState"
import { ShopManageAccessNotice } from "../../shops/components/ShopManageAccessNotice"
import { canEditShopListings } from "../../shops/domain/shopPermissions"
import {
  focusListingField,
  type ListingFormError,
  type ListingFormField,
} from "../domain/listingFormErrors"
import {
  buildCreateListingRequest,
  listingDraftIssueError,
  validateListingDraft,
  type ListingDraft,
} from "../domain/listingDraft"
import {
  StockLotsSection,
  type StockLotFormData,
} from "./CreateListingStockLots"
import { PickupMethodSection } from "./CreateListingOptions"
import { ListingOptionsSection } from "./CreateListingOptions"
import { SaleTypeSection } from "./CreateListingSaleOptions"
import { PricingModeSection } from "./CreateListingSaleOptions"
import { OrderLimitsSection } from "./CreateListingOptions"
import { AboutSection } from "./CreateListingEssentials"
import { PricingQuantitySection } from "./CreateListingEssentials"
import { MoreOptionsToggle } from "./CreateListingOptions"

export function CreateListingV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const issueAlert = useAlertHook()
  const { data: profile } = useGetUserProfileQuery()
  const { shop } = useShopRouteContext()
  const isVerified = profile?.rsi_confirmed

  // Form state — prefilled from ?game_item_id=&game_item_name=&game_item_type= query params
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [gameItemId, setGameItemId] = useState<string | null>(
    searchParams.get("game_item_id"),
  )
  const [gameItemName, setGameItemName] = useState<string | null>(
    searchParams.get("game_item_name"),
  )
  const [gameItemType, setGameItemType] = useState<string | null>(
    searchParams.get("game_item_type"),
  )
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">(
    "unified",
  )
  const [basePrice, setBasePrice] = useState<number>(0)
  const {
    photos,
    setPhotos,
    photoResourceIds,
    uploadedImages,
    isUploading,
    handleFileUpload,
    handleRemoveUploadedImage,
  } = useListingPhotoUploads()
  const [pickupMethod, setPickupMethod] = useState<
    "delivery" | "pickup" | "any" | ""
  >("")
  const [quantityUnit, setQuantityUnit] = useState<"unit" | "scu">("unit")
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | null>(null)
  const [maxOrderQuantity, setMaxOrderQuantity] = useState<number | null>(null)
  const [minOrderValue, setMinOrderValue] = useState<number | null>(null)
  const [maxOrderValue, setMaxOrderValue] = useState<number | null>(null)
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<
    Array<{ min_quantity: number; discount_percent: number }>
  >([])
  const [saleType, setSaleType] = useState<"fixed" | "auction" | "negotiable">(
    "fixed",
  )
  const [listingStatus, setListingStatus] = useState<"active" | "inactive">(
    "active",
  )
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [auctionEndTime, setAuctionEndTime] = useState<string>("")
  const [minBidIncrement, setMinBidIncrement] = useState<number>(1000)
  const [reservePrice, setReservePrice] = useState<number | null>(null)

  // Advanced section toggle
  const [showAdvanced, setShowAdvanced] = useState(false)

  // The error being shown: next to its field, and above the submit button
  const [formError, setFormError] = useState<ListingFormError | null>(null)
  const fieldError = (field: ListingFormField) =>
    formError?.field === field ? formError.message : undefined
  const clearError = (field: ListingFormField) =>
    setFormError((prev) => (prev?.field === field ? null : prev))
  const showError = (error: ListingFormError) => {
    setFormError(error)
    // The auction end time lives under "More options"
    if (error.field === "auction_end_time") setShowAdvanced(true)
    focusListingField(error.field)
  }

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
  ])

  // Fetch quality bands for commodity items
  const qualityMode = getQualityMode(gameItemType)
  const { data: resourceData } = useSearchResourcesQuery(
    { text: gameItemName || undefined, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemName },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

  // RTK Query mutations
  const { submit: submitListing, isLoading } = useCreateListingSubmit()

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
    ])
  }, [])

  // Remove stock lot
  const handleRemoveStockLot = useCallback((id: string) => {
    setStockLots((prev) => prev.filter((lot) => lot.id !== id))
  }, [])

  // Update stock lot field
  const handleUpdateStockLot = useCallback(
    (
      id: string,
      field: keyof StockLotFormData,
      value: StockLotFormData[keyof StockLotFormData],
    ) => {
      setStockLots((prev) =>
        prev.map((lot) => (lot.id === id ? { ...lot, [field]: value } : lot)),
      )
    },
    [],
  )

  // The form as a draft: the rules and the request are shared with Quick List
  const draft: ListingDraft = {
    gameItemId,
    title,
    description,
    pricingMode,
    basePrice,
    lots: stockLots.map((lot) => ({
      quantity: lot.quantity,
      quality_tier: lot.quality_tier,
      quality_value: lot.quality_value,
      crafted_source: lot.crafted_source,
      location_id: lot.location_id,
      price: lot.price,
    })),
    saleType,
    auctionEndTime,
    minBidIncrement,
    reservePrice,
    pickupMethod,
    quantityUnit,
    minOrderQuantity,
    maxOrderQuantity,
    minOrderValue,
    maxOrderValue,
    bulkDiscountTiers,
    status: listingStatus,
    visibility,
    photoResourceIds,
    externalPhotoUrls: photos,
  }

  // Submit form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const issue = validateListingDraft(draft)
    if (issue || !draft.gameItemId) {
      const validationError = listingDraftIssueError(
        issue ?? { code: "gameItemRequired" },
        t,
      )
      showError(validationError)
      issueAlert({
        message: validationError.message,
        severity: "error",
      })
      return
    }
    setFormError(null)

    const request = buildCreateListingRequest(
      { ...draft, gameItemId: draft.gameItemId },
      shop,
    )

    const result = await submitListing(request)
    if (!result.ok) {
      showError(result.error)
      return
    }
    navigate(formatMarketUrl({ listing_id: result.listingId, title }), {
      state: withShopContext(shop.slug),
    })
  }

  // Org members without manage_market can't create listings: say so up
  // front instead of letting the save fail with a 403
  if (!canEditShopListings(shop)) {
    return (
      <StandardPageLayout
        title={t("CreateListingV2.pageTitle", "Create Listing")}
        sidebarOpen={true}
        maxWidth="lg"
      >
        <Grid item xs={12}>
          <ShopManageAccessNotice />
        </Grid>
      </StandardPageLayout>
    )
  }

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
      headerActions={<HelpLink guide="sellItems" />}
    >
      <Grid item xs={12}>
        <form onSubmit={handleSubmit} noValidate>
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

            <AboutSection
              gameItemName={gameItemName}
              setGameItemName={setGameItemName}
              setGameItemId={setGameItemId}
              setGameItemType={setGameItemType}
              setQuantityUnit={setQuantityUnit}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              photos={photos}
              setPhotos={setPhotos}
              handleFileUpload={handleFileUpload}
              uploadedImages={uploadedImages}
              handleRemoveUploadedImage={handleRemoveUploadedImage}
              fieldError={fieldError}
              clearError={clearError}
            />

            <PricingQuantitySection
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              gameItemId={gameItemId}
              stockLots={stockLots}
              handleUpdateStockLot={handleUpdateStockLot}
              fieldError={fieldError}
              clearError={clearError}
            />

            {/* ============================================================ */}
            {/* ADVANCED OPTIONS — collapsed by default                      */}
            {/* ============================================================ */}

            <MoreOptionsToggle
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
            />

            <Grid item xs={12}>
              <Collapse in={showAdvanced}>
                <Grid container spacing={theme.layoutSpacing.layout}>
                  <PickupMethodSection
                    pickupMethod={pickupMethod}
                    setPickupMethod={setPickupMethod}
                  />

                  <ListingOptionsSection
                    listingStatus={listingStatus}
                    setListingStatus={setListingStatus}
                    visibility={visibility}
                    setVisibility={setVisibility}
                    quantityUnit={quantityUnit}
                    setQuantityUnit={setQuantityUnit}
                    gameItemId={gameItemId}
                    isOrgOwned={shop.is_org_owned}
                  />

                  <SaleTypeSection
                    saleType={saleType}
                    setSaleType={setSaleType}
                    auctionEndTime={auctionEndTime}
                    setAuctionEndTime={setAuctionEndTime}
                    minBidIncrement={minBidIncrement}
                    setMinBidIncrement={setMinBidIncrement}
                    reservePrice={reservePrice}
                    setReservePrice={setReservePrice}
                    fieldError={fieldError}
                    clearError={clearError}
                  />

                  <PricingModeSection
                    pricingMode={pricingMode}
                    setPricingMode={setPricingMode}
                  />

                  <OrderLimitsSection
                    minOrderQuantity={minOrderQuantity}
                    setMinOrderQuantity={setMinOrderQuantity}
                    maxOrderQuantity={maxOrderQuantity}
                    setMaxOrderQuantity={setMaxOrderQuantity}
                    minOrderValue={minOrderValue}
                    setMinOrderValue={setMinOrderValue}
                    maxOrderValue={maxOrderValue}
                    setMaxOrderValue={setMaxOrderValue}
                  />

                  {/* Bulk Discount Tiers */}
                  <FormPaper
                    title={t("market.bulkDiscountTiers", "Bulk Discounts")}
                  >
                    <Grid item xs={12}>
                      <BulkDiscountTierEditor
                        tiers={bulkDiscountTiers}
                        onChange={setBulkDiscountTiers}
                      />
                    </Grid>
                  </FormPaper>

                  <StockLotsSection
                    stockLots={stockLots}
                    gameItemType={gameItemType}
                    qualityBands={qualityBands}
                    pricingMode={pricingMode}
                    handleAddStockLot={handleAddStockLot}
                    handleRemoveStockLot={handleRemoveStockLot}
                    handleUpdateStockLot={handleUpdateStockLot}
                  />
                </Grid>
              </Collapse>
            </Grid>

            {formError && (
              <Grid item xs={12}>
                <Alert severity="error" role="alert">
                  {formError.message}
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12} container justifyContent="flex-end">
              <LoadingButton
                size="large"
                variant="contained"
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
  )
}
