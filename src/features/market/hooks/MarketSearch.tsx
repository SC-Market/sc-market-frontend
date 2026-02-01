import React, { useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import type { MarketSearchState, SaleTypeSelect } from "../domain/types"
import { paramsToSearchState, searchStateToParams } from "../domain/formatters"
import { useTheme, useMediaQuery } from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export type { MarketSearchState, SaleTypeSelect } from "../domain/types"

export const MarketSearchContext = React.createContext<
  | [MarketSearchState, React.Dispatch<React.SetStateAction<MarketSearchState>>]
  | null
>(null)

export const useMarketSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

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
