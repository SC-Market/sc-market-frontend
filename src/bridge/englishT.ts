/**
 * Minimal English-only `t()` for the edge bridge. Resolves the few
 * translation keys the bridge renders (answer text, layout labels, hub
 * titles, the landing FAQ, an item's "how to get it" section, the mission
 * hubs) from
 * src/locales/en/english.json and
 * interpolates `{{name}}` (and picks `_one`/`_other` plural keys for a
 * numeric `count`) like the SPA's i18next setup
 * (`escapeValue: false`: values are inserted raw; the bridge escapes on
 * output). Unknown keys fall back to the caller's default, as i18next does.
 *
 * Named JSON imports let the Function bundler keep only these sections
 * instead of the whole ~200 KB locale file.
 */
import {
  contractorsPage,
  itemAcquisition,
  landing,
  mining,
  missionHubs,
  org,
  recruiting,
  resources,
  seoAnswers,
  viewProfile,
  wiki,
} from "../locales/en/english.json"
import type { AnswerTranslate } from "../util/answerContent"

const RESOURCES: Record<string, unknown> = {
  seoAnswers,
  itemAcquisition,
  org: { orgTitle: org.orgTitle },
  viewProfile: { store_tab: viewProfile.store_tab },
  landing,
  contractorsPage: { title: contractorsPage.title },
  mining: { title: mining.title },
  missionHubs,
  resources: { title: resources.title },
  recruiting: {
    scOrgsNote: recruiting.scOrgsNote,
    scOrgsLfoNote: recruiting.scOrgsLfoNote,
  },
  wiki: {
    hub: wiki.hub,
    locations: { title: wiki.locations.title },
    manufacturers: { title: wiki.manufacturers.title },
  },
}

function lookup(key: string): string | undefined {
  let node: unknown = RESOURCES
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === "string" ? node : undefined
}

function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  )
}

function translate(
  key: string,
  options?: string | ({ defaultValue?: string } & Record<string, unknown>),
): string {
  const values = typeof options === "object" && options !== null ? options : {}
  const fallback = typeof options === "string" ? options : values.defaultValue
  // Plural keys like i18next (key_one / key_other) when a numeric count is given.
  const plural =
    typeof values.count === "number" ? lookup(`${key}_${new Intl.PluralRules("en").select(values.count)}`) : undefined
  const template = plural ?? lookup(key) ?? fallback ?? key
  return interpolate(template, values)
}

export const englishT: AnswerTranslate & ((key: string) => string) = translate
