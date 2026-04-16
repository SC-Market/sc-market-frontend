import { useState, useEffect, useCallback } from "react"

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
  /** Whether the current user has developer privileges */
  isDeveloper: boolean
}

/**
 * Custom hook to manage market version feature flag
 * 
 * This hook fetches the current market version from the backend
 * and provides a function to update it. It also checks if the user
 * has developer privileges to show the debug panel.
 * 
 * @returns Feature flag state and controls
 * 
 * @example
 * ```tsx
 * function MarketRouter() {
 *   const { marketVersion, setMarketVersion, isDeveloper } = useFeatureFlag();
 *   
 *   if (marketVersion === 'V2') {
 *     return <MarketV2 />;
 *   }
 *   
 *   return <MarketV1 />;
 * }
 * ```
 */
export function useFeatureFlag(): UseFeatureFlagReturn {
  const [marketVersion, setMarketVersionState] = useState<MarketVersion>("V1")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDeveloper, setIsDeveloper] = useState(false)

  // Fetch current feature flag on mount
  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: Replace with actual API call when debug endpoints are available
        // const response = await fetch('/api/v2/debug/feature-flag', {
        //   credentials: 'include'
        // });
        // const data = await response.json();
        // setMarketVersionState(data.marketVersion);
        // setIsDeveloper(data.isDeveloper);

        // For now, default to V1 and check localStorage
        const stored = localStorage.getItem("market_version")
        if (stored === "V1" || stored === "V2") {
          setMarketVersionState(stored)
        }

        // TODO: Check if user is developer from user profile
        // For now, assume non-developer
        setIsDeveloper(false)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch feature flag"),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeatureFlag()
  }, [])

  // Function to update market version
  const setMarketVersion = useCallback(async (version: MarketVersion) => {
    try {
      setError(null)

      // TODO: Replace with actual API call when debug endpoints are available
      // await fetch('/api/v2/debug/feature-flag', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({ marketVersion: version })
      // });

      // For now, store in localStorage
      localStorage.setItem("market_version", version)
      setMarketVersionState(version)

      // Reload page to apply new version
      window.location.reload()
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to set feature flag"),
      )
      throw err
    }
  }, [])

  return {
    marketVersion,
    isLoading,
    error,
    setMarketVersion,
    isDeveloper,
  }
}
