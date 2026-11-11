/**
 * Head builders for user-generated public pages: listings, shops, orgs,
 * users and recruiting posts. Shared by the pages (via <SeoHead>) and the
 * edge bridge. Pure: no React, no browser globals.
 *
 * Input types are the minimal structural shape each page reads, so the
 * pages' hand-written domain types and the generated API types both fit.
 */
import type {
  GameItemMetadata,
  GetListingDetailResponse,
  ShopPublicResponse,
} from "../store/api/v2/market"
import { formatShortSlug } from "../features/market/domain/urls"
import {
  MARKET_PATHS,
  ORG_PATHS,
  SHOP_PATHS,
  USER_PATHS,
} from "../routes/paths"
import { MISSING_IMAGE_ABSOLUTE_URL } from "./constants"
import { breadcrumbJsonLd, PageHead, socialMeta } from "./pageHead"

import { formatInteger, formatNumber } from "../util/format/format"
/** /market/:id (ListingDetailV2). */
/**
 * Robots tag for a listing that isn't public: an unlisted listing is
 * link-only and a private one is org-internal, so neither may be indexed
 * (the SPA and the edge bridge both render these heads).
 */
function listingRobotsMeta(
  listing: Pick<GetListingDetailResponse["listing"], "visibility">,
): PageHead["meta"] {
  return listing.visibility === "unlisted" || listing.visibility === "private"
    ? [{ name: "robots", content: "noindex" }]
    : []
}

/** A listing's lowest and highest price (aUEC) over its items and variants. */
export function listingPriceRange(
  data: Pick<GetListingDetailResponse, "items">,
): { min: number; max: number } | null {
  const prices: number[] = []
  for (const item of data.items ?? []) {
    // The API serializes numeric columns as strings ("50000000"): Number()
    // reads both.
    const base = Number(item.base_price)
    if (item.pricing_mode === "unified" && Number.isFinite(base) && base > 0) {
      prices.push(base)
      continue
    }
    for (const variant of item.variants ?? []) {
      const price = Number(variant.price)
      if (Number.isFinite(price) && price > 0) prices.push(price)
    }
  }
  if (prices.length === 0) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

/** Units in stock over a listing's items and variants. */
export function listingQuantity(
  data: Pick<GetListingDetailResponse, "items">,
): number {
  let total = 0
  for (const item of data.items ?? []) {
    for (const variant of item.variants ?? []) {
      const quantity = Number(variant.quantity)
      if (Number.isFinite(quantity) && quantity > 0) total += quantity
    }
  }
  return total
}

/**
 * aUEC amount for titles: exact below 100k ("25,000"), compact above
 * ("150K", "1.5M", "2B"), which keeps the price inside a search result title.
 */
export function formatAuecShort(value: number): string {
  if (value < 100_000) return formatInteger(value, "en") // English head text
  const units: [number, string][] = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ]
  for (const [size, suffix] of units) {
    if (value >= size) {
      const scaled = value / size
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
      return `${Number(scaled.toFixed(digits))}${suffix}`
    }
  }
  return String(Math.round(value))
}

/** "1.5M aUEC" or "from 1.5M aUEC" (several prices), null without a price. */
export function listingPriceLabel(
  range: { min: number; max: number } | null,
): string | null {
  if (!range) return null
  const amount = `${formatAuecShort(range.min)} aUEC`
  return range.max > range.min ? `from ${amount}` : amount
}

/** The seller's rating as text, null while unrated. */
export function sellerRatingLabel(
  rating: number | null | undefined,
  count?: number | null,
): string | null {
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating <= 0)
    return null
  const stars = `${Number(rating.toFixed(1))}/5`
  return typeof count === "number" && count > 0
    ? `rated ${stars} from ${count} review${count === 1 ? "" : "s"}`
    : `rated ${stars}`
}

/**
 * The listing's image: its first photo, else the game item's image, else
 * SC Market's missing-image placeholder (absolute: it's the og:image).
 */
export function listingImage(
  data: Pick<GetListingDetailResponse, "listing" | "items">,
): string {
  return (
    data.listing.photos?.find((photo) => !!photo) ||
    data.items?.find((item) => !!item.game_item?.image_url)?.game_item
      .image_url ||
    MISSING_IMAGE_ABSOLUTE_URL
  )
}

/**
 * /market/:id (ListingDetailV2 and the edge bridge).
 *
 * Title: "{title} — {price} aUEC · Star Citizen | SC Market" (the price is
 * what searchers compare). Description: price, seller, rating, stock, then
 * the listing's own text.
 *
 * JSON-LD: a Product (name, description, image, the game item's category)
 * and a BreadcrumbList, with no Offer. Google requires a valid ISO 4217
 * `priceCurrency` on Offer/AggregateOffer, and aUEC is an in-game currency:
 * an Offer with a made-up currency, or with none, or without a price, is an
 * invalid Offer. So the price lives in the visible text, the title and the
 * description (what crawlers and answer engines quote) and nothing claims a
 * real-money price. The seller's rating stays off the Product (a seller's
 * rating as product aggregateRating is a misattributed review); it's on the
 * shop page's Store entity.
 */
export function buildListingHead(
  data: Pick<GetListingDetailResponse, "listing" | "seller"> &
    Partial<Pick<GetListingDetailResponse, "items">>,
  origin: string,
): PageHead {
  const { listing, seller } = data
  const items = data.items ?? []
  const range = listingPriceRange({ items })
  const priceLabel = listingPriceLabel(range)
  const quantity = listingQuantity({ items })
  const image = listingImage({ listing, items })
  const canonical = `${origin}${MARKET_PATHS.listing(listing.listing_id, listing.title)}`
  const facts = [
    priceLabel,
    `sold by ${seller.name}`,
    sellerRatingLabel(seller.rating),
    quantity > 0 ? `${formatNumber(quantity, "en")} available` : null,
  ].filter(Boolean)
  const summary = `${facts.join(" · ")}.`
  const text = listing.description?.replace(/\s+/g, " ").trim()
  const descriptionFull =
    text && text !== listing.title
      ? `${summary} ${text}`
      : `${listing.title}: ${summary}`
  const description =
    descriptionFull.length > 160
      ? `${descriptionFull.slice(0, 159).trimEnd()}…`
      : descriptionFull
  const title = priceLabel
    ? `${listing.title} — ${priceLabel} · Star Citizen | SC Market`
    : `${listing.title} · Star Citizen | SC Market`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...listingRobotsMeta(listing),
      ...socialMeta({
        title: priceLabel ? `${listing.title} — ${priceLabel}` : listing.title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description || description,
        image: image !== MISSING_IMAGE_ABSOLUTE_URL ? image : undefined,
        url: canonical,
        category: items[0]?.game_item?.type || undefined,
      },
      breadcrumbJsonLd([
        { name: "SC Market", url: `${origin}/` },
        { name: "Market", url: `${origin}${MARKET_PATHS.search}` },
        ...(items.length === 1 &&
        items[0].game_item?.id &&
        items[0].game_item.name
          ? [
              {
                name: items[0].game_item.name,
                url: `${origin}${MARKET_PATHS.aggregate(items[0].game_item.id, items[0].game_item.name)}`,
              },
            ]
          : []),
        { name: listing.title, url: canonical },
      ]),
    ],
  }
}

/** Aggregate page description (MarketAggregateViewV2). */
export function aggregateSeoDescription(name: string): string {
  return `Browse all ${name} listings on SC Market. Compare prices from multiple sellers.`
}

/**
 * /market/aggregate/:id (MarketAggregateViewV2). The canonical comes from
 * the page layout (the request path), so it isn't part of this head.
 * `description` is the game item description the page has (it passes "").
 */
export function buildAggregateHead(
  gameItem: Pick<GameItemMetadata, "id" | "name" | "image_url"> & {
    description?: string
  },
  listingCount: number,
  origin: string,
): PageHead {
  const name = gameItem.name
  const image = gameItem.image_url || ""
  const fallback = aggregateSeoDescription(name)
  const url = `${origin}/market/aggregate/${gameItem.id ? formatShortSlug(gameItem.id, name) : gameItem.id}`

  return {
    title: `${name} — SC Market`,
    meta: [
      { property: "og:title", content: name },
      { property: "og:url", content: url },
      ...(image ? [{ property: "og:image", content: image }] : []),
      { name: "description", content: gameItem.description || fallback },
      { property: "og:type", content: "website" },
      { property: "og:description", content: gameItem.description || fallback },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: name },
      {
        name: "twitter:description",
        content:
          gameItem.description || `Browse all ${name} listings on SC Market.`,
      },
      { name: "twitter:image", content: image },
    ],
    jsonLd:
      name && listingCount > 0
        ? [
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name,
              description: fallback,
              image: image || undefined,
              url,
              // No AggregateOffer: Google requires lowPrice and an ISO 4217
              // priceCurrency on it, and aUEC is an in-game currency. The
              // aUEC price range is on-page text instead.
            },
          ]
        : [],
  }
}

/** Bundle page image (MarketMultipleViewV2): the first item's image. */
export function bundleImage(
  data: Pick<GetListingDetailResponse, "items">,
): string {
  return data.items[0]?.game_item.image_url || MISSING_IMAGE_ABSOLUTE_URL
}

/**
 * /market/multiple/:id (MarketMultipleViewV2). Title and canonical come
 * from the page layout (listing title / the request path).
 */
export function buildBundleHead(
  data: Pick<GetListingDetailResponse, "listing" | "items">,
  origin: string,
): PageHead {
  const { listing } = data
  const url = `${origin}${MARKET_PATHS.multiple(listing.listing_id)}`
  const image = bundleImage(data)

  return {
    meta: [
      { name: "description", content: listing.description },
      ...listingRobotsMeta(listing),
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: listing.title },
      { property: "og:description", content: listing.description },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: url },
      { name: "twitter:title", content: listing.title },
      { name: "twitter:description", content: listing.description },
      { name: "twitter:image", content: image },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        image,
        url,
      },
    ],
  }
}

/** Shop description used for the meta description and the bridge summary. */
export function shopSeoDescription(
  shop: Pick<ShopPublicResponse, "name" | "tags" | "description">,
): string {
  return `${shop.name} — ${shop.tags?.join(", ") || "Star Citizen"} shop on SC Market.${shop.description ? ` ${shop.description.slice(0, 100)}` : ""}`
}

/** /shops/:slug[/:tab] (ShopProfile). */
export function buildShopHead(
  shop: Pick<
    ShopPublicResponse,
    | "name"
    | "slug"
    | "tags"
    | "description"
    | "banner_url"
    | "logo_url"
    | "rating"
    | "rating_count"
  >,
  origin: string,
): PageHead {
  const title = `${shop.name} — Star Citizen Shop | SC Market`
  const description = shopSeoDescription(shop).slice(0, 160)
  const image = shop.banner_url || shop.logo_url || ""
  const canonical = `${origin}${SHOP_PATHS.profile(shop.slug)}`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "website",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Store",
        "@id": `${canonical}#store`,
        name: shop.name,
        description: shop.description,
        url: canonical,
        image,
        ...(shop.rating != null && shop.rating_count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: shop.rating,
                ratingCount: shop.rating_count,
              },
            }
          : {}),
      },
    ],
  }
}

export interface OrgHeadInput {
  name: string
  description: string
  spectrum_id: string
  avatar: string
  banner: string
  site_url?: string
  size: number
  fields: readonly string[]
  languages?: ReadonlyArray<{ code: string }>
}

/** Org page title (ViewOrg), before the titleTemplate. */
export function orgPageTitle(name: string, orgLabel: string): string {
  return `${name} - ${orgLabel}`
}

/**
 * /contractor/:id[/:tab] (OrgMetaTags). Title and canonical come from the
 * page layout (orgPageTitle / the request path), not from this head.
 */
export function buildOrgHead(
  contractor: OrgHeadInput,
  shop: Pick<ShopPublicResponse, "name" | "slug"> | undefined,
  origin: string,
): PageHead {
  const orgUrl = `${origin}${ORG_PATHS.profile(contractor.spectrum_id)}`
  const socialDescription =
    contractor.description || `${contractor.name} on SC Market`
  const image = contractor.banner || contractor.avatar
  // "~"-prefixed spectrum IDs are not real RSI orgs (see OrgHeader)
  const sameAs = [
    ...(contractor.spectrum_id.startsWith("~")
      ? []
      : [`https://robertsspaceindustries.com/orgs/${contractor.spectrum_id}`]),
    ...(contractor.site_url ? [contractor.site_url] : []),
  ]

  return {
    meta: [
      {
        name: "description",
        content:
          contractor.description?.slice(0, 160) ||
          `${contractor.name} — Star Citizen organization on SC Market`,
      },
      ...socialMeta({
        title: `${contractor.name} - SC Market`,
        description: socialDescription,
        url: orgUrl,
        image,
        ogType: "website",
        twitterCard: "summary_large_image",
        twitterUrl: true,
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${orgUrl}#organization`,
        name: contractor.name,
        description: contractor.description,
        url: orgUrl,
        image,
        logo: contractor.avatar,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        numberOfEmployees: contractor.size
          ? { "@type": "QuantitativeValue", value: contractor.size }
          : undefined,
        knowsLanguage: contractor.languages?.length
          ? contractor.languages.map((l) => l.code)
          : undefined,
        knowsAbout: contractor.fields?.length ? contractor.fields : undefined,
        owns: shop
          ? {
              "@type": "Store",
              "@id": `${origin}${SHOP_PATHS.profile(shop.slug)}#store`,
              name: shop.name,
              url: `${origin}${SHOP_PATHS.profile(shop.slug)}`,
            }
          : undefined,
      },
    ],
  }
}

export interface UserHeadInput {
  username: string
  display_name: string
  avatar: string
  banner: string
  profile_description: string
}

/** User profile page title (Profile), before the titleTemplate. */
export function userPageTitle(displayName: string, storeLabel: string): string {
  return `${displayName} - ${storeLabel}`
}

/**
 * /user/:username[/:tab] (ProfileMetaTags). Title and canonical come from
 * the page layout (userPageTitle / the request path).
 */
export function buildUserHead(
  profile: UserHeadInput,
  origin: string,
): PageHead {
  const url = `${origin}${USER_PATHS.profile(profile.username)}`
  const socialDescription =
    profile.profile_description ||
    `${profile.display_name}'s profile on SC Market`

  return {
    meta: [
      {
        name: "description",
        content:
          profile.profile_description?.slice(0, 160) ||
          `${profile.display_name || profile.username} — Star Citizen player on SC Market`,
      },
      ...socialMeta({
        title: `${profile.display_name} - SC Market`,
        description: socialDescription,
        url,
        image: profile.banner || profile.avatar,
        ogType: "profile",
        twitterCard: "summary_large_image",
        twitterUrl: true,
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        description: profile.profile_description,
        name: profile.display_name,
        username: profile.username,
        avatar_url: profile.avatar,
        banner_url: profile.banner,
      },
    ],
  }
}

export interface RecruitingPostHeadInput {
  post_id: string
  title: string
  body: string
  timestamp: number | string
  contractor?: {
    name?: string
    spectrum_id?: string
    banner?: string
    avatar?: string
  }
}

/** /recruiting/post/:post_id (RecruitingPostContent). */
export function buildRecruitingPostHead(
  post: RecruitingPostHeadInput,
  origin: string,
): PageHead {
  const title = `${post.title} — Star Citizen Recruiting | SC Market`
  const description =
    `Join ${post.contractor?.name || "an organization"} in Star Citizen.${post.body ? ` ${post.body.slice(0, 120)}` : ""}`.slice(
      0,
      160,
    )
  const image = post.contractor?.banner || post.contractor?.avatar || ""
  const canonical = `${origin}/recruiting/post/${post.post_id}`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "website",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: post.title,
        description: post.body,
        datePosted: post.timestamp
          ? new Date(post.timestamp).toISOString()
          : undefined,
        hiringOrganization: {
          "@type": "Organization",
          name: post.contractor?.name,
          url: post.contractor?.spectrum_id
            ? `${origin}${ORG_PATHS.profile(post.contractor.spectrum_id)}`
            : undefined,
        },
        jobLocationType: "TELECOMMUTE",
      },
    ],
  }
}
