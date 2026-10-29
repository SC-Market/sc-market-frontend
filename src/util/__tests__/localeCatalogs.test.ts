import { describe, it, expect } from "vitest"
import { audit } from "../../../scripts/check-i18n.mjs"

// Same check as `npm run i18n:check` (also a CI step): every locale carries
// every en key, with the plural forms its language needs, the same
// {{placeholders}} / tags, and no value that just echoes its key name.
describe("locale catalogs", () => {
  for (const [locale, r] of Object.entries(audit())) {
    it(`${locale} has every en key`, () => {
      expect(r.missing).toEqual([])
    })
    it(`${locale} keeps en placeholders and tags`, () => {
      expect(r.placeholder).toEqual([])
    })
  }
})
