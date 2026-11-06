/**
 * BlueprintTags — the tag chips shown for a blueprint (owned, default,
 * rarity, tier, manufacturer, category, modifier properties).
 *
 * Shared by BlueprintCard (grid + list), BlueprintDetailModal (desktop) and
 * the BlueprintDetail page (mobile) so the card and the detail view always
 * show the same tags.
 */

import React from "react"
import { Stack, Tooltip, Typography } from "@mui/material"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { formatCategoryName } from "../../util/categoryDisplay"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { propertyLabel } from "../../util/statDisplay"
import type {
  BlueprintDetailResponse,
  BlueprintSearchResult,
} from "../../features/game-data/api/gameDataApi"
import { TagChip } from "../tags/TagChip"

/** The blueprint fields the tags are built from. */
export type BlueprintTagSource = Pick<
  BlueprintSearchResult,
  | "source"
  | "manufacturer"
  | "manufacturer_name"
  | "rarity"
  | "tier"
  | "item_category"
  | "modifier_properties"
  | "user_owns"
>

/**
 * Tag data from the blueprint detail response: the same fields the search
 * result has (`source` on the blueprint, `manufacturer` / `manufacturer_name`
 * of the output item),
 * so the detail shows the same tags as the card.
 */
export function blueprintTagsFromDetail(
  data: BlueprintDetailResponse,
): BlueprintTagSource {
  const bp = data.blueprint
  return {
    source: bp.source,
    manufacturer: data.manufacturer,
    manufacturer_name: data.manufacturer_name,
    rarity: bp.rarity,
    tier: bp.tier,
    item_category: bp.item_category,
    user_owns: data.user_owns,
    // Same as the search endpoint's modifier_properties: the distinct
    // properties of the blueprint's slot modifiers.
    modifier_properties: [
      ...new Set((data.slot_modifiers || []).map((m) => m.property)),
    ],
  }
}

/** Default blueprints are always owned by everyone. */
export function isBlueprintOwned(bp: BlueprintTagSource): boolean {
  return bp.source === "default" || !!bp.user_owns
}

/**
 * Readable, translated labels for modifier property codes (raw codes like
 * gpp_weapon_firerate are never shown), deduplicated.
 */
export function blueprintModifierTags(
  props: string[] | undefined,
  t: TFunction,
): string[] {
  return [...new Set((props || []).map((p) => propertyLabel(p, t)))]
}

/** Modifier tags shown on a card before collapsing the rest into "+N". */
export const CARD_MODIFIER_LIMIT = 3

/**
 * Label for the manufacturer tag: the display name ("Behring"); the code
 * ("behr") only when the API has no name for it.
 */
export function blueprintManufacturerLabel(
  bp: Pick<BlueprintTagSource, "manufacturer" | "manufacturer_name">,
): string | undefined {
  return bp.manufacturer_name ?? bp.manufacturer
}

export type BlueprintTagKind =
  | "owned"
  | "default"
  | "rarity"
  | "tier"
  | "manufacturer"
  | "category"
  | "modifiers"

const microChip = {
  height: 18,
  fontSize: "0.65rem",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
}

export interface BlueprintTagsProps {
  blueprint: BlueprintTagSource
  /** "micro" for cards, "small" for the detail header. */
  size?: "micro" | "small"
  /**
   * Inside another link (the card): chips navigate on click instead of
   * rendering as links, since links can't nest.
   */
  nested?: boolean
  /** Tags to leave out (e.g. the list card has no category tag). */
  hide?: BlueprintTagKind[]
  /** Called before a chip navigates (the modal closes itself). */
  onNavigate?: () => void
  /** Wrap the chips in a row. Off when the caller lays them out itself. */
  wrap?: boolean
}

export function BlueprintTags({
  blueprint: bp,
  size = "micro",
  nested = false,
  hide = [],
  onNavigate,
  wrap = true,
}: BlueprintTagsProps) {
  const { t } = useTranslation()
  const nav = useNavigate()
  const micro = size === "micro"
  const base = micro ? microChip : {}
  const show = (kind: BlueprintTagKind) => !hide.includes(kind)
  const modTags = blueprintModifierTags(bp.modifier_properties, t)
  // Cards stay compact: the first few, then "+N" (all of them in a tooltip).
  const shownMods = micro ? modTags.slice(0, CARD_MODIFIER_LIMIT) : modTags
  const hiddenMods = micro ? modTags.slice(CARD_MODIFIER_LIMIT) : []
  const manufacturerLabel = blueprintManufacturerLabel(bp)

  // The blueprint list filtered by the chip.
  const filterLink = (params: Record<string, string>) => {
    const to = `${GAME_DATA_PATHS.blueprints}?${new URLSearchParams(params).toString()}`
    if (nested) {
      return {
        clickable: true,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          e.preventDefault()
          onNavigate?.()
          nav(to)
        },
      }
    }
    return {
      clickable: true,
      component: RouterLink,
      to,
      onClick: () => onNavigate?.(),
    }
  }

  // Colours come from the tag type (components/tags/tagColors).
  const chips = (
    <>
      {show("owned") && isBlueprintOwned(bp) && (
        <TagChip
          tag="owned"
          data-tag="owned"
          label={t("blueprintsUi.owned")}
          {...filterLink({ owned: "true" })}
          sx={base}
        />
      )}
      {show("default") && bp.source === "default" && (
        <TagChip
          tag="source"
          data-tag="default"
          label={t("blueprintsUi.default")}
          {...filterLink({ source: "default" })}
          sx={base}
        />
      )}
      {show("rarity") && bp.rarity && (
        <TagChip
          tag="rarity"
          rarity={bp.rarity}
          data-tag="rarity"
          label={bp.rarity}
          {...filterLink({ rarity: bp.rarity })}
          sx={base}
        />
      )}
      {show("tier") && bp.tier && (
        <TagChip
          tag="tier"
          data-tag="tier"
          label={
            micro ? `T${bp.tier}` : t("blueprintsUi.tierN", { tier: bp.tier })
          }
          sx={base}
        />
      )}
      {show("manufacturer") && bp.manufacturer && manufacturerLabel && (
        <TagChip
          tag="manufacturer"
          data-tag="manufacturer"
          label={manufacturerLabel}
          title={manufacturerLabel}
          // The filter takes the code; the chip shows the name.
          {...filterLink({ mfr: bp.manufacturer })}
          sx={{ ...base, maxWidth: micro ? 160 : undefined }}
        />
      )}
      {show("category") && bp.item_category && (
        <TagChip
          tag="category"
          data-tag="category"
          label={formatCategoryName(bp.item_category, t)}
          {...filterLink({ category: bp.item_category })}
          sx={base}
        />
      )}
      {show("modifiers") && modTags.length > 0 && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          role="group"
          aria-label={t("blueprintsUi.card.qualityAffects")}
          title={micro ? t("blueprintsUi.card.qualityAffects") : undefined}
        >
          {!micro && (
            <Typography variant="caption" color="text.primary">
              {t("blueprintsUi.card.qualityAffects")}
            </Typography>
          )}
          {shownMods.map((tag) => (
            <TagChip
              key={tag}
              tag="modifier"
              data-tag="modifier"
              label={tag}
              sx={base}
            />
          ))}
          {hiddenMods.length > 0 && (
            <Tooltip title={hiddenMods.join(", ")} arrow>
              <TagChip
                tag="modifier"
                data-tag="modifier-more"
                label={`+${hiddenMods.length}`}
                sx={base}
              />
            </Tooltip>
          )}
        </Stack>
      )}
    </>
  )

  if (!wrap) return chips
  return (
    <Stack
      direction="row"
      spacing={0.5}
      flexWrap="wrap"
      useFlexGap
      data-testid="blueprint-tags"
    >
      {chips}
    </Stack>
  )
}
