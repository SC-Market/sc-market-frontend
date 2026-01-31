/**
 * State orchestration for the market filter form (sidebar).
 * Holds a draft of search state; applyFilters() syncs draft to URL via useMarketSearch.
 * Components stay UI-only; this hook owns loading/sync/apply.
 */

import { useState, useCallback, useEffect } from "react"
import type { MarketSearchState, SaleTypeSelect } from "../domain/types"
import { useMarketSearch } from "./MarketSearch"

export function useMarketFilters() {
  const [searchState, setSearchState] = useMarketSearch()

  const [draft, setDraft] = useState<MarketSearchState>(searchState)

  useEffect(() => {
    setDraft(searchState)
  }, [searchState])

  const updateDraft = useCallback((partial: Partial<MarketSearchState>) => {
    setDraft((prev: MarketSearchState) => ({ ...prev, ...partial }))
  }, [])

  const applyFilters = useCallback(() => {
    setSearchState(draft)
  }, [draft, setSearchState])

  return {
    draft,
    updateDraft,
    applyFilters,
    saleType: (draft.sale_type ?? "any") as SaleTypeSelect,
    setSaleType: (v: SaleTypeSelect) => updateDraft({ sale_type: v }),
    sort: draft.sort ?? null,
    setSort: (v: string | null) => updateDraft({ sort: v ?? undefined }),
    itemType: draft.item_type ?? null,
    setItemType: (v: string | null) =>
      updateDraft({ item_type: v === "any" ? undefined : (v ?? undefined) }),
    quantityAvailable: draft.quantityAvailable ?? 1,
    setQuantityAvailable: (v: number) => updateDraft({ quantityAvailable: v }),
    minCost: draft.minCost ?? 0,
    setMinCost: (v: number) => updateDraft({ minCost: v }),
    maxCost: draft.maxCost ?? null,
    setMaxCost: (v: number | null) => updateDraft({ maxCost: v }),
    query: draft.query ?? "",
    setQuery: (v: string) => updateDraft({ query: v }),
    statuses: draft.statuses ?? "active",
    setStatuses: (v: string) => updateDraft({ statuses: v }),
    languageCodes: draft.language_codes ?? [],
    setLanguageCodes: (v: string[]) => updateDraft({ language_codes: v }),
    componentSize: draft.component_size ?? [],
    setComponentSize: (v: number[]) => updateDraft({ component_size: v }),
    componentGrade: draft.component_grade ?? [],
    setComponentGrade: (v: string[]) => updateDraft({ component_grade: v }),
    componentClass: draft.component_class ?? [],
    setComponentClass: (v: string[]) => updateDraft({ component_class: v }),
    manufacturer: draft.manufacturer ?? [],
    setManufacturer: (v: string[]) => updateDraft({ manufacturer: v }),
    componentType: draft.component_type ?? [],
    setComponentType: (v: string[]) => updateDraft({ component_type: v }),
    armorClass: draft.armor_class ?? [],
    setArmorClass: (v: string[]) => updateDraft({ armor_class: v }),
    color: draft.color ?? [],
    setColor: (v: string[]) => updateDraft({ color: v }),
  }
}
