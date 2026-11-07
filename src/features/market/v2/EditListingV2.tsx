import React, { useState, useCallback, useMemo, useEffect } from "react"
import { Grid, Typography, Button, Box, Alert } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate, useParams } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  CheckCircleRounded,
  PauseCircleRounded,
  ArchiveRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { FormPaper } from "../../../components/paper/FormPaper"
import { BulkDiscountTierEditor } from "../../../components/market/BulkDiscountTierEditor"
import {
  useGetListingDetailQuery,
  useGetMyShopsQuery,
  useGetStockLotsQuery,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { withShopContext } from "../../../components/sidebar/shopContextState"
import {
  focusListingField,
  type ListingFormError,
  type ListingFormField,
} from "../domain/listingFormErrors"
import { usePhotoUploads } from "../hooks/usePhotoUploads"
import {
  useListingStatusActions,
  useUpdateListingSubmit,
} from "../hooks/useListingMutations"
import {
  EditPricingSection,
  VariantBreakdownSection,
  variantFormDataFor,
  type VariantFormData,
} from "./EditListingVariants"
import { EditVisibilitySection } from "./EditListingSections"
import { EditPickupMethodSection } from "./EditListingSections"
import { EditPhotosSection } from "./EditListingSections"
import { EditAboutSection } from "./EditListingSections"
import { EditListingSkeleton } from "./EditListingSections"
import {
  buildListingUpdateRequest,
  validateListingEdit,
} from "./editListingRequest"

/**
 * EditListingV2 - Form component for editing V2 listings
 *
 * Features:
 * - Reuses CreateListingV2 form structure
 * - Pre-populates form with existing listing data
 * - Allows updating title, description, prices, quantities
 * - Shows variant breakdown with inline editing
 * - Saves through useUpdateListingSubmit
 * - Prevents editing sold or cancelled listings
 * - Shows success message after update
 *
 * Requirements: 17.1-17.12
 */
export function EditListingV2() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()

  // Fetch existing listing data
  const {
    data: listingData,
    isLoading: isLoadingListing,
    error: loadError,
  } = useGetListingDetailQuery({ id: id! })

  // Scoped to the listing's shop: without it the lookup only covers your own
  // shops, so an org shop's lots were never found and quantity edits dropped.
  const shopId = listingData?.listing.shop_id
  const { data: stockLotsData } = useGetStockLotsQuery(
    { listingId: id!, listed: true, pageSize: 100, shopId },
    { skip: !shopId },
  )

  // The listing's shop, if you manage it: saving and archiving stay in its context
  const { data: myShops } = useGetMyShopsQuery()
  const shopSlug = myShops?.find((s) => s.shop_id === shopId)?.slug
  const navState = shopSlug ? { state: withShopContext(shopSlug) } : undefined

  // The error being shown: next to its field, and above the submit button
  const [formError, setFormError] = useState<ListingFormError | null>(null)
  const fieldError = (field: ListingFormField) =>
    formError?.field === field ? formError.message : undefined
  const clearError = (field: ListingFormField) =>
    setFormError((prev) => (prev?.field === field ? null : prev))
  const showError = (error: ListingFormError) => {
    setFormError(error)
    focusListingField(error.field)
  }

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pricingMode, setPricingMode] = useState<"unified" | "per_variant">(
    "unified",
  )
  const [basePrice, setBasePrice] = useState<number>(0)
  const [pickupMethod, setPickupMethod] = useState<
    "delivery" | "pickup" | "any" | ""
  >("")
  const [bulkDiscountTiers, setBulkDiscountTiers] = useState<
    Array<{ min_quantity: number; discount_percent: number }>
  >([])

  // Variant state — mirrors what listing detail shows
  const [variants, setVariants] = useState<VariantFormData[]>([])

  // RTK Query mutations
  const { submit: submitListing, isLoading: isUpdating } =
    useUpdateListingSubmit()
  const statusActions = useListingStatusActions()

  // Visibility state
  const [visibility, setVisibility] = useState<"public" | "private">("public")

  // Photo state
  const [photos, setPhotos] = useState<string[]>([])
  const {
    uploadedImages,
    photoResourceIds,
    isUploading,
    upload: handleFileUpload,
    remove: handleRemoveUploadedImage,
  } = usePhotoUploads(t("SelectPhotosArea.uploadFailed", "Upload failed"))

  // Check if listing can be edited
  const canEdit = useMemo(() => {
    if (!listingData) return false
    const status = listingData.listing.status
    return status !== "sold" && status !== "cancelled"
  }, [listingData])

  // Pre-populate form when listing data loads
  useEffect(() => {
    if (!listingData) return

    setTitle(listingData.listing.title)
    setDescription(listingData.listing.description || "")
    setPickupMethod(listingData.listing.pickup_method || "")
    setPhotos(listingData.listing.photos || [])
    setVisibility(
      listingData.listing.visibility === "private" ? "private" : "public",
    )

    // Get first item (assuming single item listings for now)
    const firstItem = listingData.items[0]
    if (firstItem) {
      setPricingMode(firstItem.pricing_mode)
      setBasePrice(firstItem.base_price || 0)
      setBulkDiscountTiers(
        (
          firstItem as {
            bulk_discount_tiers?: {
              min_quantity: number
              discount_percent: number
            }[]
          }
        ).bulk_discount_tiers || [],
      )

      setVariants(variantFormDataFor(firstItem, stockLotsData?.lots))
    }
  }, [listingData, stockLotsData])

  // Update variant field
  const handleUpdateVariant = useCallback(
    (
      variant_id: string,
      field: keyof VariantFormData,
      value: VariantFormData[keyof VariantFormData],
    ) => {
      setVariants((prev) =>
        prev.map((v) =>
          v.variant_id === variant_id
            ? { ...v, [field]: value, isModified: true }
            : v,
        ),
      )
    },
    [],
  )

  // Submit form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!canEdit) {
      issueAlert({
        message: t(
          "EditListingV2.cannotEdit",
          "Cannot edit sold or cancelled listings",
        ),
        severity: "error",
      })
      return
    }

    // Validate form
    const validationError = validateListingEdit(
      { title, pricingMode, basePrice, variants },
      t,
    )
    if (validationError) {
      showError(validationError)
      issueAlert({
        message: validationError.message,
        severity: "error",
      })
      return
    }
    setFormError(null)

    // Build update request (null: a quantity change must go per lot)
    const request = buildListingUpdateRequest(listingData, {
      title,
      description,
      pickupMethod,
      photos,
      visibility,
      bulkDiscountTiers,
      pricingMode,
      basePrice,
      variants,
      photoResourceIds,
    })
    if (!request) {
      issueAlert({
        message: t(
          "ItemStock.quantityUseStockPage",
          "Change this listing's quantity per lot on the Stock page",
        ),
        severity: "error",
      })
      return
    }

    // Check if there are any changes (an emptied description is one)
    if (Object.keys(request).length === 0) {
      issueAlert({
        message: t("EditListingV2.noChanges", "No changes to save"),
        severity: "info",
      })
      return
    }

    const result = await submitListing(id!, request)
    if (!result.ok) {
      showError(result.error)
      return
    }
    // Navigate back to listing detail page
    // The slug URL: /market/<id> is redirected to it, which drops the
    // router state that keeps the shop context
    navigate(MARKET_PATHS.listing(id!, title.trim()), navState)
  }

  // Show loading state
  if (isLoadingListing) {
    return (
      <StandardPageLayout
        title={t("EditListingV2.pageTitle", "Edit Listing")}
        isLoading={true}
        sidebarOpen={true}
        maxWidth="lg"
        skeleton={<EditListingSkeleton />}
      >
        <Box />
      </StandardPageLayout>
    )
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
    )
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
            { status: listingData.listing.status },
          )}
        </Alert>
      )}

      <Grid item xs={12}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* Status Actions */}
            {listingData.listing.status !== "sold" &&
              listingData.listing.status !== "cancelled" && (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {listingData.listing.status !== "active" ? (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleRounded />}
                        onClick={() => void statusActions.activate(id!)}
                      >
                        {t("marketV2.activate")}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<PauseCircleRounded />}
                        onClick={() => void statusActions.deactivate(id!)}
                      >
                        {t("marketV2.deactivate")}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<ArchiveRounded />}
                      onClick={async () => {
                        if (await statusActions.archive(id!)) {
                          navigate(
                            shopSlug
                              ? SHOP_PATHS.listings(shopSlug)
                              : MARKET_PATHS.manage,
                          )
                        }
                      }}
                    >
                      {t("marketV2.archive")}
                    </Button>
                  </Box>
                </Grid>
              )}

            <EditAboutSection
              listingData={listingData}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              canEdit={canEdit}
              fieldError={fieldError}
              clearError={clearError}
            />

            <EditPhotosSection
              photos={photos}
              setPhotos={setPhotos}
              handleFileUpload={handleFileUpload}
              uploadedImages={uploadedImages}
              handleRemoveUploadedImage={handleRemoveUploadedImage}
            />

            <EditPickupMethodSection
              pickupMethod={pickupMethod}
              setPickupMethod={setPickupMethod}
              canEdit={canEdit}
            />

            <EditVisibilitySection
              visibility={visibility}
              setVisibility={setVisibility}
              canEdit={canEdit}
            />

            {/* Bulk Discount Tiers */}
            <FormPaper title={t("market.bulkDiscountTiers", "Bulk Discounts")}>
              <Grid item xs={12}>
                <BulkDiscountTierEditor
                  tiers={bulkDiscountTiers}
                  onChange={setBulkDiscountTiers}
                />
              </Grid>
            </FormPaper>

            <EditPricingSection
              listingData={listingData}
              pricingMode={pricingMode}
              basePrice={basePrice}
              setBasePrice={setBasePrice}
              canEdit={canEdit}
              fieldError={fieldError}
              clearError={clearError}
            />

            <VariantBreakdownSection
              variants={variants}
              pricingMode={pricingMode}
              canEdit={canEdit}
              handleUpdateVariant={handleUpdateVariant}
            />

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
                color="neutral"
                onClick={() =>
                  navigate(
                    MARKET_PATHS.listing(id!, listingData?.listing.title),
                    navState,
                  )
                }
              >
                {t("EditListingV2.cancel", "Cancel")}
              </Button>

              <LoadingButton
                size="large"
                variant="contained"
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
  )
}
