import { useCallback, useMemo, useSyncExternalStore } from "react"
import { useSession } from "../../hooks/login/useSession"
import {
  anonymousCreative,
  isCampaignActive,
  nextCampaignBoundary,
  signedInCreative,
} from "./campaign"
import { IAE_2956 } from "./iae2956"
import type { AdCampaign, ImageAdConfig } from "./types"

/** setTimeout's longest delay; longer waits re-arm. */
const MAX_TIMEOUT = 2 ** 31 - 1

const inactiveOnServer = () => false

/**
 * Whether the campaign runs now. `false` on the server and in the hydration
 * render (the server can't know the visitor's clock, and a prerendered page
 * may be served long after it was built), the real answer right after.
 * Re-renders at the campaign's start and end, so it switches on and off
 * without a reload or a deploy.
 */
export function useCampaignActive(campaign: AdCampaign): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      const arm = () => {
        const now = Date.now()
        const next = nextCampaignBoundary(campaign, now)
        if (next === null) return
        timer = setTimeout(
          () => {
            notify()
            arm()
          },
          Math.min(next - now, MAX_TIMEOUT),
        )
      }
      arm()
      return () => clearTimeout(timer)
    },
    [campaign],
  )
  const getSnapshot = useCallback(
    () => isCampaignActive(campaign, Date.now()),
    [campaign],
  )
  return useSyncExternalStore(subscribe, getSnapshot, inactiveOnServer)
}

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

/**
 * This visitor's creative from a running campaign, or null (campaign not
 * running, login state not known yet, server render, hydration render). Pass
 * it to insertAds, which gives it one slot per page.
 *
 * Signed-in users get one chosen from a hash of their username; anonymous
 * visitors a random one, kept in localStorage. Either way it is the same
 * creative for the whole campaign. Hydration-safe: the server and the first
 * client render both get null (useCampaignActive, useSession), so they lay
 * out the same ads; the campaign ad takes its slot right after.
 */
export function useCampaignAd(
  campaign: AdCampaign = IAE_2956,
): ImageAdConfig | null {
  const active = useCampaignActive(campaign)
  const session = useSession()
  const username =
    session.status === "authenticated" ? session.profile.username : null
  return useMemo(() => {
    if (!active || session.status === "unknown") return null
    return username
      ? signedInCreative(campaign, username)
      : anonymousCreative(campaign, browserStorage())
  }, [active, session.status, username, campaign])
}
