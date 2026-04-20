/**
 * useFeatureFlag – Market version feature flag hook
 *
 * Reads localStorage immediately (never blocks render).
 * Fetches from server in background and updates localStorage for next session.
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useGetUserProfileQuery } from "../../store/profile"
import { store } from "../../store/store"
import { marketV2Api } from "../../store/api/v2/market"

export type MarketVersion = "V1" | "V2"

export interface UseFeatureFlagReturn {
  marketVersion: MarketVersion
  isLoading: boolean
  error: Error | null
  setMarketVersion: (version: MarketVersion) => Promise<void>
  isDeveloper: boolean
}

function readLocalMarketVersion(): MarketVersion {
  const stored = localStorage.getItem("market_version")
  if (stored === "V2") return "V2"
  return "V1"
}

export function useFeatureFlag(): UseFeatureFlagReturn {
  const { data: profile } = useGetUserProfileQuery()
  // Read localStorage synchronously — never blocks render
  const [marketVersion, setMarketVersionState] = useState<MarketVersion>(readLocalMarketVersion)
  const [error, setError] = useState<Error | null>(null)

  const isFrontendDev = useMemo(
    () => import.meta.env.DEV || import.meta.env.MODE === "development",
    [],
  )

  const isDeveloper = isFrontendDev || profile?.role === "admin"

  // Background fetch: update localStorage for next session
  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      try {
        const result = await store.dispatch(
          marketV2Api.endpoints.getFeatureFlag.initiate(),
        )

        if (cancelled) return

        const data = (result.data as any)?.data || result.data
        const serverMv = data?.market_version
        if (serverMv === "V1" || serverMv === "V2") {
          localStorage.setItem("market_version", serverMv)
          // Only update state if it changed (avoids unnecessary re-renders)
          setMarketVersionState((prev) => prev !== serverMv ? serverMv : prev)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch feature flag"))
        }
      }
    }

    void sync()
    return () => { cancelled = true }
  }, [profile?.username])

  const setMarketVersion = useCallback(
    async (version: MarketVersion) => {
      try {
        setError(null)

        const result = await store.dispatch(
          marketV2Api.endpoints.setFeatureFlag.initiate({
            setFeatureFlagRequest: { market_version: version },
          }),
        )

        if ("data" in result || isFrontendDev) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          return
        }

        throw new Error("Failed to set market version")
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to set feature flag"))
        throw err
      }
    },
    [isFrontendDev],
  )

  return { marketVersion, isLoading: false, error, setMarketVersion, isDeveloper }
}
