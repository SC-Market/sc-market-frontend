import { useState, createContext, useContext, ReactNode } from "react"
import { useOptionalShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { canEditShopStockLots } from "../../shops/domain/shopPermissions"

/**
 * This page's shop: lots, listings and permissions are scoped to it (without
 * a shop the lot list covered every shop you own). `canEditLots`: may add,
 * edit and delete the shop's lots, which Manage Stock allows as well as
 * Manage Market.
 */
export function useStockShop() {
  const shop = useOptionalShopRouteContext()?.shop
  return {
    shopId: shop?.shop_id,
    canEditLots: !!shop && canEditShopStockLots(shop),
  }
}

/* ── Local filter context (mirrors V1 StockSearchContext) ── */

export interface StockFilterState {
  search: string
  listingId: string | null
  locationId: string | null
}

export interface StockFilterCtx {
  filters: StockFilterState
  setSearch: (v: string) => void
  setListingId: (v: string | null) => void
  setLocationId: (v: string | null) => void
}

export const StockFilterContext = createContext<StockFilterCtx | undefined>(
  undefined,
)

export function StockFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<StockFilterState>({
    search: "",
    listingId: null,
    locationId: null,
  })
  return (
    <StockFilterContext.Provider
      value={{
        filters,
        setSearch: (v) => setFilters((f) => ({ ...f, search: v })),
        setListingId: (v) => setFilters((f) => ({ ...f, listingId: v })),
        setLocationId: (v) => setFilters((f) => ({ ...f, locationId: v })),
      }}
    >
      {children}
    </StockFilterContext.Provider>
  )
}

export function useStockFilter() {
  const ctx = useContext(StockFilterContext)
  if (!ctx)
    throw new Error("useStockFilter must be used within StockFilterProvider")
  return ctx
}

/** Rows matching the lot search: item, variant, listing, location or notes. */
export function matchesLotSearch(
  row: {
    game_item_name: string | null
    variant_display_name: string
    listing_title: string
    location_name: string | null
    notes: string
  },
  search: string,
): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return [
    row.game_item_name,
    row.variant_display_name,
    row.listing_title,
    row.location_name,
    row.notes,
  ].some((v) => v?.toLowerCase().includes(q))
}
