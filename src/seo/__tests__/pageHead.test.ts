import { describe, it, expect } from "vitest"
import {
  applyTitleTemplate,
  applyWhiteLabelTitle,
  faqPageJsonLd,
  headDescription,
  serializeJsonLd,
} from "../pageHead"

describe("serializeJsonLd", () => {
  it("can't be closed from inside by user content", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" })
    expect(out).not.toContain("<")
    expect(out).not.toContain(">")
    expect(out.toLowerCase()).not.toContain("</script")
  })

  it("escapes &, U+2028 and U+2029", () => {
    const out = serializeJsonLd({ a: "x & y", b: "line\u2028sep\u2029para" })
    expect(out).not.toContain("&")
    expect(out).not.toMatch(/[\u2028\u2029]/)
    expect(out).toContain("\\u2028")
    expect(out).toContain("\\u2029")
  })

  it("stays valid JSON with the same value", () => {
    const value = {
      "@type": "Product",
      name: `<b>"Quotes"</b> & 'apostrophes${"\u2028"}</SCRIPT>`,
      nested: [{ n: 1 }, null, true],
    }
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value)
  })
})

describe("applyTitleTemplate", () => {
  it("appends the brand once", () => {
    expect(applyTitleTemplate("Agricium")).toBe("Agricium - SC Market")
    expect(applyTitleTemplate("Aurora — Star Citizen Ship | SC Market")).toBe(
      "Aurora — Star Citizen Ship | SC Market",
    )
  })

  it("falls back to the bare brand", () => {
    expect(applyTitleTemplate("")).toBe("SC Market")
    expect(applyTitleTemplate(undefined)).toBe("SC Market")
  })
})

describe("faqPageJsonLd / headDescription", () => {
  it("builds FAQPage structured data", () => {
    expect(faqPageJsonLd([{ question: "Q?", answer: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } },
      ],
    })
  })

  it("reads the meta description", () => {
    expect(headDescription({ meta: [{ name: "description", content: "d" }], jsonLd: [] })).toBe("d")
    expect(headDescription({ meta: [], jsonLd: [] })).toBe("")
  })
})

describe("applyWhiteLabelTitle (an org's white-label subdomain)", () => {
  it("is '<Org> — <page>' without SC Market's suffix", () => {
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market")).toBe("Blackwell Inc. — Market")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market - SC Market")).toBe("Blackwell Inc. — Market")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Aurora MR — Star Citizen Ship | SC Market")).toBe(
      "Blackwell Inc. — Aurora MR — Star Citizen Ship",
    )
  })

  it("keeps a title that already starts with the org, and is the org without one", () => {
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Blackwell Inc. - Org - SC Market")).toBe("Blackwell Inc. - Org")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "")).toBe("Blackwell Inc.")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "SC Market")).toBe("Blackwell Inc.")
    expect(applyWhiteLabelTitle("Blackwell Inc.", null)).toBe("Blackwell Inc.")
  })
})
