import { describe, expect, it } from "vitest"
import {
  isSettingsDraftDirty,
  savedSettingsDraft,
  settingsDraftToUpdateRequest,
  shopToSettingsDraft,
} from "../shopSettingsForm"

const shop = {
  name: "SC Market",
  slug: "scmarket",
  description: "We sell things",
  tags: ["Cargo"],
  supported_languages: ["en"],
  accepts_custom_orders: true,
  market_order_template: "",
  official_server_id: null,
  discord_thread_channel_id: null,
  logo_url: "https://cdn.example/logo.png",
  banner_url: null,
}

describe("shopToSettingsDraft", () => {
  it("copies the editable fields, with empty strings for unset Discord IDs", () => {
    expect(shopToSettingsDraft(shop)).toEqual({
      name: "SC Market",
      slug: "scmarket",
      description: "We sell things",
      tags: ["Cargo"],
      supportedLanguages: ["en"],
      acceptsCustomOrders: true,
      marketOrderTemplate: "",
      officialServerId: "",
      discordThreadChannelId: "",
      logo: null,
      logoUrl: "https://cdn.example/logo.png",
      banner: null,
      bannerUrl: null,
    })
  })
})

describe("settingsDraftToUpdateRequest", () => {
  const base = shopToSettingsDraft(shop)

  it("sends nothing for an unchanged draft", () => {
    expect(settingsDraftToUpdateRequest(base, base)).toEqual({})
    expect(isSettingsDraftDirty(base, base)).toBe(false)
  })

  it("sends only the fields that changed", () => {
    const draft = { ...base, name: "SC Market Co", acceptsCustomOrders: false }
    expect(settingsDraftToUpdateRequest(draft, base)).toEqual({
      name: "SC Market Co",
      accepts_custom_orders: false,
    })
    expect(isSettingsDraftDirty(draft, base)).toBe(true)
  })

  it("compares lists by value, not identity", () => {
    expect(settingsDraftToUpdateRequest({ ...base, tags: ["Cargo"] }, base)).toEqual({})
    expect(
      settingsDraftToUpdateRequest({ ...base, supportedLanguages: ["en", "de"] }, base),
    ).toEqual({ supported_languages: ["en", "de"] })
    expect(settingsDraftToUpdateRequest({ ...base, tags: [] }, base)).toEqual({ tags: [] })
  })

  it("sends both Discord IDs, trimmed, when either changes", () => {
    const draft = {
      ...base,
      officialServerId: " 1003056231591727264 ",
      discordThreadChannelId: "1072580369251041330",
    }
    expect(settingsDraftToUpdateRequest(draft, base)).toEqual({
      official_server_id: "1003056231591727264",
      discord_thread_channel_id: "1072580369251041330",
    })
  })

  it("sends both Discord IDs as null when they are cleared", () => {
    const withIds = {
      ...base,
      officialServerId: "1003056231591727264",
      discordThreadChannelId: "1072580369251041330",
    }
    const cleared = { ...withIds, officialServerId: "", discordThreadChannelId: " " }
    expect(settingsDraftToUpdateRequest(cleared, withIds)).toEqual({
      official_server_id: null,
      discord_thread_channel_id: null,
    })
  })

  it("ignores whitespace-only changes to the Discord IDs", () => {
    const withIds = { ...base, officialServerId: "1", discordThreadChannelId: "2" }
    expect(
      settingsDraftToUpdateRequest({ ...withIds, officialServerId: " 1 " }, withIds),
    ).toEqual({})
  })

  it("sends newly uploaded images by resource id", () => {
    const draft = { ...base, logo: "res-logo", logoUrl: "blob:new", banner: "res-banner" }
    expect(settingsDraftToUpdateRequest(draft, base)).toEqual({
      logo: "res-logo",
      banner: "res-banner",
    })
  })

  it("round-trips: after saving, the saved draft is clean", () => {
    const draft = { ...base, description: "New text", logo: "res-logo", logoUrl: "blob:new" }
    const saved = savedSettingsDraft(draft)
    expect(saved.logo).toBeNull()
    expect(saved.logoUrl).toBe("blob:new")
    expect(isSettingsDraftDirty({ ...draft, logo: null }, saved)).toBe(false)
  })
})
