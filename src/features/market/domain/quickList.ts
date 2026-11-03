/**
 * Quick List: list an item in a few seconds (item, price, quantity,
 * Publish). The rules behind the dialog; the listing itself is made by the
 * shared listing rules (listingDraft.ts). Pure: no React, no store.
 */
import type { PriceOracleItem, ShopResponse } from "../../../store/api/v2/market"
import { canEditShopListings } from "../../shops/domain/shopPermissions"
import {
  emptyListingDraft,
  quantityUnitFor,
  type ListingDraft,
  type ListingLotDraft,
} from "./listingDraft"

/** The game item being listed. */
export interface QuickListItem {
  id: string
  name: string
  type: string | null
}

/** One row of granular stock ("By location / quality"). */
export interface QuickListBatch {
  key: string
  quantity: number
  location_id?: string
  quality_tier?: number
  quality_value?: number
  /** Only used when each batch has its own price */
  price?: number
}

export type QuickListStockMode = "simple" | "batches"

export interface QuickListForm {
  item: QuickListItem | null
  price: number
  quantity: number
  /** Quality of the simple stock: a tier 1-5, or undefined for Any */
  qualityTier?: number
  stockMode: QuickListStockMode
  batches: QuickListBatch[]
  /** Batches have their own prices (per-variant pricing) */
  pricePerBatch: boolean
  description: string
  saleType: ListingDraft["saleType"]
  auctionEndTime: string
  pickupMethod: ListingDraft["pickupMethod"]
  minOrderQuantity: number | null
  maxOrderQuantity: number | null
  bulkDiscountTiers: ListingDraft["bulkDiscountTiers"]
  visibility: ListingDraft["visibility"]
}

export function emptyQuickListForm(item: QuickListItem | null = null): QuickListForm {
  return {
    item,
    price: 0,
    quantity: 1,
    qualityTier: undefined,
    stockMode: "simple",
    batches: [],
    pricePerBatch: false,
    description: "",
    saleType: "fixed",
    auctionEndTime: "",
    pickupMethod: "",
    minOrderQuantity: null,
    maxOrderQuantity: null,
    bulkDiscountTiers: [],
    visibility: "public",
  }
}

/**
 * The form after "Publish & list another": the item, price and quantity
 * start over; the stock mode and the advanced choices stay. Batches keep
 * their locations and qualities but lose their quantities and prices.
 */
export function nextQuickListForm(previous: QuickListForm): QuickListForm {
  return {
    ...previous,
    item: null,
    price: 0,
    quantity: 1,
    qualityTier: undefined,
    batches: previous.batches.map((b) => ({ ...b, quantity: 1, price: undefined })),
    description: "",
  }
}

/** Units in stock: the simple quantity, or the batches' total. */
export function quickListTotal(form: Pick<QuickListForm, "stockMode" | "quantity" | "batches">): number {
  if (form.stockMode === "simple") return form.quantity
  return form.batches.reduce((sum, b) => sum + (b.quantity > 0 ? b.quantity : 0), 0)
}

/** The listing draft the form describes, titled after the item. */
export function quickListDraft(form: QuickListForm): ListingDraft {
  const perBatch = form.stockMode === "batches" && form.pricePerBatch
  const lots: ListingLotDraft[] =
    form.stockMode === "simple"
      ? [{ quantity: form.quantity, quality_tier: form.qualityTier }]
      : form.batches.map((b) => ({
          quantity: b.quantity,
          location_id: b.location_id,
          quality_tier: b.quality_tier,
          quality_value: b.quality_value,
          price: perBatch ? b.price : undefined,
        }))
  return {
    ...emptyListingDraft(),
    gameItemId: form.item?.id ?? null,
    title: form.item?.name ?? "",
    description: form.description,
    pricingMode: perBatch ? "per_variant" : "unified",
    basePrice: perBatch ? 0 : form.price,
    lots,
    saleType: form.saleType,
    auctionEndTime: form.auctionEndTime,
    pickupMethod: form.pickupMethod,
    quantityUnit: quantityUnitFor(form.item?.type),
    minOrderQuantity: form.minOrderQuantity,
    maxOrderQuantity: form.maxOrderQuantity,
    bulkDiscountTiers: form.bulkDiscountTiers,
    visibility: form.visibility,
  }
}

/** What the market says about an item's price, for the hint under Price. */
export interface MarketPriceHint {
  low: number | null
  median: number | null
  listings: number
}

export function marketPriceHint(stats: PriceOracleItem | null | undefined): MarketPriceHint | null {
  if (!stats) return null
  const { current, trend_30d } = stats
  const median = current.median_ask ?? trend_30d.median_30d
  if (current.lowest_ask == null && median == null) return null
  return { low: current.lowest_ask, median, listings: current.ask_count }
}

/**
 * The price to start from: the market's current median, else the 30-day
 * median, else the lowest ask. Null when the item has no market yet (the
 * seller types one).
 */
export function suggestedQuickListPrice(stats: PriceOracleItem | null | undefined): number | null {
  const hint = marketPriceHint(stats)
  if (!hint) return null
  const price = hint.median ?? hint.low
  return price != null && price > 0 ? Math.round(price) : null
}

/** The shops a user can list in: those they own or manage the market of. */
export function quickListShops(
  myShops: ReadonlyArray<ShopResponse> | null | undefined,
): ShopResponse[] {
  return (myShops ?? []).filter((shop) => shop.status !== "archived" && canEditShopListings(shop))
}

/**
 * "Selling as": the shop of the page's context (a /shop/:slug page, or a
 * page reached from one), else the sidebar's shop, else the last shop the
 * user listed in, else their first shop. Only shops they can list in count.
 */
export function resolveSellingAsShop(args: {
  shops: ReadonlyArray<Pick<ShopResponse, "shop_id" | "slug">>
  pageShopSlug: string | null
  sidebarShopSlug: string | null
  lastShopId: string | null
}): string | null {
  const { shops } = args
  const bySlug = (slug: string | null) => (slug ? shops.find((s) => s.slug === slug) : undefined)
  const shop =
    bySlug(args.pageShopSlug) ??
    bySlug(args.sidebarShopSlug) ??
    (args.lastShopId ? shops.find((s) => s.shop_id === args.lastShopId) : undefined) ??
    shops[0]
  return shop?.shop_id ?? null
}

/** The shop slug of a /shop/:slug/... path, if it is one. */
export function shopSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/shop\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/** localStorage key of the last shop each user listed in (user name → shop id). */
export const LAST_QUICK_LIST_SHOP_KEY = "scm.quick-list.last-shop"

export function parseLastShops(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {}
    return Object.fromEntries(
      Object.entries(value).filter((e): e is [string, string] => typeof e[1] === "string"),
    )
  } catch {
    return {}
  }
}

/** Search param that opens Quick List when coming back from signing in. */
export const SELL_PARAM = "sell"
