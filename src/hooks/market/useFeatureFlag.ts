/**
 * useFeatureFlag – Multi-flag feature flag hook.
 *
 * Reads localStorage immediately (never blocks render), then fetches from the
 * server in the background and applies the result to both state and
 * localStorage — so a flag an admin flips takes effect in the current session,
 * on the render after the sync resolves, without a reload.
 *
 * The server's value always wins for a flag it sent. It resolves per-user
 * overrides itself, at a higher precedence than both the enabled gate and the
 * rollout, so there is nothing for the client to preserve on top of it. Local
 * storage is a first-paint cache, not a second source of truth.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { useAppDispatch } from "../../store/hooks"
import { marketV2Api } from "../../store/api/v2/market"
import { useHydrated } from "../ssr/useHydrated"
import { isSiteAdmin } from "../../util/siteRole"
import { whenStartupGateOpen } from "../../util/startupDeferral"

export interface FeatureFlags {
  [key: string]: boolean
}

export interface UseFeatureFlagReturn {
  isLoading: boolean
  error: Error | null
  isDeveloper: boolean
  hasOverride: boolean
  /** All resolved flags */
  flags: FeatureFlags
  /** Which flags this user has overrides for */
  overriddenFlags: string[]
  /** Set a specific flag */
  setFlag: (flagName: string, enabled: boolean) => Promise<void>
}

const DEFAULT_FLAGS: FeatureFlags = { market_v2_redesign: false, customizable_dashboard: false }
const STORAGE_KEY = "feature_flags"
/** Written by the retired market_v2 flag; removed on sight, never read. */
const LEGACY_MARKET_VERSION_KEY = "market_version"

/** Whether this browser has a stored copy of the server's flags. */
function hasStoredFlags(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function readStoredFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_FLAGS, ...JSON.parse(stored) }
  } catch {}
  return DEFAULT_FLAGS
}

export function useFeatureFlag(): UseFeatureFlagReturn {
  const dispatch = useAppDispatch()
  const { data: profile } = useGetUserProfileQuery()
  // The server (and so the hydration render) can't see localStorage: start
  // from DEFAULT_FLAGS there and apply the stored flags right after hydrating.
  // A client-only render reads them straight away.
  const hydrated = useHydrated()
  const [flags, setFlags] = useState<FeatureFlags>(() =>
    hydrated ? readStoredFlags() : DEFAULT_FLAGS,
  )
  useEffect(() => {
    if (!hydrated) setFlags(readStoredFlags())
    try {
      localStorage.removeItem(LEGACY_MARKET_VERSION_KEY)
    } catch {}
    // Only the first render's value matters: it says whether we hydrated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [overriddenFlags, setOverriddenFlags] = useState<string[]>([])
  const [hasOverride, setHasOverride] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const isFrontendDev = useMemo(
    () => import.meta.env.DEV || import.meta.env.MODE === "development",
    [],
  )
  const isDeveloper = isFrontendDev || isSiteAdmin(profile)

  // Background sync: fetch from server, then apply to both state and
  // localStorage. This calls setFlags, so the result lands in the current
  // session on the next render — not just the next one.
  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      try {
        // With a stored copy the first paint already uses the server's last
        // answer, so on the first page load the sync waits for the startup
        // gate (util/startupDeferral.ts) instead of competing with the
        // page's own request; its answer still wins when it lands. Without
        // one (first visit) it runs at once: the layout may depend on it.
        if (hasStoredFlags()) await whenStartupGateOpen()
        if (cancelled) return
        const result = await dispatch(
          marketV2Api.endpoints.getFeatureFlag.initiate(),
        )
        if (cancelled) return

        const data = result.data
        if (data?.flags) {
          // Defaults only fill flags the server did not mention (a flag with no
          // feature_flag_config row is absent from the response, not false).
          // Everything the server did send wins outright: isFlagEnabled already
          // resolves user_feature_overrides at the highest precedence, ahead of
          // the enabled gate and the rollout, so data.flags IS the user's
          // override where they have one. Re-applying a local value on top of it
          // is what used to break rollouts — the old guard tested
          // `key in readStoredFlags()`, which always spreads DEFAULT_FLAGS and
          // so was true even on a browser that had never stored anything.
          const serverFlags = { ...DEFAULT_FLAGS, ...data.flags }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverFlags))
          // Update state only if changed (avoids re-renders)
          setFlags((prev) => {
            const changed = Object.keys(serverFlags).some((k) => prev[k] !== serverFlags[k])
            return changed ? serverFlags : prev
          })
        }

        if (data?.has_override !== undefined) setHasOverride(!!data.has_override)
        if (data?.overridden_flags) setOverriddenFlags(data.overridden_flags)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch feature flags"))
        }
      }
    }

    void sync()
    return () => { cancelled = true }
  }, [profile?.username, dispatch])

  const setFlag = useCallback(
    async (flagName: string, enabled: boolean) => {
      try {
        setError(null)
        await dispatch(
          marketV2Api.endpoints.setFeatureFlag.initiate({
            setFeatureFlagRequest: { flag_name: flagName, enabled },
          }),
        )
        const newFlags = { ...flags, [flagName]: enabled }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags))
        setFlags(newFlags)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to set flag"))
      }
    },
    [flags, dispatch],
  )

  return {
    isLoading: false,
    error,
    isDeveloper,
    hasOverride,
    flags,
    overriddenFlags,
    setFlag,
  }
}
