/**
 * Minimal English-only `t()` for the edge bridge. Resolves the few
 * translation keys the bridge renders from src/locales/en/english.json and
 * interpolates `{{name}}` like the SPA's i18next setup
 * (`escapeValue: false`: values are inserted raw; the bridge escapes on
 * output). Unknown keys fall back to the caller's default, as i18next does.
 *
 * Named JSON imports let the Function bundler keep only these sections
 * instead of the whole ~200 KB locale file.
 */
import { org, seoAnswers, viewProfile } from "../locales/en/english.json"
import type { AnswerTranslate } from "../util/answerContent"

const RESOURCES: Record<string, unknown> = {
  seoAnswers,
  org: { orgTitle: org.orgTitle },
  viewProfile: { store_tab: viewProfile.store_tab },
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
  const template = lookup(key) ?? fallback ?? key
  return interpolate(template, values)
}

export const englishT: AnswerTranslate & ((key: string) => string) = translate
