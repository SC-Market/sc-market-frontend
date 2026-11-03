import i18n from "../i18n"
import { getServerRenderLanguage } from "../renderLanguage"
import { toSupportedLocale } from "../locales"

/**
 * The page's language as a shipped locale code, for code outside React
 * (event handlers, chart callbacks built outside render, error messages):
 * the server render's language, or i18next's in the browser. Components
 * use useFormatters() instead.
 */
export function pageLocale(): string {
  return toSupportedLocale(getServerRenderLanguage() ?? i18n.language ?? "en")
}
