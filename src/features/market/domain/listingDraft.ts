/**
 * The rules for creating a listing, shared by the full Create Listing form
 * and Quick List: what a draft must contain before it is sent, and the
 * POST /api/v2/listings request it becomes. Pure: no React, no store.
 */
import type { TFunction } from "i18next"
import type {
  CreateListingRequest,
  ShopResponse,
  StockLotInput,
  VariantAttributes,
} from "../../../store/api/v2/market"
import type { ListingFormError, ListingFormField } from "./listingFormErrors"

export type CraftedSource = NonNullable<VariantAttributes["crafted_source"]>

/** One stock lot of a draft. */
export interface ListingLotDraft {
  quantity: number
  quality_tier?: number
  quality_value?: number
  crafted_source?: CraftedSource
  location_id?: string
  /** The lot's own price (per-variant pricing only) */
  price?: number
}

export interface ListingDraft {
  gameItemId: string | null
  title: string
  description: string
  pricingMode: "unified" | "per_variant"
  basePrice: number
  lots: ListingLotDraft[]
  saleType: "fixed" | "auction" | "negotiable"
  /** datetime-local value; required for auctions */
  auctionEndTime: string
  minBidIncrement: number
  reservePrice: number | null
  pickupMethod: "delivery" | "pickup" | "any" | ""
  quantityUnit: "unit" | "scu"
  minOrderQuantity: number | null
  maxOrderQuantity: number | null
  minOrderValue: number | null
  maxOrderValue: number | null
  bulkDiscountTiers: Array<{ min_quantity: number; discount_percent: number }>
  status: "active" | "inactive"
  /** Only sent for org shops */
  visibility: "public" | "private"
  photoResourceIds: string[]
  externalPhotoUrls: string[]
}

/** A draft with every optional part left at its default. */
export function emptyListingDraft(): ListingDraft {
  return {
    gameItemId: null,
    title: "",
    description: "",
    pricingMode: "unified",
    basePrice: 0,
    lots: [{ quantity: 1 }],
    saleType: "fixed",
    auctionEndTime: "",
    minBidIncrement: 1000,
    reservePrice: null,
    pickupMethod: "",
    quantityUnit: "unit",
    minOrderQuantity: null,
    maxOrderQuantity: null,
    minOrderValue: null,
    maxOrderValue: null,
    bulkDiscountTiers: [],
    status: "active",
    visibility: "public",
    photoResourceIds: [],
    externalPhotoUrls: [],
  }
}

/** Items sold by volume (commodities) are counted in SCU, the rest in units. */
export function quantityUnitFor(itemType: string | null | undefined): "unit" | "scu" {
  return itemType === "Commodity" ? "scu" : "unit"
}

export const LISTING_TITLE_MAX = 500

/** Why a draft can't be sent yet. `index` is the lot's (0-based) position. */
export type ListingDraftIssue =
  | { code: "gameItemRequired" }
  | { code: "titleRequired" }
  | { code: "titleTooLong" }
  | { code: "basePriceRequired" }
  | { code: "stockLotRequired" }
  | { code: "quantityRequired"; index: number }
  | { code: "qualityTierRange"; index: number }
  | { code: "qualityValueRange"; index: number }
  | { code: "variantPriceRequired"; index: number }
  | { code: "auctionEndTimeRequired" }

/** The first problem with a draft, or null when it can be sent. */
export function validateListingDraft(draft: ListingDraft): ListingDraftIssue | null {
  if (!draft.gameItemId) return { code: "gameItemRequired" }
  if (!draft.title.trim()) return { code: "titleRequired" }
  if (draft.title.length > LISTING_TITLE_MAX) return { code: "titleTooLong" }
  if (draft.pricingMode === "unified" && !(draft.basePrice > 0)) {
    return { code: "basePriceRequired" }
  }
  if (draft.lots.length === 0) return { code: "stockLotRequired" }
  for (let index = 0; index < draft.lots.length; index++) {
    const lot = draft.lots[index]
    if (!(lot.quantity > 0)) return { code: "quantityRequired", index }
    if (lot.quality_tier !== undefined && (lot.quality_tier < 1 || lot.quality_tier > 5)) {
      return { code: "qualityTierRange", index }
    }
    if (lot.quality_value !== undefined && (lot.quality_value < 0 || lot.quality_value > 1000)) {
      return { code: "qualityValueRange", index }
    }
    if (draft.pricingMode === "per_variant" && !(lot.price && lot.price > 0)) {
      return { code: "variantPriceRequired", index }
    }
  }
  if (draft.saleType === "auction" && !draft.auctionEndTime) {
    return { code: "auctionEndTimeRequired" }
  }
  return null
}

/** The form field an issue is about. The first lot's quantity is the Quantity field. */
export function listingDraftIssueField(issue: ListingDraftIssue): ListingFormField {
  switch (issue.code) {
    case "gameItemRequired":
      return "game_item_id"
    case "titleRequired":
    case "titleTooLong":
      return "title"
    case "basePriceRequired":
      return "base_price"
    case "quantityRequired":
      return issue.index === 0 ? "quantity" : "form"
    case "auctionEndTimeRequired":
      return "auction_end_time"
    default:
      return "form"
  }
}

/** The message for an issue, pointed at its field. */
export function listingDraftIssueError(issue: ListingDraftIssue, t: TFunction): ListingFormError {
  const field = listingDraftIssueField(issue)
  const index = "index" in issue ? issue.index + 1 : undefined
  switch (issue.code) {
    case "gameItemRequired":
      return { field, message: t("CreateListingV2.validation.gameItemRequired", "Game item is required") }
    case "titleRequired":
      return { field, message: t("CreateListingV2.validation.titleRequired", "Title is required") }
    case "titleTooLong":
      return {
        field,
        message: t("CreateListingV2.validation.titleTooLong", "Title must be 500 characters or less"),
      }
    case "basePriceRequired":
      return {
        field,
        message: t("CreateListingV2.validation.basePriceRequired", "Base price must be greater than 0"),
      }
    case "stockLotRequired":
      return {
        field,
        message: t("CreateListingV2.validation.stockLotRequired", "At least one stock lot is required"),
      }
    case "quantityRequired":
      return {
        field,
        message: t("CreateListingV2.validation.quantityRequired", "Quantity must be greater than 0 for lot {{index}}", {
          index,
        }),
      }
    case "qualityTierRange":
      return {
        field,
        message: t(
          "CreateListingV2.validation.qualityTierRange",
          "Quality tier must be between 1 and 5 for lot {{index}}",
          { index },
        ),
      }
    case "qualityValueRange":
      return {
        field,
        message: t(
          "CreateListingV2.validation.qualityValueRange",
          "Quality value must be between 0 and 1000 for lot {{index}}",
          { index },
        ),
      }
    case "variantPriceRequired":
      return {
        field,
        message: t(
          "CreateListingV2.validation.variantPriceRequired",
          "Price must be greater than 0 for lot {{index}} in per-variant pricing mode",
          { index },
        ),
      }
    case "auctionEndTimeRequired":
      return {
        field,
        message: t("CreateListingV2.validation.auctionEndTimeRequired", "Auction end time is required"),
      }
  }
}

function lotInput(lot: ListingLotDraft, pricingMode: ListingDraft["pricingMode"]): StockLotInput {
  const variant_attributes: VariantAttributes = {}
  if (lot.quality_tier !== undefined) variant_attributes.quality_tier = lot.quality_tier
  if (lot.quality_value !== undefined) variant_attributes.quality_value = lot.quality_value
  if (lot.crafted_source !== undefined) variant_attributes.crafted_source = lot.crafted_source
  return {
    quantity: lot.quantity,
    variant_attributes,
    location_id: lot.location_id,
    price: pricingMode === "per_variant" ? lot.price : undefined,
  }
}

/**
 * The create request for a valid draft (check it with validateListingDraft
 * first) in `shop`. Visibility is only sent for org shops, the only ones
 * that can have members-only listings.
 */
export function buildCreateListingRequest(
  draft: ListingDraft & { gameItemId: string },
  shop: Pick<ShopResponse, "shop_id" | "is_org_owned">,
): CreateListingRequest {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() || undefined,
    game_item_id: draft.gameItemId,
    pricing_mode: draft.pricingMode,
    base_price: draft.pricingMode === "unified" ? draft.basePrice : undefined,
    lots: draft.lots.map((lot) => lotInput(lot, draft.pricingMode)),
    pickup_method: draft.pickupMethod || undefined,
    quantity_unit: draft.quantityUnit,
    min_order_quantity: draft.minOrderQuantity ?? undefined,
    max_order_quantity: draft.maxOrderQuantity ?? undefined,
    min_order_value: draft.minOrderValue ?? undefined,
    max_order_value: draft.maxOrderValue ?? undefined,
    bulk_discount_tiers: draft.bulkDiscountTiers.length ? draft.bulkDiscountTiers : undefined,
    shop_id: shop.shop_id,
    visibility: shop.is_org_owned ? draft.visibility : undefined,
    sale_type: draft.saleType,
    status: draft.status,
    auction_details:
      draft.saleType === "auction"
        ? {
            end_time: new Date(draft.auctionEndTime).toISOString(),
            min_bid_increment: draft.minBidIncrement,
            reserve_price: draft.reservePrice ?? undefined,
          }
        : undefined,
    photo_resource_ids: draft.photoResourceIds.length > 0 ? draft.photoResourceIds : undefined,
    external_photo_urls: draft.externalPhotoUrls.length > 0 ? draft.externalPhotoUrls : undefined,
  }
}
