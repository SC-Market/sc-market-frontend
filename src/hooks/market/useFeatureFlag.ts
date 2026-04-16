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
 * - Loads version from GET /api/v2/debug/feature-flag when authenticated; otherwise localStorage.
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
          const mv = data.market_version
          if (mv === "V1" || mv === "V2") {
            setMarketVersionState(mv)
            localStorage.setItem("market_version", mv)
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
  }, [profile?.username])

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
          window.location.reload()
          return
        }

        if (isFrontendDev) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          window.location.reload()
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
