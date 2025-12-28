import React, { useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { SaleType } from "../../store/market.ts"

export type SaleTypeSelect = SaleType | "any"

export interface MarketSearchState {
  sale_type?: SaleTypeSelect | undefined
  item_type?: string | undefined
  minCost?: number
  maxCost?: number | null
  quantityAvailable?: number
  query: string
  sort?: string | null | undefined
  statuses?: string
  index?: number
  page_size?: number
  listing_type?: string
  language_codes?: string[]
}

export const MarketSearchContext = React.createContext<
  | [MarketSearchState, React.Dispatch<React.SetStateAction<MarketSearchState>>]
  | null
>(null)

export const useMarketSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Memoize the search state to prevent unnecessary re-renders
  const searchState = useMemo(
    () =>
      ({
        sort: searchParams.get("sort") || "activity",
        sale_type: (searchParams.get("kind") as SaleType) || undefined,
        item_type: searchParams.get("type") || undefined,
        quantityAvailable:
          searchParams.get("quantityAvailable") !== null
            ? +searchParams.get("quantityAvailable")!
            : 1,
        minCost: +searchParams.get("minCost")! || 0,
        maxCost: +searchParams.get("maxCost")! || undefined,
        query: searchParams.get("query") || "",
        statuses: searchParams.get("statuses") || "active",
        index: +searchParams.get("index")! ? 0 : undefined,
        page_size: searchParams.get("page_size")! ? 48 : undefined,
        language_codes: searchParams.get("language_codes")
          ? searchParams.get("language_codes")!.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      }) as MarketSearchState,
    [searchParams],
  )

  // Memoize the setter function to prevent unnecessary re-renders
  const setSearchState = useCallback(
    (searchState: MarketSearchState) => {
      const obj = {
        query: searchState.query || undefined,
        kind:
          searchState.sale_type === "any" ? undefined : searchState.sale_type,
        type:
          searchState.item_type === "any" ? undefined : searchState.item_type,
        quantityAvailable:
          searchState.quantityAvailable !== undefined &&
          searchState.quantityAvailable !== 1
            ? searchState.quantityAvailable.toString()
            : undefined!,
        minCost: searchState.minCost
          ? searchState.minCost.toString()
          : undefined,
        maxCost:
          searchState.maxCost != null
            ? searchState.maxCost.toString()
            : undefined,
        sort:
          searchState.sort !== "activity"
            ? searchState.sort || undefined
            : undefined,
        statuses:
          searchState.statuses !== "active" ? searchState.statuses : undefined,
        index: searchState.index === 0 ? undefined : searchState.index,
        page_size:
          searchState.page_size === 48 ? undefined : searchState.page_size,
        language_codes:
          searchState.language_codes && searchState.language_codes.length > 0
            ? searchState.language_codes.join(",")
            : undefined,
      }

      setSearchParams(
        Object.fromEntries(
          Object.entries(obj).filter(([_, v]) => v !== undefined),
        ) as {
          [k: string]: string
        },
      )
    },
    [setSearchParams],
  )

  return [searchState, setSearchState] as const
}
