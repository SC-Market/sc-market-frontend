/**
 * useFeatureFlag – Multi-flag feature flag hook.
 *
 * Reads localStorage immediately (never blocks render).
 * Fetches from server in background and updates localStorage for next session.
 * Changes take effect NEXT session, not during current session.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { store } from "../../store/store"
import { marketV2Api } from "../../store/api/v2/market"

export type MarketVersion = "V1" | "V2"

export interface FeatureFlags {
  market_v2: boolean
  crafting: boolean
  wiki: boolean
  [key: string]: boolean
}

export interface UseFeatureFlagReturn {
  /** Backward compat: V1 or V2 */
  marketVersion: MarketVersion
  isLoading: boolean
  error: Error | null
  /** Backward compat: set market version */
  setMarketVersion: (version: MarketVersion) => Promise<void>
  isDeveloper: boolean
  hasOverride: boolean
  /** All resolved flags */
  flags: FeatureFlags
  /** Which flags this user has overrides for */
  overriddenFlags: string[]
  /** Set a specific flag */
  setFlag: (flagName: string, enabled: boolean) => Promise<void>
}

const DEFAULT_FLAGS: FeatureFlags = { market_v2: true, crafting: true, wiki: false, nav_v2: false }
const STORAGE_KEY = "feature_flags"

function readStoredFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_FLAGS, ...JSON.parse(stored) }
  } catch {}
  // Backward compat: read old market_version key
  const oldMv = localStorage.getItem("market_version")
  if (oldMv === "V2") return { ...DEFAULT_FLAGS, market_v2: true }
  return DEFAULT_FLAGS
}

function readLocalMarketVersion(): MarketVersion {
  return readStoredFlags().market_v2 ? "V2" : "V1"
}

export function useFeatureFlag(): UseFeatureFlagReturn {
  const { data: profile } = useGetUserProfileQuery()
  const [flags, setFlags] = useState<FeatureFlags>(readStoredFlags)
  const [overriddenFlags, setOverriddenFlags] = useState<string[]>([])
  const [hasOverride, setHasOverride] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const isFrontendDev = useMemo(
    () => import.meta.env.DEV || import.meta.env.MODE === "development",
    [],
  )
  const isDeveloper = isFrontendDev || profile?.role === "admin"

  // Background sync: fetch from server, update localStorage for NEXT session
  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      try {
        const result = await store.dispatch(
          marketV2Api.endpoints.getFeatureFlag.initiate(),
        )
        if (cancelled) return

        const data = result.data
        if (data?.flags) {
          // Merge server flags with defaults, but preserve local overrides
          const overrides = data.overridden_flags || []
          const currentLocal = readStoredFlags()
          const serverFlags = { ...DEFAULT_FLAGS, ...data.flags }
          // Keep locally-overridden values (user explicitly set them)
          for (const key of overrides) {
            if (key in currentLocal) serverFlags[key] = currentLocal[key]
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverFlags))
          // Also write backward-compat key
          localStorage.setItem("market_version", serverFlags.market_v2 ? "V2" : "V1")
          // Update state only if changed (avoids re-renders)
          setFlags((prev) => {
            const changed = Object.keys(serverFlags).some((k) => prev[k] !== serverFlags[k])
            return changed ? serverFlags : prev
          })
        } else if (data?.market_version) {
          // Backward compat: server doesn't have flags yet
          const mv = data.market_version === "V2"
          localStorage.setItem("market_version", data.market_version)
          setFlags((prev) => prev.market_v2 !== mv ? { ...prev, market_v2: mv } : prev)
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
  }, [profile?.username])

  const marketVersion: MarketVersion = flags.market_v2 ? "V2" : "V1"

  const setMarketVersion = useCallback(
    async (version: MarketVersion) => {
      try {
        setError(null)
        await store.dispatch(
          marketV2Api.endpoints.setFeatureFlag.initiate({
            setFeatureFlagRequest: { market_version: version },
          }),
        )
        const newFlags = { ...flags, market_v2: version === "V2" }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags))
        localStorage.setItem("market_version", version)
        setFlags(newFlags)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to set feature flag"))
      }
    },
    [flags],
  )

  const setFlag = useCallback(
    async (flagName: string, enabled: boolean) => {
      try {
        setError(null)
        await store.dispatch(
          marketV2Api.endpoints.setFeatureFlag.initiate({
            setFeatureFlagRequest: { flag_name: flagName, enabled },
          }),
        )
        const newFlags = { ...flags, [flagName]: enabled }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags))
        // Also update backward compat key
        if (flagName === "market_v2") {
          localStorage.setItem("market_version", enabled ? "V2" : "V1")
        }
        setFlags(newFlags)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to set flag"))
      }
    },
    [flags],
  )

  return {
    marketVersion,
    isLoading: false,
    error,
    setMarketVersion,
    isDeveloper,
    hasOverride,
    flags,
    overriddenFlags,
    setFlag,
  }
}
