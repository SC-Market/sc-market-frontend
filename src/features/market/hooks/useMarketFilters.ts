/**
 * State orchestration for the market filter form (sidebar).
 * Holds a draft of search state; applyFilters() syncs draft to URL via useMarketSearch.
 * Components stay UI-only; this hook owns loading/sync/apply.
 */

import { useState, useCallback, useEffect } from "react"
import type { MarketSearchState, SaleTypeSelect } from "../domain/types"
import { useMarketSearch } from "./MarketSearch"

export interface AttributeDefinition {
  attribute_name: string
  display_name: string
  attribute_type: 'select' | 'multiselect' | 'range' | 'text'
  allowed_values: string[] | null
  applicable_item_types: string[]
  display_order: number
}

export function useMarketFilters() {
  const [searchState, setSearchState] = useMarketSearch()

  const [draft, setDraft] = useState<MarketSearchState>(searchState)
  const [availableAttributes, setAvailableAttributes] = useState<AttributeDefinition[]>([])

  useEffect(() => {
    setDraft(searchState)
  }, [searchState])

  // Fetch available attributes when item_type changes
  useEffect(() => {
    const fetchAvailableAttributes = async () => {
      if (!draft.item_type || draft.item_type === 'any') {
        setAvailableAttributes([])
        return
      }

      try {
        // TODO: Replace with actual API call once endpoint is available
        // const response = await fetch(`/api/attributes/definitions?item_type=${draft.item_type}`)
        // const data = await response.json()
        // setAvailableAttributes(data)
        
        // Placeholder: empty array until API is implemented
        setAvailableAttributes([])
      } catch (error) {
        console.error('Failed to fetch attribute definitions:', error)
        setAvailableAttributes([])
      }
    }

    fetchAvailableAttributes()
  }, [draft.item_type])

  const updateDraft = useCallback((partial: Partial<MarketSearchState>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }, [])

  const applyFilters = useCallback(() => {
    setSearchState(draft)
  }, [draft, setSearchState])

  const setAttributes = useCallback((attributes: Record<string, string[]>) => {
    updateDraft({ attributes })
  }, [updateDraft])

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
    attributes: draft.attributes ?? {},
    setAttributes,
    availableAttributes,
  }
}
