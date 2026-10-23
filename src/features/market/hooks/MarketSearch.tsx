import React, { useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import type { MarketSearchState, SaleTypeSelect } from "../domain/types"
import { paramsToSearchState, searchStateToParams } from "../domain/formatters"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"

export type { MarketSearchState, SaleTypeSelect } from "../domain/types"

export const MarketSearchContext = React.createContext<
  | [MarketSearchState, React.Dispatch<React.SetStateAction<MarketSearchState>>]
  | null
>(null)

export const useMarketSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const isMobile = useIsMobile()

  const defaultPageSize = isMobile ? 12 : 48

  const searchState = useMemo(
    () => paramsToSearchState(searchParams, defaultPageSize),
    [searchParams, defaultPageSize],
  )

  const setSearchState = useCallback(
    (
      next:
        | MarketSearchState
        | ((prev: MarketSearchState) => MarketSearchState),
    ) => {
      const state = typeof next === "function" ? next(searchState) : next
      setSearchParams(searchStateToParams(state, defaultPageSize))
    },
    [searchState, setSearchParams, defaultPageSize],
  )
  return [searchState, setSearchState] as const
}
