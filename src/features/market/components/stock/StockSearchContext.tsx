/**
 * Stock Search Context
 *
 * Provides filter state for stock lots
 */

import React, { createContext, useContext, useState, ReactNode } from "react"

export interface StockSearchState {
  search: string
  locationId: string | null
  status: "all" | "available" | "allocated"
  minQuantity: string
  maxQuantity: string
}

interface StockSearchContextType {
  filters: StockSearchState
  setSearch: (value: string) => void
  setLocationId: (value: string | null) => void
  setStatus: (value: "all" | "available" | "allocated") => void
  setMinQuantity: (value: string) => void
  setMaxQuantity: (value: string) => void
}

const StockSearchContext = createContext<StockSearchContextType | undefined>(
  undefined,
)

export function StockSearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<StockSearchState>({
    search: "",
    locationId: null,
    status: "all",
    minQuantity: "",
    maxQuantity: "",
  })

  return (
    <StockSearchContext.Provider
      value={{
        filters,
        setSearch: (value) => setFilters((f) => ({ ...f, search: value })),
        setLocationId: (value) =>
          setFilters((f) => ({ ...f, locationId: value })),
        setStatus: (value) => setFilters((f) => ({ ...f, status: value })),
        setMinQuantity: (value) =>
          setFilters((f) => ({ ...f, minQuantity: value })),
        setMaxQuantity: (value) =>
          setFilters((f) => ({ ...f, maxQuantity: value })),
      }}
    >
      {children}
    </StockSearchContext.Provider>
  )
}

export function useStockSearch() {
  const context = useContext(StockSearchContext)
  if (!context) {
    throw new Error("useStockSearch must be used within StockSearchProvider")
  }
  return context
}
