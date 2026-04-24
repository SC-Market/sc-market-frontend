/**
 * UnifiedSearchBar — rich multi-select autocomplete for missions/blueprints.
 * Combines free text search with structured filter suggestions.
 */

import React, { useState, useMemo } from "react"
import { Autocomplete, Chip, TextField, Box, Typography } from "@mui/material"
import { getMissionTypeLabel } from "../../util/missionDisplay"

export interface SearchToken {
  type: "query" | "system" | "category" | "giver" | "faction" | "tag" | "event" | "material" | "rarity" | "manufacturer"
  label: string
  value: string
}

// === Mission suggestions ===
const MISSION_TAGS: SearchToken[] = [
  { type: "tag", label: "Illegal", value: "ILLEGAL" },
  { type: "tag", label: "Shareable", value: "shareable" },
  { type: "tag", label: "Unique", value: "unique" },
  { type: "tag", label: "Chain Starter", value: "chain" },
  { type: "tag", label: "Has Blueprints", value: "blueprints" },
]

const SYSTEMS: SearchToken[] = [
  { type: "system", label: "Stanton", value: "Stanton" },
  { type: "system", label: "Pyro", value: "Pyro" },
  { type: "system", label: "Nyx", value: "Nyx" },
  { type: "system", label: "Terra", value: "Terra" },
  { type: "system", label: "Magnus", value: "Magnus" },
]

const MISSION_CATEGORIES: SearchToken[] = [
  "Mercenary", "Bounty Hunter", "Delivery", "Hauling", "Investigation",
  "Mining", "Salvage", "Maintenance", "Race", "Courier",
].map(c => ({ type: "category" as const, label: c, value: c }))

const MISSION_GIVERS: SearchToken[] = [
  "Vaughn", "Adagio Holdings", "Bounty Hunters Guild", "Headhunters",
  "Crusader Security", "Hurston Security", "MicroTech Security",
  "Citizens for Prosperity", "Reclamation & Disposal Ormond",
].map(g => ({ type: "giver" as const, label: g, value: g }))

const MISSION_FACTIONS: SearchToken[] = [
  "Vaughn", "Adagio Holdings", "Bounty Hunters Guild", "Headhunters",
  "Crusader Security", "Hurston Security",
].map(f => ({ type: "faction" as const, label: f, value: f }))

// === Blueprint suggestions ===
const BP_CATEGORIES: SearchToken[] = [
  "Helmet", "Torso", "Arms", "Legs", "Backpack", "Undersuit",
  "Ranged Weapon", "Weapon Attachment", "Ship Weapon",
].map(c => ({ type: "category" as const, label: c, value: c }))

const BP_MATERIALS: SearchToken[] = [
  "Agricium", "Aluminum", "Aphorite", "Aslarite", "Copper", "Gold",
  "Hephaestanite", "Iron", "Lindinium", "Ouratite", "Quartz",
  "Taranite", "Titanium", "Torite", "Tungsten",
].map(m => ({ type: "material" as const, label: m, value: m }))

const BP_RARITIES: SearchToken[] = [
  "Common", "Uncommon", "Rare", "Epic", "Legendary",
].map(r => ({ type: "rarity" as const, label: r, value: r }))

const BP_TAGS: SearchToken[] = [
  { type: "tag", label: "Default", value: "default" },
  { type: "tag", label: "Mission Reward", value: "mission_reward" },
  { type: "tag", label: "Has Mission Source", value: "has_missions" },
  { type: "tag", label: "Owned", value: "owned" },
]

const TYPE_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  system: "info", category: "primary", giver: "secondary", faction: "secondary",
  tag: "warning", event: "success", query: "default", material: "info",
  rarity: "warning", manufacturer: "secondary",
}

interface UnifiedSearchBarProps {
  tokens: SearchToken[]
  onChange: (tokens: SearchToken[]) => void
  extraOptions?: SearchToken[]
  placeholder?: string
  mode?: "missions" | "blueprints"
}

export function UnifiedSearchBar({ tokens, onChange, extraOptions = [], placeholder, mode = "missions" }: UnifiedSearchBarProps) {
  const [inputValue, setInputValue] = useState("")

  const baseOptions = useMemo(() => {
    if (mode === "blueprints") return [...BP_CATEGORIES, ...BP_MATERIALS, ...BP_RARITIES, ...BP_TAGS]
    return [...SYSTEMS, ...MISSION_CATEGORIES, ...MISSION_TAGS, ...MISSION_GIVERS, ...MISSION_FACTIONS]
  }, [mode])

  const allOptions = useMemo(() => {
    const opts = [...baseOptions, ...extraOptions]
    const selected = new Set(tokens.map(t => `${t.type}:${t.value}`))
    return opts.filter(o => !selected.has(`${o.type}:${o.value}`))
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
    return allOptions.filter(o =>
      o.label.toLowerCase().includes(lower) ||
      o.value.toLowerCase().includes(lower) ||
      o.type.toLowerCase().includes(lower)
    ).slice(0, 15)
  }, [inputValue, allOptions])

  return (
    <Autocomplete
      multiple freeSolo size="small"
      options={filtered}
      value={tokens}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => { if (reason !== "reset") setInputValue(val) }}
      onChange={(_, newValue) => {
        onChange(newValue.map(v => typeof v === "string" ? { type: "query", label: v, value: v } : v))
        setInputValue("")
      }}
      getOptionLabel={(o) => typeof o === "string" ? o : o.label}
      isOptionEqualToValue={(a, b) => a.type === b.type && a.value === b.value}
      renderOption={(props, option) => (
        <li {...props} key={`${option.type}:${option.value}`}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={option.type.charAt(0).toUpperCase() + option.type.slice(1)} size="small"
              color={TYPE_COLORS[option.type] || "default"}
              sx={{ height: 20, fontSize: "0.6rem", fontWeight: "bold", textTransform: "uppercase", minWidth: 60 }} />
            <Typography variant="body2">{option.label}</Typography>
          </Box>
        </li>
      )}
      renderTags={(value, getTagProps) =>
        value.map((token, index) => (
          <Chip {...getTagProps({ index })} key={`${token.type}:${token.value}`}
            label={token.label} size="small" color={TYPE_COLORS[token.type] || "default"}
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: "bold" }} />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} placeholder={tokens.length ? "" : placeholder || "Search..."} />
      )}
      sx={{ flex: 1, minWidth: 200 }}
    />
  )
}

// === Mission param conversion ===
export function missionTokensToParams(tokens: SearchToken[]): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = [], categories: string[] = [], systems: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query": queries.push(t.value); break
      case "system": systems.push(t.value); break
      case "category": categories.push(t.value); break
      case "giver": params.giver = t.value; break
      case "faction": params.faction = t.value; break
      case "event": params.show_events = "true"; params.event = t.value; break
      case "tag":
        if (t.value === "ILLEGAL") params.legal = "ILLEGAL"
        else if (t.value === "shareable") params.shareable = "true"
        else if (t.value === "unique") params.unique = "true"
        else if (t.value === "chain") params.chain = "true"
        else if (t.value === "blueprints") params.blueprints = "true"
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  if (categories.length) params.category = categories.join(",")
  if (systems.length) params.system = systems.join(",")
  return params
}

export function missionParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q"); if (q) tokens.push({ type: "query", label: q, value: q })
  sp.get("category")?.split(",").forEach(c => c && tokens.push({ type: "category", label: c, value: c }))
  sp.get("system")?.split(",").forEach(s => s && tokens.push({ type: "system", label: s, value: s }))
  const giver = sp.get("giver"); if (giver) tokens.push({ type: "giver", label: giver, value: giver })
  const faction = sp.get("faction"); if (faction) tokens.push({ type: "faction", label: faction, value: faction })
  if (sp.get("legal") === "ILLEGAL") tokens.push({ type: "tag", label: "Illegal", value: "ILLEGAL" })
  if (sp.get("shareable") === "true") tokens.push({ type: "tag", label: "Shareable", value: "shareable" })
  if (sp.get("chain") === "true") tokens.push({ type: "tag", label: "Chain Starter", value: "chain" })
  if (sp.get("blueprints") === "true") tokens.push({ type: "tag", label: "Has Blueprints", value: "blueprints" })
  const event = sp.get("event"); if (event) tokens.push({ type: "event", label: event, value: event })
  return tokens
}

// === Blueprint param conversion ===
export function blueprintTokensToParams(tokens: SearchToken[]): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  for (const t of tokens) {
    switch (t.type) {
      case "query": queries.push(t.value); break
      case "category": params.category = t.value; break
      case "material": params.ingredient = t.value; break
      case "rarity": params.rarity = t.value; break
      case "manufacturer": params.mfr = t.value; break
      case "tag":
        if (t.value === "default") params.source = "default"
        else if (t.value === "mission_reward") params.source = "mission_reward"
        else if (t.value === "has_missions") params.missions = "true"
        else if (t.value === "owned") params.owned = "true"
        break
    }
  }
  if (queries.length) params.q = queries.join(" ")
  return params
}

export function blueprintParamsToTokens(sp: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = sp.get("q"); if (q) tokens.push({ type: "query", label: q, value: q })
  const cat = sp.get("category"); if (cat) tokens.push({ type: "category", label: cat, value: cat })
  const ing = sp.get("ingredient"); if (ing) tokens.push({ type: "material", label: ing, value: ing })
  const rar = sp.get("rarity"); if (rar) tokens.push({ type: "rarity", label: rar, value: rar })
  const mfr = sp.get("mfr"); if (mfr) tokens.push({ type: "manufacturer", label: mfr, value: mfr })
  const src = sp.get("source")
  if (src === "default") tokens.push({ type: "tag", label: "Default", value: "default" })
  if (src === "mission_reward") tokens.push({ type: "tag", label: "Mission Reward", value: "mission_reward" })
  if (sp.get("missions") === "true") tokens.push({ type: "tag", label: "Has Mission Source", value: "has_missions" })
  if (sp.get("owned") === "true") tokens.push({ type: "tag", label: "Owned", value: "owned" })
  return tokens
}
