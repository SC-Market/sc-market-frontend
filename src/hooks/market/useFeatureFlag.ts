/**
 * useFeatureFlag – Market version feature flag hook
 *
 * Uses RTK Query via store.dispatch(initiate()) for network calls.
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

function readLocalMarketVersion(): MarketVersion | null {
  const stored = localStorage.getItem("market_version")
  if (stored === "V1" || stored === "V2") return stored
  return null
}

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

        const result = await store.dispatch(
          marketV2Api.endpoints.getFeatureFlag.initiate(),
        )

        if (!cancelled && result.data) {
          const data = (result.data as any).data || result.data
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
          if (local) setMarketVersionState(local)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch feature flag"),
          )
          const local = readLocalMarketVersion()
          if (local) setMarketVersionState(local)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [profile?.username, isFrontendDev])

  const setMarketVersion = useCallback(
    async (version: MarketVersion) => {
      try {
        setError(null)

        const result = await store.dispatch(
          marketV2Api.endpoints.setFeatureFlag.initiate({
            setFeatureFlagRequest: { market_version: version },
          }),
        )

        if ("data" in result) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          return
        }

        if (isFrontendDev) {
          localStorage.setItem("market_version", version)
          setMarketVersionState(version)
          return
        }

        throw new Error("Failed to set market version")
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to set feature flag"),
        )
        throw err
      }
    },
    [isFrontendDev],
  )

  return { marketVersion, isLoading, error, setMarketVersion, isDeveloper }
}
