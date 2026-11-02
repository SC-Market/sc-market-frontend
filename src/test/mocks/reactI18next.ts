/**
 * Shared `react-i18next` mock for vitest.
 *
 * Usage (vi.mock is hoisted above imports, so load the helper inside the
 * factory):
 *
 *   vi.mock("react-i18next", async (importOriginal) =>
 *     (await import("../../test/mocks/reactI18next")).mockReactI18next(
 *       importOriginal,
 *     ),
 *   )
 *
 * The module keeps every real export (`initReactI18next`, `I18nextProvider`,
 * ...), so importing src/util/i18n keeps working. `useTranslation` and
 * `Trans` are backed by a standalone i18next instance loaded with the English
 * catalog: `t()` returns the English text of a key (plural keys,
 * `{{var}}` interpolation and `defaultValue` behave as in the app), and the
 * key itself when the catalog has no entry. Tests assert real English text.
 */
import { createElement } from "react"
import { createInstance, type TFunction } from "i18next"
import type * as ReactI18next from "react-i18next"
import en from "../../locales/en/english.json"

/** Standalone i18next instance with only the English catalog. */
export const testI18n = createInstance()
void testI18n.init({
  lng: "en",
  fallbackLng: "en",
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  initAsync: false,
  showSupportNotice: false,
})

/** English `t()`, e.g. for building expected strings in assertions. */
export const testT: TFunction = testI18n.t

export async function mockReactI18next(
  importOriginal: <T = unknown>() => Promise<T>,
): Promise<typeof ReactI18next> {
  const actual = await importOriginal<typeof ReactI18next>()
  const t = testT
  const translation = Object.assign([t, testI18n, true], {
    t,
    i18n: testI18n,
    ready: true,
  })

  const useTranslation = (() => translation) as typeof actual.useTranslation
  const Trans = ((props: Parameters<typeof actual.Trans>[0]) =>
    createElement(actual.Trans, {
      i18n: testI18n,
      t,
      ...props,
    })) as typeof actual.Trans

  return {
    ...actual,
    initReactI18next: actual.initReactI18next,
    I18nextProvider: actual.I18nextProvider,
    useTranslation,
    Trans,
  }
}
