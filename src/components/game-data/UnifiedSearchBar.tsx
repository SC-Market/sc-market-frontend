/**
 * UnifiedSearchBar — rich multi-select autocomplete for missions/blueprints.
 * Combines free text search with structured filter suggestions.
 */

import { useState, useMemo, useCallback } from "react"
import { Autocomplete, Chip, TextField, Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { getMissionTypeLabel } from "../../util/missionDisplay"
import { formatShipCareer, formatShipRole } from "../../util/shipDisplay"
import { translateCategoryLabel } from "../../util/categoryDisplay"
import type { SearchToken } from "./searchTokenParams"
import {
  MISSION_TAGS,
  SYSTEMS,
  MISSION_CATEGORIES,
  MISSION_GIVERS,
  MISSION_FACTIONS,
  BP_CATEGORIES,
  BP_MATERIALS,
  BP_RARITIES,
  BP_TAGS,
  MINING_RARITIES,
  MINING_METHODS,
  LOCATION_TYPES,
  LOCATION_TAGS,
  SHIP_CAREERS,
  SHIP_SIZES,
  SHIP_MANUFACTURERS,
  WIKI_ITEM_TYPES,
  MARKET_CATEGORIES,
  MARKET_TAGS,
} from "./searchTokenOptions"
export {
  missionTokensToParams,
  missionParamsToTokens,
  blueprintTokensToParams,
  blueprintParamsToTokens,
  marketTokensToParams,
  marketParamsToTokens,
  miningTokensToParams,
  miningParamsToTokens,
  locationTokensToParams,
  locationParamsToTokens,
  wikiItemsTokensToParams,
  wikiItemsParamsToTokens,
  shipsTokensToParams,
  shipsParamsToTokens,
} from "./searchTokenParams"
export type { SearchToken } from "./searchTokenParams"

const TYPE_COLORS: Record<
  string,
  "default" | "primary" | "error" | "info" | "success" | "warning"
> = {
  system: "info",
  category: "primary",
  giver: "default",
  faction: "success",
  tag: "warning",
  event: "error",
  query: "default",
  material: "info",
  rarity: "default",
  manufacturer: "default",
}

interface UnifiedSearchBarProps {
  tokens: SearchToken[]
  onChange: (tokens: SearchToken[]) => void
  extraOptions?: SearchToken[]
  placeholder?: string
  mode?:
    | "missions"
    | "blueprints"
    | "market"
    | "mining"
    | "locations"
    | "wiki-items"
    | "ships"
}

/**
 * Manufacturer suggestions from GET /game-data/wiki/manufacturers: the
 * display name as the label, the code (what the blueprint and wiki item
 * `manufacturer` filters take) as the value. A code with no display name is
 * labelled with the code.
 */
export function manufacturerSearchTokens(
  manufacturers:
    | readonly { manufacturer: string; display_name?: string | null }[]
    | undefined,
): SearchToken[] {
  return (manufacturers ?? []).map((m) => ({
    type: "manufacturer" as const,
    label: m.display_name ?? m.manufacturer,
    value: m.manufacturer,
  }))
}

// UI-defined token labels (tags, methods, sizes) are translated at render
// time; game-data values (systems, categories, materials, ...) are shown as-is.
const TOKEN_LABEL_KEYS: Record<string, string> = {
  "tag:ILLEGAL": "wikiUi.search.tags.illegal",
  "tag:shareable": "wikiUi.search.tags.shareable",
  "tag:unique": "wikiUi.search.tags.unique",
  "tag:chain": "wikiUi.search.tags.chainStarter",
  "tag:blueprints": "wikiUi.search.tags.hasBlueprints",
  "tag:default": "wikiUi.search.tags.default",
  "tag:mission_reward": "wikiUi.search.tags.missionReward",
  "tag:has_missions": "wikiUi.search.tags.hasMissionSource",
  "tag:owned": "wikiUi.search.tags.owned",
  "tag:refinery": "wikiUi.search.tags.hasRefinery",
  "tag:has_photos": "wikiUi.search.tags.hasPhotos",
  "tag:in_stock": "wikiUi.search.tags.inStock",
  "tag:bulk_discount": "wikiUi.search.tags.bulkDiscount",
  "tag:1": "wikiUi.search.tags.sizeSmall",
  "tag:2": "wikiUi.search.tags.sizeMedium",
  "tag:3": "wikiUi.search.tags.sizeLarge",
  "tag:4": "wikiUi.search.tags.sizeCapital",
  "category:ship": "wikiUi.search.methods.ship",
  "category:ground": "wikiUi.search.methods.ground",
  "category:fps": "wikiUi.search.methods.fps",
  "category:surface": "wikiUi.search.locationTypes.surface",
  "category:asteroidfield": "wikiUi.search.locationTypes.asteroidField",
}

const RARITY_KEYS = new Set(["common", "uncommon", "rare", "epic", "legendary"])

const TOKEN_TYPE_KEYS: Record<SearchToken["type"], string> = {
  query: "wikiUi.search.types.query",
  system: "wikiUi.search.types.system",
  category: "wikiUi.search.types.category",
  giver: "wikiUi.search.types.giver",
  faction: "wikiUi.search.types.faction",
  tag: "wikiUi.search.types.tag",
  event: "wikiUi.search.types.event",
  material: "wikiUi.search.types.material",
  rarity: "wikiUi.search.types.rarity",
  manufacturer: "wikiUi.search.types.manufacturer",
}

export function UnifiedSearchBar({
  tokens,
  onChange,
  extraOptions = [],
  placeholder,
  mode = "missions",
}: UnifiedSearchBarProps) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState("")

  // Category tokens are mining methods / location types in mining/location
  // modes, mission types for missions, careers for ships and item types
  // elsewhere. Game-data values (systems, givers, materials, ...) are shown as-is.
  const baseOptions = useMemo(() => {
    if (mode === "blueprints")
      return [...BP_CATEGORIES, ...BP_MATERIALS, ...BP_RARITIES, ...BP_TAGS]
    if (mode === "market") return [...MARKET_CATEGORIES, ...MARKET_TAGS]
    if (mode === "mining")
      return [...SYSTEMS, ...MINING_RARITIES, ...MINING_METHODS]
    if (mode === "locations")
      return [...SYSTEMS, ...LOCATION_TYPES, ...LOCATION_TAGS]
    if (mode === "wiki-items") return WIKI_ITEM_TYPES
    if (mode === "ships")
      return [...SHIP_CAREERS, ...SHIP_MANUFACTURERS, ...SHIP_SIZES]
    return [
      ...SYSTEMS,
      ...MISSION_CATEGORIES,
      ...MISSION_TAGS,
      ...MISSION_GIVERS,
      ...MISSION_FACTIONS,
    ]
  }, [mode])

  // Labels of the suggestions, so a token rebuilt from the URL (label = the
  // raw value, e.g. a manufacturer code) shows the suggestion's label.
  const optionLabels = useMemo(() => {
    const labels = new Map<string, string>()
    for (const o of [...baseOptions, ...extraOptions])
      labels.set(`${o.type}:${o.value}`, o.label)
    return labels
  }, [baseOptions, extraOptions])

  const tokenLabel = useCallback(
    (o: SearchToken): string => {
      if (o.type === "query") return o.label
      if (o.type === "category" && mode !== "mining" && mode !== "locations") {
        if (mode === "missions") return getMissionTypeLabel(o.value, t)
        if (mode === "ships") return formatShipCareer(o.value, t)
        return translateCategoryLabel(o.value, t)
      }
      if (o.type === "rarity" && RARITY_KEYS.has(o.value.toLowerCase())) {
        return t(`gameTaxonomyUi.rarities.${o.value.toLowerCase()}`)
      }
      // Ships mode carries the role in a "faction" token and the size in a "tag".
      if (mode === "ships" && o.type === "faction")
        return formatShipRole(o.value, t)
      const key = TOKEN_LABEL_KEYS[`${o.type}:${o.value}`]
      if (key) return t(key)
      if (mode === "ships" && o.type === "tag")
        return t("gameTaxonomyUi.sizeN", { size: o.value })
      if (o.type === "manufacturer")
        return optionLabels.get(`${o.type}:${o.value}`) ?? o.label
      return o.label
    },
    [t, mode, optionLabels],
  )

  const allOptions = useMemo(() => {
    const opts = [...baseOptions, ...extraOptions]
    const selected = new Set(tokens.map((t) => `${t.type}:${t.value}`))
    return opts.filter((o) => !selected.has(`${o.type}:${o.value}`))
  }, [tokens, extraOptions, baseOptions])

  const filtered = useMemo(() => {
    if (!inputValue.trim()) {
      // Show 2 examples of each type when empty
      const byType = new Map<string, SearchToken[]>()
      for (const o of allOptions) {
        if (!byType.has(o.type)) byType.set(o.type, [])
        if (byType.get(o.type)!.length < 2) byType.get(o.type)!.push(o)
      }
      return Array.from(byType.values()).flat()
    }
    const lower = inputValue.toLowerCase()
    return allOptions
      .filter(
        (o) =>
          o.label.toLowerCase().includes(lower) ||
          tokenLabel(o).toLowerCase().includes(lower) ||
          o.value.toLowerCase().includes(lower) ||
          o.type.toLowerCase().includes(lower),
      )
      .slice(0, 15)
  }, [inputValue, allOptions, tokenLabel])

  return (
    <Autocomplete
      multiple
      freeSolo
      size="small"
      options={filtered}
      value={tokens}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => {
        if (reason !== "reset") setInputValue(val)
      }}
      onChange={(_, newValue) => {
        onChange(
          newValue.map((v) =>
            typeof v === "string" ? { type: "query", label: v, value: v } : v,
          ),
        )
        setInputValue("")
      }}
      getOptionLabel={(o) => (typeof o === "string" ? o : tokenLabel(o))}
      isOptionEqualToValue={(a, b) => a.type === b.type && a.value === b.value}
      renderOption={(props, option) => (
        <li {...props} key={`${option.type}:${option.value}`}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={t(TOKEN_TYPE_KEYS[option.type])}
              size="small"
              color={TYPE_COLORS[option.type] || "default"}
              sx={{
                height: 20,
                fontSize: "0.6rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                minWidth: 60,
              }}
            />
            <Typography variant="body2">{tokenLabel(option)}</Typography>
          </Box>
        </li>
      )}
      renderTags={(value, getTagProps) =>
        value.map((token, index) => (
          <Chip
            {...getTagProps({ index })}
            key={`${token.type}:${token.value}`}
            label={tokenLabel(token)}
            size="small"
            color={TYPE_COLORS[token.type] || "default"}
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: "bold" }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={
            tokens.length ? "" : placeholder || t("wikiUi.search.placeholder")
          }
          // A stable name: the placeholder disappears once tokens are added.
          inputProps={{
            ...params.inputProps,
            "aria-label": placeholder || t("wikiUi.search.ariaLabel"),
          }}
        />
      )}
      sx={{ flex: 1, minWidth: 200 }}
    />
  )
}
