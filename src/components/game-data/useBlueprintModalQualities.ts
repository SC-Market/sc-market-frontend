import React, { useMemo, useState } from "react"
import type {
  BlueprintIngredient,
  SlotModifier,
} from "../../features/game-data/api/gameDataApi"
import { interpolateModifier } from "../../util/statDisplay"

export type QualityRange = { min: number; max: number }
export type CombinedModifiers = Map<
  string,
  { value: number; modifierType: "linear" | "additive" }
>

/**
 * Ingredient quality state of the blueprint modal: a quality per ingredient
 * (clamped to its slot's range) and the stat modifiers those qualities give.
 */
export function useBlueprintModalQualities(
  ingredients: BlueprintIngredient[],
  slotModifiers: SlotModifier[],
) {
  const modsBySlot = useMemo(() => {
    const map = new Map<string, SlotModifier[]>()
    for (const m of slotModifiers) {
      if (!map.has(m.slot_name)) map.set(m.slot_name, [])
      map.get(m.slot_name)!.push(m)
    }
    return map
  }, [slotModifiers])

  const [qualities, setQualities] = useState<number[]>([])

  // Quality range per ingredient from slot modifiers
  const qualityRanges = useMemo(() => {
    return ingredients.map((ing: BlueprintIngredient) => {
      const mods = modsBySlot.get(ing.slot_name || ing.game_item?.name) || []
      if (!mods.length) return { min: 0, max: 1000 }
      const min = Math.min(...mods.map((m: SlotModifier) => m.start_quality))
      const max = Math.max(...mods.map((m: SlotModifier) => m.end_quality))
      return { min, max }
    })
  }, [ingredients, modsBySlot])

  React.useEffect(() => {
    if (ingredients.length && qualities.length !== ingredients.length)
      setQualities(qualityRanges.map((r) => Math.round((r.min + r.max) / 2)))
  }, [ingredients.length, qualities.length, qualityRanges])

  const setQuality = (idx: number, v: number) => {
    const r = qualityRanges[idx] || { min: 0, max: 1000 }
    setQualities((prev) =>
      prev.map((q, i) => (i === idx ? Math.max(r.min, Math.min(r.max, v)) : q)),
    )
  }
  const setAllQualities = (mode: "min" | "mid" | "max") =>
    setQualities(
      qualityRanges.map((r) =>
        mode === "min"
          ? r.min
          : mode === "max"
            ? r.max
            : Math.round((r.min + r.max) / 2),
      ),
    )

  const combinedModifiers = useMemo(() => {
    const result = new Map<
      string,
      { value: number; modifierType: "linear" | "additive" }
    >()
    for (const mod of slotModifiers) {
      const slotIdx = ingredients.findIndex(
        (ing: BlueprintIngredient) =>
          (ing.slot_name || ing.game_item?.name) === mod.slot_name,
      )
      const qv = qualities[slotIdx] ?? 500
      const factor = interpolateModifier(
        qv,
        mod.start_quality,
        mod.end_quality,
        mod.modifier_at_start,
        mod.modifier_at_end,
      )
      const existing = result.get(mod.property)
      if (mod.modifier_type === "additive") {
        // Additive modifiers sum together
        result.set(mod.property, {
          value: (existing?.value ?? 0) + factor,
          modifierType: "additive",
        })
      } else {
        // Linear (multiplicative) modifiers multiply together
        result.set(mod.property, {
          value: (existing?.value ?? 1) * factor,
          modifierType: "linear",
        })
      }
    }
    return result
  }, [slotModifiers, qualities, ingredients])

  const outputQuality = useMemo(() => {
    if (!ingredients.length || !qualities.length) return 500
    return Math.round(
      ingredients.reduce(
        (s: number, _: BlueprintIngredient, i: number) =>
          s + (qualities[i] ?? 500),
        0,
      ) / ingredients.length,
    )
  }, [qualities, ingredients])

  return {
    modsBySlot,
    qualities,
    qualityRanges,
    setQuality,
    setAllQualities,
    combinedModifiers,
    outputQuality,
  }
}
