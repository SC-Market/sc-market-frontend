/**
 * UnifiedSearchBar — rich multi-select autocomplete for missions/blueprints.
 * Combines free text search with structured filter suggestions.
 * Each suggestion has a type chip (System, Category, Giver, Tag) + name.
 */

import React, { useState, useMemo } from "react"
import { Autocomplete, Chip, TextField, Box, Typography } from "@mui/material"

export interface SearchToken {
  type: "query" | "system" | "category" | "giver" | "faction" | "tag" | "event"
  label: string
  value: string
}

const TAG_OPTIONS: SearchToken[] = [
  { type: "tag", label: "Illegal", value: "ILLEGAL" },
  { type: "tag", label: "Shareable", value: "shareable" },
  { type: "tag", label: "Unique", value: "unique" },
  { type: "tag", label: "Chain Starter", value: "chain" },
  { type: "tag", label: "Has Blueprints", value: "blueprints" },
]

const SYSTEM_OPTIONS: SearchToken[] = [
  { type: "system", label: "Stanton", value: "Stanton" },
  { type: "system", label: "Pyro", value: "Pyro" },
  { type: "system", label: "Nyx", value: "Nyx" },
  { type: "system", label: "Terra", value: "Terra" },
  { type: "system", label: "Magnus", value: "Magnus" },
]

const CATEGORY_OPTIONS: SearchToken[] = [
  { type: "category", label: "Mercenary", value: "Mercenary" },
  { type: "category", label: "Bounty Hunter", value: "Bounty Hunter" },
  { type: "category", label: "Delivery", value: "Delivery" },
  { type: "category", label: "Hauling", value: "Hauling" },
  { type: "category", label: "Investigation", value: "Investigation" },
  { type: "category", label: "Mining", value: "Mining" },
  { type: "category", label: "Salvage", value: "Salvage" },
  { type: "category", label: "Maintenance", value: "Maintenance" },
  { type: "category", label: "Race", value: "Race" },
  { type: "category", label: "Courier", value: "Courier" },
]

const TYPE_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  system: "info",
  category: "primary",
  giver: "secondary",
  faction: "secondary",
  tag: "warning",
  event: "success",
  query: "default",
}

interface UnifiedSearchBarProps {
  tokens: SearchToken[]
  onChange: (tokens: SearchToken[]) => void
  /** Extra suggestion options (e.g. givers, factions from API) */
  extraOptions?: SearchToken[]
  placeholder?: string
}

export function UnifiedSearchBar({ tokens, onChange, extraOptions = [], placeholder }: UnifiedSearchBarProps) {
  const [inputValue, setInputValue] = useState("")

  const allOptions = useMemo(() => {
    const opts = [...SYSTEM_OPTIONS, ...CATEGORY_OPTIONS, ...TAG_OPTIONS, ...extraOptions]
    // Filter out already-selected tokens
    const selected = new Set(tokens.map(t => `${t.type}:${t.value}`))
    return opts.filter(o => !selected.has(`${o.type}:${o.value}`))
  }, [tokens, extraOptions])

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return allOptions.slice(0, 8)
    const lower = inputValue.toLowerCase()
    return allOptions.filter(o =>
      o.label.toLowerCase().includes(lower) || o.type.toLowerCase().includes(lower)
    ).slice(0, 10)
  }, [inputValue, allOptions])

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
        const result: SearchToken[] = newValue.map(v =>
          typeof v === "string" ? { type: "query", label: v, value: v } : v
        )
        onChange(result)
        setInputValue("")
      }}
      getOptionLabel={(o) => typeof o === "string" ? o : o.label}
      isOptionEqualToValue={(a, b) => a.type === b.type && a.value === b.value}
      renderOption={(props, option) => (
        <li {...props} key={`${option.type}:${option.value}`}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={option.type.charAt(0).toUpperCase() + option.type.slice(1)} size="small"
              color={TYPE_COLORS[option.type] || "default"} sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold", textTransform: "uppercase", minWidth: 65 }} />
            <Typography variant="body2">{option.label}</Typography>
          </Box>
        </li>
      )}
      renderTags={(value, getTagProps) =>
        value.map((token, index) => (
          <Chip
            {...getTagProps({ index })}
            key={`${token.type}:${token.value}`}
            label={token.label}
            size="small"
            color={TYPE_COLORS[token.type] || "default"}
            sx={{ height: 22, fontSize: "0.7rem", fontWeight: "bold" }}
          />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} placeholder={tokens.length ? "" : placeholder || "Search missions..."} />
      )}
      sx={{ flex: 1, minWidth: 200 }}
    />
  )
}

/** Convert SearchTokens to URL search params */
export function tokensToParams(tokens: SearchToken[]): Record<string, string> {
  const params: Record<string, string> = {}
  const queries: string[] = []
  const categories: string[] = []
  const systems: string[] = []

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

/** Convert URL search params to SearchTokens */
export function paramsToTokens(searchParams: URLSearchParams): SearchToken[] {
  const tokens: SearchToken[] = []
  const q = searchParams.get("q")
  if (q) tokens.push({ type: "query", label: q, value: q })

  const category = searchParams.get("category")
  if (category) category.split(",").forEach(c => tokens.push({ type: "category", label: c, value: c }))

  const system = searchParams.get("system")
  if (system) system.split(",").forEach(s => tokens.push({ type: "system", label: s, value: s }))

  const giver = searchParams.get("giver")
  if (giver) tokens.push({ type: "giver", label: giver, value: giver })

  const faction = searchParams.get("faction")
  if (faction) tokens.push({ type: "faction", label: faction, value: faction })

  const legal = searchParams.get("legal")
  if (legal === "ILLEGAL") tokens.push({ type: "tag", label: "Illegal", value: "ILLEGAL" })

  const shareable = searchParams.get("shareable")
  if (shareable === "true") tokens.push({ type: "tag", label: "Shareable", value: "shareable" })

  const chain = searchParams.get("chain")
  if (chain === "true") tokens.push({ type: "tag", label: "Chain Starter", value: "chain" })

  const blueprints = searchParams.get("blueprints")
  if (blueprints === "true") tokens.push({ type: "tag", label: "Has Blueprints", value: "blueprints" })

  const event = searchParams.get("event")
  if (event) tokens.push({ type: "event", label: event, value: event })

  return tokens
}
