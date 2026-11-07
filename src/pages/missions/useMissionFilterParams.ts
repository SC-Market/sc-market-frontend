import { useMemo } from "react"
import type { SetURLSearchParams } from "react-router-dom"
import {
  missionParamsToTokens,
  missionTokensToParams,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"

/**
 * Mission search filters, read from and written to the URL search params,
 * plus the search-bar tokens derived from them.
 */
export function useMissionFilterParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
) {
  const searchText = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const careerType = searchParams.get("career") || ""
  const starSystem = searchParams.get("system") || ""
  const faction = searchParams.get("faction") || ""
  const missionGiver = searchParams.get("giver") || ""
  const legalStatus = (searchParams.get("legal") || "") as
    | ""
    | "LEGAL"
    | "ILLEGAL"
  const diffMin = parseInt(searchParams.get("diff_min") || "1") || 1
  const diffMax = parseInt(searchParams.get("diff_max") || "5") || 5
  const difficultyRange = [diffMin, diffMax]
  const isShareable =
    searchParams.get("shareable") === "true"
      ? true
      : searchParams.get("shareable") === "false"
        ? false
        : undefined
  const hasBlueprints =
    searchParams.get("blueprints") === "true"
      ? true
      : searchParams.get("blueprints") === "false"
        ? false
        : undefined
  const isChainStarter =
    searchParams.get("chain") === "true"
      ? true
      : searchParams.get("chain") === "false"
        ? false
        : undefined
  const creditRewardMin: number | "" = searchParams.get("min_reward")
    ? Number(searchParams.get("min_reward"))
    : ""

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    setSearchParams(params, { replace: true })
  }

  const setSearchText = (v: string) => updateParam("q", v)
  const setCategory = (v: string) => updateParam("category", v)
  const setCareerType = (v: string) => updateParam("career", v)
  const setStarSystem = (v: string) => updateParam("system", v)
  const setFaction = (v: string) => updateParam("faction", v)
  const setMissionGiver = (v: string) => updateParam("giver", v)
  const setLegalStatus = (v: "" | "LEGAL" | "ILLEGAL") =>
    updateParam("legal", v)
  const setDifficultyRange = (v: number[]) => {
    updateParam("diff_min", v[0] === 1 ? "" : String(v[0]))
    updateParam("diff_max", v[1] === 5 ? "" : String(v[1]))
  }
  const setIsShareable = (v: boolean | undefined) =>
    updateParam("shareable", v === undefined ? "" : String(v))
  const setHasBlueprints = (v: boolean | undefined) =>
    updateParam("blueprints", v === undefined ? "" : String(v))
  const setIsChainStarter = (v: boolean | undefined) =>
    updateParam("chain", v === undefined ? "" : String(v))
  const setCreditRewardMin = (v: number | "") =>
    updateParam("min_reward", v === "" ? "" : String(v))
  const eventCode = searchParams.get("event") || ""
  const setEventCode = (v: string) => updateParam("event", v)
  const showEventMissions = searchParams.get("show_events") === "true"
  const setShowEventMissions = (v: boolean) =>
    updateParam("show_events", v ? "true" : "")

  // Unified search bar tokens — derived from URL params
  const searchTokens = useMemo(
    () => missionParamsToTokens(searchParams),
    [searchParams],
  )
  const handleTokensChange = (tokens: SearchToken[]) => {
    const tokenParams = missionTokensToParams(tokens)
    // Merge: start with current params, remove token-managed keys, add new token values
    const params = new URLSearchParams(searchParams)
    for (const key of [
      "q",
      "category",
      "system",
      "giver",
      "faction",
      "legal",
      "shareable",
      "unique",
      "chain",
      "blueprints",
      "event",
      "show_events",
    ]) {
      params.delete(key)
    }
    for (const [k, v] of Object.entries(tokenParams)) {
      params.set(k, v)
    }
    params.delete("page")
    setSearchParams(params, { replace: true })
  }

  return {
    searchText,
    category,
    careerType,
    starSystem,
    faction,
    missionGiver,
    legalStatus,
    difficultyRange,
    isShareable,
    hasBlueprints,
    isChainStarter,
    creditRewardMin,
    setSearchText,
    setCategory,
    setCareerType,
    setStarSystem,
    setFaction,
    setMissionGiver,
    setLegalStatus,
    setDifficultyRange,
    setIsShareable,
    setHasBlueprints,
    setIsChainStarter,
    setCreditRewardMin,
    eventCode,
    setEventCode,
    showEventMissions,
    setShowEventMissions,
    searchTokens,
    handleTokensChange,
  }
}
