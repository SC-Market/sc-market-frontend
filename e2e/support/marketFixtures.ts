/**
 * Market fixtures for the e2e fake API: a few listings in the fixture shop
 * (test-shop, from the route regression harness fixtures) with search results,
 * listing detail and a cart. All names are made up.
 */
import type {
  GetCartResponse,
  GetListingDetailResponse,
  ListingSearchResult,
  SearchListingsResponse,
} from "../../src/store/api/v2/market"
import { fixtureShopPublic } from "../../src/router/__tests__/regression/fixtures"

const T = "2026-01-01T00:00:00.000Z"

interface FixtureListing {
  id: string
  variantId: string
  title: string
  item: string
  type: string
  price: number
  quantity: number
}

export const LISTINGS: FixtureListing[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    variantId: "11111111-aaaa-4aaa-8aaa-111111111111",
    title: "Fixture Laser Rifle",
    item: "Fixture Laser Rifle",
    type: "Ranged Weapon",
    price: 25000,
    quantity: 12,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    variantId: "22222222-aaaa-4aaa-8aaa-222222222222",
    title: "Fixture Medical Pen",
    item: "Fixture Medical Pen",
    type: "Medical",
    price: 1500,
    quantity: 300,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    variantId: "33333333-aaaa-4aaa-8aaa-333333333333",
    title: "Fixture Armor Set",
    item: "Fixture Armor Set",
    type: "Armor",
    price: 90000,
    quantity: 3,
  },
]

const shop = fixtureShopPublic

function searchResult(l: FixtureListing): ListingSearchResult {
  return {
    listing_id: l.id,
    title: l.title,
    shop_id: shop.shop_id,
    shop_name: shop.name,
    shop_slug: shop.slug,
    shop_rating: 5,
    shop_rating_count: 1,
    shop_badge_ids: [],
    shop_languages: ["en"],
    price_min: l.price,
    price_max: l.price,
    quantity_available: l.quantity,
    variant_count: 1,
    created_at: T,
    updated_at: T,
    game_item_id: `${l.id}-item`,
    game_item_name: l.item,
    game_item_type: l.type,
    pickup_method: null,
    quantity_unit: "unit",
    visibility: "public",
  }
}

/** GET /api/v2/listings/search: `text` and `item_type` filter the fixtures. */
export function searchListings(
  params: URLSearchParams,
): SearchListingsResponse {
  const text = (params.get("text") ?? "").toLowerCase()
  const type = params.get("item_type")
  const listings = LISTINGS.filter(
    (l) =>
      (!text || l.title.toLowerCase().includes(text)) &&
      (!type || l.type === type),
  ).map(searchResult)
  return {
    listings,
    total: listings.length,
    page: Number(params.get("page") ?? 1),
    page_size: Number(params.get("page_size") ?? 48),
  }
}

/** By UUID or short slug: the slug starts with the UUID's first 8 chars. */
export function findListing(idOrSlug: string): FixtureListing | undefined {
  const prefix = idOrSlug.split("--")[0]
  return LISTINGS.find((x) => x.id === idOrSlug || x.id.startsWith(prefix))
}

export function listingDetail(id: string): GetListingDetailResponse | null {
  const l = findListing(id)
  if (!l) return null
  // The generated types say number; the API sends prices as strings (see
  // a real response), and the UI handles both.
  return {
    listing: {
      listing_id: l.id,
      shop_id: shop.shop_id,
      title: l.title,
      description: `${l.title}, fixture listing for the e2e suite.`,
      status: "active",
      visibility: "public",
      sale_type: "fixed",
      listing_type: "single",
      created_at: T,
      updated_at: T,
      photos: [],
      pickup_method: null,
      quantity_unit: "unit",
      view_count: 1,
      in_carts: 0,
    },
    seller: {
      shop_id: shop.shop_id,
      name: shop.name,
      slug: shop.slug,
      rating: 5,
      languages: ["en"],
    },
    items: [
      {
        item_id: `${l.id}-li`,
        game_item: { id: `${l.id}-item`, name: l.item, type: l.type },
        pricing_mode: "unified",
        base_price: l.price,
        variants: [
          {
            variant_id: l.variantId,
            attributes: {},
            display_name: "Standard",
            short_name: "Std",
            quantity: l.quantity,
            price: l.price,
            locations: [],
          },
        ],
      },
    ],
  } as GetListingDetailResponse
}

/** In-memory cart for one test. */
export class FakeCart {
  private items: { id: string; listing: FixtureListing; quantity: number }[] =
    []
  private next = 1

  add(body: { listing_id: string; variant_id: string; quantity: number }) {
    const listing = findListing(body.listing_id)
    if (!listing) return null
    const id = `cart-item-${this.next++}`
    this.items.push({ id, listing, quantity: body.quantity })
    return { cart_item_id: id, message: "Added to cart" }
  }

  remove(id: string): boolean {
    const before = this.items.length
    this.items = this.items.filter((i) => i.id !== id)
    return this.items.length < before
  }

  get size(): number {
    return this.items.length
  }

  view(): GetCartResponse {
    const items = this.items.map(({ id, listing, quantity }) => ({
      cart_item_id: id,
      listing: {
        listing_id: listing.id,
        title: listing.title,
        shop_id: shop.shop_id,
        shop_name: shop.name,
        shop_slug: shop.slug,
        shop_rating: 5,
        status: "active",
        shop_next_available: null,
      },
      variant: {
        variant_id: listing.variantId,
        attributes: {},
        display_name: "Standard",
        short_name: "Std",
      },
      quantity,
      price_per_unit: listing.price,
      subtotal: quantity * listing.price,
      available: true,
      quantity_available: listing.quantity,
      price_changed: false,
    }))
    return {
      items,
      total_price: items.reduce((sum, i) => sum + i.subtotal, 0),
      item_count: items.length,
    }
  }
}
