/**
 * BlueprintTags — the tag chips shown for a blueprint (owned, default,
 * rarity, tier, manufacturer, category, modifier properties).
 *
 * Shared by BlueprintCard (grid + list), BlueprintDetailModal (desktop) and
 * the BlueprintDetail page (mobile) so the card and the detail view always
 * show the same tags.
 */

import React from "react"
import { Chip, Stack, Tooltip, Typography } from "@mui/material"
import type { SxProps, Theme } from "@mui/material"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { formatCategoryName } from "../../util/categoryDisplay"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { propertyLabel } from "../../util/statDisplay"
import type {
  BlueprintDetailResponse,
  BlueprintSearchResult,
} from "../../store/api/v2/market"

/** The blueprint fields the tags are built from. */
export type BlueprintTagSource = Pick<
  BlueprintSearchResult,
  | "source"
  | "manufacturer"
  | "rarity"
  | "tier"
  | "item_category"
  | "modifier_properties"
  | "user_owns"
>

/**
 * Tag data from the blueprint detail response. The detail response has no
 * `source` or `manufacturer` (see the backend's getBlueprintDetail), so the
 * Default and manufacturer tags (and Owned for default blueprints) can only
 * show once it returns them.
 */
export function blueprintTagsFromDetail(
  data: BlueprintDetailResponse,
): BlueprintTagSource {
  const bp = data.blueprint
  return {
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
  const base: SxProps<Theme> = micro ? microChip : {}
  const show = (kind: BlueprintTagKind) => !hide.includes(kind)
  const modTags = blueprintModifierTags(bp.modifier_properties, t)
  // Cards stay compact: the first few, then "+N" (all of them in a tooltip).
  const shownMods = micro ? modTags.slice(0, CARD_MODIFIER_LIMIT) : modTags
  const hiddenMods = micro ? modTags.slice(CARD_MODIFIER_LIMIT) : []

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

  const chips = (
    <>
      {show("owned") && isBlueprintOwned(bp) && (
        <Chip
          data-tag="owned"
          label={t("blueprintsUi.owned")}
          size="small"
          color="success"
          {...filterLink({ owned: "true" })}
          sx={base}
        />
      )}
      {show("default") && bp.source === "default" && (
        <Chip
          data-tag="default"
          label={t("blueprintsUi.default")}
          size="small"
          variant="outlined"
          {...filterLink({ source: "default" })}
          sx={base}
        />
      )}
      {show("rarity") && bp.rarity && (
        <Chip
          data-tag="rarity"
          label={bp.rarity}
          size="small"
          {...filterLink({ rarity: bp.rarity })}
          sx={{ ...base, bgcolor: "secondary.main", color: "#fff" }}
        />
      )}
      {show("tier") && bp.tier && (
        <Chip
          data-tag="tier"
          label={
            micro ? `T${bp.tier}` : t("blueprintsUi.tierN", { tier: bp.tier })
          }
          size="small"
          sx={{ ...base, bgcolor: "warning.main", color: "#fff" }}
        />
      )}
      {show("manufacturer") && bp.manufacturer && (
        <Chip
          data-tag="manufacturer"
          label={
            micro ? bp.manufacturer.slice(0, 4).toUpperCase() : bp.manufacturer
          }
          title={bp.manufacturer}
          size="small"
          variant="outlined"
          {...filterLink({ mfr: bp.manufacturer })}
          sx={{ ...base, fontFamily: micro ? "monospace" : undefined }}
        />
      )}
      {show("category") && bp.item_category && (
        <Chip
          data-tag="category"
          label={formatCategoryName(bp.item_category, t)}
          size="small"
          color="primary"
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
            <Chip
              key={tag}
              data-tag="modifier"
              label={tag}
              size="small"
              color="secondary"
              variant="outlined"
              sx={base}
            />
          ))}
          {hiddenMods.length > 0 && (
            <Tooltip title={hiddenMods.join(", ")} arrow>
              <Chip
                data-tag="modifier-more"
                label={`+${hiddenMods.length}`}
                size="small"
                color="secondary"
                variant="outlined"
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
