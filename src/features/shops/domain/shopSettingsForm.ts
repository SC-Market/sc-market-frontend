import type { ShopResponse, UpdateShopRequest } from "../../../store/api/v2/market"

/**
 * The Shop Settings form's editable copy of a shop. It is made from the shop
 * once (per shop id) and is never reset by a refetch, so a reload of the shop
 * while someone is typing keeps their edits.
 *
 * `logo` / `banner` hold a newly uploaded image's resource id (null: keep the
 * current one); `logoUrl` / `bannerUrl` are what the preview shows.
 */
export interface ShopSettingsDraft {
  name: string
  slug: string
  description: string
  tags: string[]
  supportedLanguages: string[]
  acceptsCustomOrders: boolean
  marketOrderTemplate: string
  officialServerId: string
  discordThreadChannelId: string
  logo: string | null
  logoUrl: string | null
  banner: string | null
  bannerUrl: string | null
}

type DraftSource = Pick<
  ShopResponse,
  | "name"
  | "slug"
  | "description"
  | "tags"
  | "supported_languages"
  | "accepts_custom_orders"
  | "market_order_template"
  | "official_server_id"
  | "discord_thread_channel_id"
  | "logo_url"
  | "banner_url"
>

export function shopToSettingsDraft(shop: DraftSource): ShopSettingsDraft {
  return {
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    tags: shop.tags,
    supportedLanguages: shop.supported_languages,
    acceptsCustomOrders: shop.accepts_custom_orders,
    marketOrderTemplate: shop.market_order_template,
    officialServerId: shop.official_server_id ?? "",
    discordThreadChannelId: shop.discord_thread_channel_id ?? "",
    logo: null,
    logoUrl: shop.logo_url,
    banner: null,
    bannerUrl: shop.banner_url,
  }
}

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

/**
 * The update request for what the draft changed since `base` (the draft as
 * it was loaded or last saved). Unchanged fields are left out, so saving
 * never overwrites a field someone else changed meanwhile. The two Discord
 * IDs are sent together whenever either changed: the backend reads them as a
 * pair (both set, or both empty for the owner's channel).
 */
export function settingsDraftToUpdateRequest(
  draft: ShopSettingsDraft,
  base: ShopSettingsDraft,
): UpdateShopRequest {
  const req: UpdateShopRequest = {}
  if (draft.name !== base.name) req.name = draft.name
  if (draft.slug !== base.slug) req.slug = draft.slug
  if (draft.description !== base.description) req.description = draft.description
  if (!sameList(draft.tags, base.tags)) req.tags = draft.tags
  if (!sameList(draft.supportedLanguages, base.supportedLanguages)) {
    req.supported_languages = draft.supportedLanguages
  }
  if (draft.acceptsCustomOrders !== base.acceptsCustomOrders) {
    req.accepts_custom_orders = draft.acceptsCustomOrders
  }
  if (draft.marketOrderTemplate !== base.marketOrderTemplate) {
    req.market_order_template = draft.marketOrderTemplate
  }
  const serverId = draft.officialServerId.trim()
  const channelId = draft.discordThreadChannelId.trim()
  if (
    serverId !== base.officialServerId.trim() ||
    channelId !== base.discordThreadChannelId.trim()
  ) {
    req.official_server_id = serverId || null
    req.discord_thread_channel_id = channelId || null
  }
  if (draft.logo) req.logo = draft.logo
  if (draft.banner) req.banner = draft.banner
  return req
}

/** Whether saving the draft would change anything. */
export function isSettingsDraftDirty(
  draft: ShopSettingsDraft,
  base: ShopSettingsDraft,
): boolean {
  return Object.keys(settingsDraftToUpdateRequest(draft, base)).length > 0
}

/**
 * The draft to compare against after a successful save: what was saved, with
 * the uploaded images now the shop's current ones.
 */
export function savedSettingsDraft(draft: ShopSettingsDraft): ShopSettingsDraft {
  return { ...draft, logo: null, banner: null }
}
