import { hashString } from "./adConfig"
import type { AdCampaign, ImageAdConfig } from "./types"

/** Whether `campaign` runs at `now` (ms since the epoch): start <= now < end. */
export function isCampaignActive(campaign: AdCampaign, now: number): boolean {
  return now >= Date.parse(campaign.start) && now < Date.parse(campaign.end)
}

/**
 * The next instant after `now` at which the campaign starts or ends, or null
 * once it is over: when to look at the clock again.
 */
export function nextCampaignBoundary(
  campaign: AdCampaign,
  now: number,
): number | null {
  const next = [Date.parse(campaign.start), Date.parse(campaign.end)].find(
    (t) => t > now,
  )
  return next ?? null
}

/** A signed-in user's creative: a hash of the username, the same every visit. */
export function signedInCreative(
  campaign: AdCampaign,
  username: string,
): ImageAdConfig {
  const { creatives } = campaign
  return creatives[hashString(`${campaign.id}:${username}`) % creatives.length]
}

type CampaignStorage = Pick<Storage, "getItem" | "setItem">

// Picks made where localStorage can't be written (blocked, full), so they
// still hold for the rest of the page's lifetime.
const unpersisted = new Map<string, string>()

/**
 * An anonymous visitor's creative: picked at random once, then kept in
 * localStorage under the campaign's key, so the visitor sees the same one for
 * the whole campaign. A stored id that is no longer in the set is replaced.
 */
export function anonymousCreative(
  campaign: AdCampaign,
  storage: CampaignStorage | null,
  random: () => number = Math.random,
): ImageAdConfig {
  const { creatives, storageKey } = campaign
  let stored: string | null = unpersisted.get(storageKey) ?? null
  if (stored === null && storage) {
    try {
      stored = storage.getItem(storageKey)
    } catch {
      stored = null
    }
  }
  const kept = creatives.find((c) => c.id === stored)
  if (kept) return kept

  const picked =
    creatives[
      Math.min(Math.floor(random() * creatives.length), creatives.length - 1)
    ]
  try {
    if (!storage) throw new Error("no storage")
    storage.setItem(storageKey, picked.id)
    unpersisted.delete(storageKey)
  } catch {
    unpersisted.set(storageKey, picked.id)
  }
  return picked
}

/** Test hook: forget picks held in memory. */
export function resetUnpersistedCampaignPicks(): void {
  unpersisted.clear()
}
