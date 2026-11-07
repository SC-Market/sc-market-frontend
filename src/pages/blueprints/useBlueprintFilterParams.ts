import { useMemo } from "react"
import { useGetManufacturersQuery } from "../../store/api/v2/market"
import {
  blueprintParamsToTokens,
  blueprintTokensToParams,
  manufacturerSearchTokens,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import type { SetURLSearchParams } from "react-router-dom"

/** Blueprint browser filters, read from and written to the URL search params, plus the search-bar tokens derived from them. */
export function useBlueprintFilterParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
) {
  const searchText = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const subcategory = searchParams.get("subcategory") || ""
  const rarity = searchParams.get("rarity") || ""
  const tier: number | "" = searchParams.get("tier")
    ? Number(searchParams.get("tier"))
    : ""
  const craftingStation = searchParams.get("station") || ""
  const ownedOnly = searchParams.get("owned") === "true"
  const hasMissionSource = searchParams.get("missions") === "true"

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params, { replace: true })
  }

  const setSearchText = (v: string) => updateParam("q", v)
  const setCategory = (v: string) => {
    updateParam("category", v)
    updateParam("subcategory", "")
  }
  const setSubcategory = (v: string) => updateParam("subcategory", v)
  const setTier = (v: number | "") =>
    updateParam("tier", v === "" ? "" : String(v))
  const setOwnedOnly = (v: boolean) => updateParam("owned", v ? "true" : "")
  const setHasMissionSource = (v: boolean) =>
    updateParam("missions", v ? "true" : "")
  const source = searchParams.get("source") || ""
  const setSource = (v: string) => updateParam("source", v)
  const hideUnsourceable = searchParams.get("hide_unsourceable") !== "false" // default true
  const setHideUnsourceable = (v: boolean) =>
    updateParam("hide_unsourceable", v ? "" : "false")
  const manufacturer = searchParams.get("mfr") || ""
  const setManufacturer = (v: string) => updateParam("mfr", v)
  // The filter takes the code ("behr"); users pick and see the name ("Behring").
  const { data: manufacturers } = useGetManufacturersQuery()
  const manufacturerOptions = useMemo(() => {
    const options = manufacturerSearchTokens(manufacturers).sort((a, b) =>
      a.label.localeCompare(b.label),
    )
    // A code from the URL that the list doesn't name stays selectable.
    if (manufacturer && !options.some((o) => o.value === manufacturer))
      options.unshift({
        type: "manufacturer",
        label: manufacturer,
        value: manufacturer,
      })
    return options
  }, [manufacturers, manufacturer])
  const ingredientName = searchParams.get("ingredient") || ""
  const setIngredientName = (v: string) => updateParam("ingredient", v)

  // Unified search bar tokens
  const searchTokens = useMemo(
    () => blueprintParamsToTokens(searchParams),
    [searchParams],
  )
  const handleTokensChange = (tokens: SearchToken[]) => {
    const tokenParams = blueprintTokensToParams(tokens)
    const params = new URLSearchParams(searchParams)
    for (const key of [
      "q",
      "category",
      "subcategory",
      "rarity",
      "ingredient",
      "mfr",
      "source",
      "missions",
      "owned",
    ]) {
      params.delete(key)
    }
    for (const [k, v] of Object.entries(tokenParams)) {
      params.set(k, v)
    }
    setSearchParams(params, { replace: true })
  }

  return {
    searchText,
    category,
    subcategory,
    rarity,
    tier,
    craftingStation,
    ownedOnly,
    hasMissionSource,
    setSearchText,
    setCategory,
    setSubcategory,
    setTier,
    setOwnedOnly,
    setHasMissionSource,
    source,
    setSource,
    hideUnsourceable,
    setHideUnsourceable,
    manufacturer,
    setManufacturer,
    manufacturerOptions,
    ingredientName,
    setIngredientName,
    searchTokens,
    handleTokensChange,
  }
}
