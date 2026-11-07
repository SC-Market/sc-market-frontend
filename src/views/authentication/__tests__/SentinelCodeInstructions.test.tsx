/**
 * The RSI account and org link instructions put the user's link code inside
 * the sentence via <Trans components={{ sentinelCode }}>: the translation's
 * <sentinelCode>your code</sentinelCode> tag becomes the copyable code
 * button. The tag must never reach the screen as text (escaped or not), in
 * any locale, and the code is shown as text (React escapes it), never parsed
 * as HTML.
 */
import React from "react"
import { cleanup, render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

let identifier = "SCM-TEST-CODE"

vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetAuthenticatorIdentifier: () => ({
    data: { identifier },
    isLoading: false,
    isError: false,
  }),
  useActivateAccountLink: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useContractorLinkMutation: () => [vi.fn(), { isLoading: false }],
}))
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { testI18n } from "../../../test/mocks/reactI18next"
import { mainTheme } from "../../../hooks/styles/Theme"
import { AuthenticateContractor } from "../AuthenticateContractor"
import { AuthenticateRSI } from "../AuthenticateRSI"
import de from "../../../locales/de/de.json"
import es from "../../../locales/es/es.json"
import fr from "../../../locales/fr/fr.json"
import ja from "../../../locales/ja/ja.json"
import uk from "../../../locales/uk/ukrainian.json"
import zhCN from "../../../locales/zh/zh_Hans.json"
import zhTW from "../../../locales/zh/zh_Hant.json"

const locales: Record<string, Record<string, unknown>> = {
  de,
  es,
  fr,
  ja,
  uk,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
}
for (const [lng, translation] of Object.entries(locales)) {
  testI18n.addResourceBundle(lng, "translation", translation, true, true)
}

const views = {
  authenticateRSI: () => <AuthenticateRSI identifier={identifier} />,
  authenticateContractor: () => <AuthenticateContractor />,
}

function renderView(View: () => React.ReactElement) {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>
        <View />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

/** The instructions paragraph: the one containing the code button. */
function instructions(container: HTMLElement, code: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === code,
  )
  expect(button, "code button inside the instructions").toBeTruthy()
  return button!.closest("p, span") as HTMLElement
}

describe("link code in the RSI / org link instructions", () => {
  beforeEach(() => {
    identifier = "SCM-TEST-CODE"
  })
  afterEach(async () => {
    cleanup()
    await testI18n.changeLanguage("en")
  })

  for (const [name, View] of Object.entries(views)) {
    for (const lng of ["en", ...Object.keys(locales)]) {
      it(`${name} (${lng}) shows the real code, not the tag`, async () => {
        await testI18n.changeLanguage(lng)
        const { container } = renderView(View)
        const paragraph = instructions(container, "SCM-TEST-CODE")
        const text = paragraph.textContent ?? ""
        expect(text).toContain("SCM-TEST-CODE")
        expect(text).not.toMatch(/sentinelCode|&lt;|&gt;|<\/?[a-z]/i)
        expect(paragraph.innerHTML).not.toMatch(/sentinelcode|&lt;/i)
      })
    }

    it(`${name} shows markup in a code as text, never as HTML`, () => {
      identifier = `<img src=x onerror="alert(1)">&amp;`
      const { container } = renderView(View)
      const paragraph = instructions(container, identifier)
      expect(paragraph.querySelector("img")).toBeNull()
      expect(paragraph.textContent).toContain(identifier)
    })
  }
})
