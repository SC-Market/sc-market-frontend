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
import { MARKET_PATHS, ORG_PATHS, SHOP_PATHS, USER_PATHS } from "../routes/paths"
import { FALLBACK_IMAGE_URL } from "./constants"
import { PageHead, socialMeta } from "./pageHead"

/** /market/:id (ListingDetailV2). */
export function buildListingHead(
  data: Pick<GetListingDetailResponse, "listing" | "seller">,
  origin: string,
): PageHead {
  const { listing, seller } = data
  const photos = listing.photos?.length ? listing.photos : [FALLBACK_IMAGE_URL]
  const canonical = `${origin}${MARKET_PATHS.listing(listing.listing_id, listing.title)}`
  const description = listing.description?.slice(0, 160) || listing.title

  return {
    title: `${listing.title} — SC Market`,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title: listing.title,
        description,
        url: canonical,
        image: photos[0],
        ogType: "product",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description,
        image: photos[0] !== FALLBACK_IMAGE_URL ? photos[0] : undefined,
        url: canonical,
        // NOTE: prices are in aUEC (an in-game currency, not an ISO 4217
        // currency). schema.org/Offer requires a real currency and Google
        // rejects/ignores non-ISO priceCurrency (and warns in Search
        // Console), so we intentionally omit the monetary Offer and expose
        // the aUEC price as on-page text instead.
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: seller.name,
            url: `${origin}${SHOP_PATHS.profile(seller.slug)}`,
          },
        },
      },
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
  gameItem: Pick<GameItemMetadata, "id" | "name" | "image_url"> & { description?: string },
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
        content: gameItem.description || `Browse all ${name} listings on SC Market.`,
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
              // NOTE: prices are in aUEC (in-game currency, not ISO 4217).
              // Google ignores/rejects a non-ISO priceCurrency, so we omit the
              // monetary AggregateOffer and keep offerCount only — the aUEC
              // price range is exposed as on-page text instead.
              offers: {
                "@type": "AggregateOffer",
                offerCount: listingCount,
                availability: "https://schema.org/InStock",
              },
            },
          ]
        : [],
  }
}

/** Bundle page image (MarketMultipleViewV2): the first item's image. */
export function bundleImage(data: Pick<GetListingDetailResponse, "items">): string {
  return data.items[0]?.game_item.image_url || FALLBACK_IMAGE_URL
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
export function buildUserHead(profile: UserHeadInput, origin: string): PageHead {
  const url = `${origin}${USER_PATHS.profile(profile.username)}`
  const socialDescription =
    profile.profile_description || `${profile.display_name}'s profile on SC Market`

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
  const description = `Join ${post.contractor?.name || "an organization"} in Star Citizen.${post.body ? ` ${post.body.slice(0, 120)}` : ""}`.slice(0, 160)
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
