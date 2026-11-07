import type { TFunction } from "i18next"
import type {
  GetListingDetailResponse,
  LotUpdate,
  UpdateListingRequest,
  VariantPriceUpdate,
} from "../../../store/api/v2/market"
import type { ListingFormError } from "../domain/listingFormErrors"
import { lotUpdatesForQuantityChange } from "../domain/lotQuantityUpdates"
import type { VariantFormData } from "./EditListingVariants"

/** The edit form's values, as the request builder and validation read them. */
export interface ListingEditForm {
  title: string
  description: string
  pickupMethod: "delivery" | "pickup" | "any" | ""
  photos: string[]
  visibility: "public" | "private"
  bulkDiscountTiers: { min_quantity: number; discount_percent: number }[]
  pricingMode: "unified" | "per_variant"
  basePrice: number
  variants: VariantFormData[]
  photoResourceIds: string[]
}

/** The first problem with the form, or null. The description is optional. */
export function validateListingEdit(
  {
    title,
    pricingMode,
    basePrice,
    variants,
  }: Pick<ListingEditForm, "title" | "pricingMode" | "basePrice" | "variants">,
  t: TFunction,
): ListingFormError | null {
  if (!title.trim()) {
    return {
      field: "title",
      message: t("EditListingV2.validation.titleRequired", "Title is required"),
    }
  }
  if (title.length > 500) {
    return {
      field: "title",
      message: t(
        "EditListingV2.validation.titleTooLong",
        "Title must be 500 characters or less",
      ),
    }
  }
  if (pricingMode === "unified" && (!basePrice || basePrice <= 0)) {
    return {
      field: "base_price",
      message: t(
        "EditListingV2.validation.basePriceRequired",
        "Base price must be greater than 0",
      ),
    }
  }

  // Validate each variant
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i]
    if (v.quantity < 0) {
      return {
        field: "form",
        message: t(
          "EditListingV2.validation.quantityInvalid",
          "Quantity must be 0 or greater for variant {{index}}",
          { index: i + 1 },
        ),
      }
    }
    if (pricingMode === "per_variant" && (!v.price || v.price <= 0)) {
      return {
        field: "form",
        message: t(
          "EditListingV2.validation.variantPriceRequired",
          "Price must be greater than 0 for variant {{index}} in per-variant pricing mode",
          { index: i + 1 },
        ),
      }
    }
  }

  return null
}

/**
 * The update request: only the fields that changed from the loaded listing.
 * Null when a quantity change can't be applied to the variant's lots.
 */
export function buildListingUpdateRequest(
  listingData: GetListingDetailResponse | undefined,
  {
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
  }: ListingEditForm,
): UpdateListingRequest | null {
  const request: UpdateListingRequest = {}

  // Only include changed fields
  if (title !== listingData?.listing.title) {
    request.title = title.trim()
  }
  if (description !== (listingData?.listing.description || "")) {
    request.description = description.trim()
  }

  const currentPickup = listingData?.listing.pickup_method || ""
  if (pickupMethod !== currentPickup) {
    request.pickup_method = pickupMethod || null
  }

  // Sync photos: detect removals and newly-added external URLs separately.
  const originalPhotos = listingData?.listing.photos || []
  const originalSet = new Set(originalPhotos)
  const newExternalUrls = photos.filter((p) => !originalSet.has(p))
  // If any existing photo was removed, send the replace-set (minus the new
  // URLs, which don't exist in the DB yet — they'll be handled separately).
  const keptPhotos = photos.filter((p) => originalSet.has(p))
  if (JSON.stringify(keptPhotos) !== JSON.stringify(originalPhotos)) {
    request.photos = keptPhotos
  }
  // Send newly pasted external URLs for creation.
  if (newExternalUrls.length > 0) {
    request.external_photo_urls = newExternalUrls
  }

  // Include visibility if changed
  const currentVisibility =
    listingData?.listing.visibility === "private" ? "private" : "public"
  if (visibility !== currentVisibility) {
    request.visibility = visibility
  }

  // Include bulk discount tiers
  const currentTiers =
    (
      listingData?.items[0] as {
        bulk_discount_tiers?: {
          min_quantity: number
          discount_percent: number
        }[]
      }
    )?.bulk_discount_tiers || []
  if (JSON.stringify(bulkDiscountTiers) !== JSON.stringify(currentTiers)) {
    request.bulk_discount_tiers = bulkDiscountTiers
  }

  // Handle pricing updates
  if (pricingMode === "unified") {
    if (basePrice !== (listingData?.items[0]?.base_price || 0)) {
      request.base_price = basePrice
    }
  } else {
    // Per-variant pricing
    const variantPrices: VariantPriceUpdate[] = variants
      .filter((v) => v.isModified && v.price !== undefined)
      .map((v) => ({
        variant_id: v.variant_id,
        price: v.price!,
      }))

    if (variantPrices.length > 0) {
      request.variant_prices = variantPrices
    }
  }

  // Quantity changes go to the variant's lots as lot_updates. Only the
  // change is sent: writing the variant's total into its first lot
  // multiplied the stock when the variant was spread over several lots.
  const lotUpdates: LotUpdate[] = []
  for (const v of variants) {
    if (!v.isModified) continue
    const updates = lotUpdatesForQuantityChange(
      v.lots,
      v.quantity - v.originalQuantity,
    )
    if (!updates) return null
    lotUpdates.push(...updates)
  }

  if (lotUpdates.length > 0) {
    request.lot_updates = lotUpdates
  }

  // Include newly uploaded photo resource IDs
  if (photoResourceIds.length > 0) {
    request.photo_resource_ids = photoResourceIds
  }

  return request
}
