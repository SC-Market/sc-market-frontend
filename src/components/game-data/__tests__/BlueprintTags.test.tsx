import "../../../util/i18n"
/**
 * BlueprintTags — the card and the detail view (modal + page) must show the
 * same tags for the same blueprint, and modifier codes are never shown raw.
 */

import React from "react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { BlueprintCard } from "../BlueprintCard"
import {
  BlueprintTags,
  blueprintTagsFromDetail,
  CARD_MODIFIER_LIMIT,
} from "../BlueprintTags"
import type {
  BlueprintDetailResponse,
  BlueprintSearchResult,
  SlotModifier,
} from "../../../store/api/v2/market"

const WEAPON_MODS = [
  "gpp_weapon_damage",
  "gpp_weapon_firerate",
  "gpp_weapon_recoil_handling",
  "gpp_weapon_recoil_kick",
  "gpp_weapon_recoil_smoothness",
]

const searchResult: BlueprintSearchResult = {
  blueprint_id: "bp-1",
  blueprint_code: "BP_FS9",
  blueprint_name: "FS-9 LMG",
  output_item_name: "FS-9 LMG",
  item_category: "Weapons",
  rarity: "Rare",
  tier: 3,
  manufacturer: "Gemini",
  source: "default",
  ingredient_count: 0,
  ingredients: [],
  mission_count: 0,
  modifier_properties: WEAPON_MODS,
  // A default blueprint: owned without an inventory entry.
  user_owns: false,
}

const slotModifier = (property: string): SlotModifier => ({
  slot_name: "barrel",
  slot_display_name: "Barrel",
  property,
  start_quality: 0,
  end_quality: 1000,
  modifier_at_start: 0.9,
  modifier_at_end: 1.1,
  modifier_type: "linear",
})

const detail: BlueprintDetailResponse = {
  blueprint: {
    blueprint_id: "bp-1",
    version_id: "v1",
    blueprint_code: "BP_FS9",
    blueprint_name: "FS-9 LMG",
    output_game_item_id: "gi-1",
    output_quantity: 1,
    item_category: "Weapons",
    rarity: "Rare",
    tier: 3,
    source: "default",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  output_item: { game_item_id: "gi-1", name: "FS-9 LMG", type: "weapon" },
  manufacturer: "Gemini",
  ingredients: [],
  missions_rewarding: [],
  // Two slots share a property: the tags list each property once.
  slot_modifiers: [
    ...WEAPON_MODS.map(slotModifier),
    { ...slotModifier("gpp_weapon_damage"), slot_name: "frame" },
  ],
  item_attributes: {},
  user_owns: false,
}

const tagKinds = (root: HTMLElement) =>
  [...root.querySelectorAll("[data-tag]")]
    .map((el) => el.getAttribute("data-tag")!)
    .filter((k) => k !== "modifier-more")

const modifierLabels = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-tag="modifier"]')].map(
    (el) => el.textContent,
  )

function renderCard() {
  return render(
    <MemoryRouter>
      <BlueprintCard blueprint={searchResult} viewMode="grid" />
    </MemoryRouter>,
  ).container
}

function renderDetailTags() {
  return render(
    <MemoryRouter>
      <BlueprintTags blueprint={blueprintTagsFromDetail(detail)} size="small" />
    </MemoryRouter>,
  ).container
}

describe("BlueprintTags", () => {
  it("shows the same tags on the card and in the detail view", () => {
    const card = renderCard()
    const cardKinds = new Set(tagKinds(card))
    const detailKinds = new Set(tagKinds(renderDetailTags()))

    expect(cardKinds).toEqual(
      new Set([
        "owned",
        "default",
        "rarity",
        "tier",
        "manufacturer",
        "category",
        "modifier",
      ]),
    )
    expect(detailKinds).toEqual(cardKinds)
  })

  it("derives the detail's modifier tags from its slot modifiers", () => {
    expect(blueprintTagsFromDetail(detail).modifier_properties).toEqual(
      WEAPON_MODS,
    )
  })

  it("never shows raw modifier codes; uses translated labels", () => {
    const detailTags = renderDetailTags()
    expect(modifierLabels(detailTags)).toEqual([
      "Damage",
      "Fire Rate",
      "Recoil Control",
      "Recoil Kick",
      "Recoil Smoothness",
    ])
    expect(detailTags.textContent).not.toMatch(/gpp/i)
    expect(within(detailTags).getByText("Quality affects")).toBeInTheDocument()
  })

  it("keeps the card compact: the first few modifiers, then +N", () => {
    const card = renderCard()
    expect(modifierLabels(card)).toEqual([
      "Damage",
      "Fire Rate",
      "Recoil Control",
    ])
    expect(card.querySelector('[data-tag="modifier-more"]')?.textContent).toBe(
      `+${WEAPON_MODS.length - CARD_MODIFIER_LIMIT}`,
    )
    expect(card.textContent).not.toMatch(/gpp/i)
  })

  it("humanizes unknown modifier codes without the gpp/category prefix", () => {
    render(
      <MemoryRouter>
        <BlueprintTags
          blueprint={{ modifier_properties: ["gpp_weapon_heat_buildup"] }}
          size="small"
        />
      </MemoryRouter>,
    )
    expect(screen.getByText("Heat Buildup")).toBeInTheDocument()
  })

  it("counts default blueprints as owned", () => {
    render(
      <MemoryRouter>
        <BlueprintTags blueprint={{ source: "default" }} />
      </MemoryRouter>,
    )
    expect(screen.getByText("Owned")).toBeInTheDocument()
    expect(screen.getByText("Default")).toBeInTheDocument()
  })
})
