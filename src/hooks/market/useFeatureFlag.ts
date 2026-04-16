/**
 * useFeatureFlag – Market version feature flag hook
 *
 * NOTE: This hook intentionally uses raw `fetch()` instead of RTK Query because:
 *   1. The /api/v2/debug/feature-flag endpoint is NOT in the OpenAPI spec, so the
 *      generated API client (src/store/api/v2/market.ts) does not include it.
 *   2. This hook is consumed by MarketRouter to decide which UI tree to render,
 *      so it must resolve *before* RTK Query and the Redux store are fully initialized.
 *
 * If the feature-flag endpoint is added to the OpenAPI spec in the future, migrate
 * this to a generated RTK Query hook.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { BACKEND_URL } from "../../util/constants"

/**
 * Market version type
 */
export type MarketVersion = "V1" | "V2"

/**
 * Feature flag hook return type
 */
export interface UseFeatureFlagReturn {
  /** Current market version */
  marketVersion: MarketVersion
  /** Whether the feature flag is loading */
  isLoading: boolean
  /** Error if feature flag fetch failed */
  error: Error | null
  /** Function to set the market version */
  setMarketVersion: (version: MarketVersion) => Promise<void>
  /**
   * Whether to show debug overrides (floating panel, etc.):
   * Vite dev server, or site admin (matches PreferencesControls / backend intent).
   */
  isDeveloper: boolean
}

const FEATURE_FLAG_URL = `${BACKEND_URL}/api/v2/debug/feature-flag`

function readLocalMarketVersion(): MarketVersion | null {
  const stored = localStorage.getItem("market_version")
  if (stored === "V1" || stored === "V2") {
    return stored
  }
  return null
}

/**
 * Custom hook to manage market version feature flag
 *
 * - Loads version from GET when authenticated; in **dev**, a `localStorage` choice wins over
 *   the server so V2/local overrides are not reset on reload. In production, the server wins.
 * - `isDeveloper` is true when running under Vite dev or the logged-in user is an admin.
 * - POST updates the server when allowed; in dev, falls back to localStorage if POST fails (e.g. non-admin).
 */
export function useFeatureFlag(): UseFeatureFlagReturn {
  const { data: profile } = useGetUserProfileQuery()
  const [marketVersion, setMarketVersionState] = useState<MarketVersion>("V1")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isFrontendDev = useMemo(
    () => import.meta.env.DEV || import.meta.env.MODE === "development",
    [],
  )

  const isDeveloper = isFrontendDev || profile?.role === "admin"

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(FEATURE_FLAG_URL, { credentials: "include" })
        if (!cancelled && res.ok) {
          const data = (await res.json()) as {
            market_version?: string
          }
          const serverMv =
            data.market_version === "V1" || data.market_version === "V2"
              ? data.market_version
              : null
          const localMv = readLocalMarketVersion()

          let resolved: MarketVersion | null = null
          if (isFrontendDev && localMv) {
            resolved = localMv
          } else if (serverMv) {
            resolved = serverMv
            localStorage.setItem("market_version", serverMv)
          } else if (localMv) {
            resolved = localMv
          }

          if (resolved) {
            setMarketVersionState(resolved)
            return
          }
        }

        if (!cancelled) {
          const local = readLocalMarketVersion()
          if (local) {
            setMarketVersionState(local)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch feature flag"),
          )
          const local = readLocalMarketVersion()
          if (local) {
            setMarketVersionState(local)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [profile?.username, isFrontendDev])

  const setMarketVersion = useCallback(
    async (version: MarketVersion) => {
      try {
        setError(null)

        const res = await fetch(FEATURE_FLAG_URL, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market_version: version }),
        })

        if (res.ok) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          return
        }

        if (isFrontendDev) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          return
        }

        const message = await res.text().catch(() => res.statusText)
        throw new Error(message || `Failed to set market version (${res.status})`)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to set feature flag"),
        )
        throw err
      }
    },
    [isFrontendDev],
  )

  return {
    marketVersion,
    isLoading,
    error,
    setMarketVersion,
    isDeveloper,
  }
}
