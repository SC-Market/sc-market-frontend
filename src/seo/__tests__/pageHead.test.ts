import { describe, it, expect } from "vitest"
import {
  applyTitleTemplate,
  applyWhiteLabelHeadRules,
  type HeadTagModel,
  applyWhiteLabelTitle,
  faqPageJsonLd,
  headDescription,
  serializeJsonLd,
  whiteLabelPageHead,
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
        {
          "@type": "Question",
          name: "Q?",
          acceptedAnswer: { "@type": "Answer", text: "A." },
        },
      ],
    })
  })

  it("reads the meta description", () => {
    expect(
      headDescription({
        meta: [{ name: "description", content: "d" }],
        jsonLd: [],
      }),
    ).toBe("d")
    expect(headDescription({ meta: [], jsonLd: [] })).toBe("")
  })
})

describe("applyWhiteLabelTitle (an org's white-label domain)", () => {
  it("is '<Org> — <page> · SC Market'", () => {
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market")).toBe(
      "Blackwell Inc. — Market · SC Market",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market - SC Market")).toBe(
      "Blackwell Inc. — Market · SC Market",
    )
    expect(
      applyWhiteLabelTitle(
        "Blackwell Inc.",
        "Aurora MR — Star Citizen Ship | SC Market",
      ),
    ).toBe("Blackwell Inc. — Aurora MR — Star Citizen Ship · SC Market")
    expect(
      applyWhiteLabelTitle(
        "Blackwell Inc.",
        "SC Market — Star Citizen Trading Marketplace",
      ),
    ).toBe("Blackwell Inc. — Star Citizen Trading Marketplace · SC Market")
  })

  it("folds a leading org name into the form", () => {
    expect(
      applyWhiteLabelTitle("MEDRUNNER SERVICES", "MEDRUNNER SERVICES - Org"),
    ).toBe("MEDRUNNER SERVICES — Org · SC Market")
    expect(
      applyWhiteLabelTitle(
        "MEDRUNNER SERVICES",
        "MEDRUNNER SERVICES - Org - SC Market",
      ),
    ).toBe("MEDRUNNER SERVICES — Org · SC Market")
    expect(
      applyWhiteLabelTitle(
        "MEDRUNNER SERVICES",
        "MEDRUNNER SERVICES — Star Citizen Shop",
      ),
    ).toBe("MEDRUNNER SERVICES — Star Citizen Shop · SC Market")
    // Only a whole name: "MEDRUNNERS" isn't "MEDRUNNER" plus a page.
    expect(applyWhiteLabelTitle("MEDRUNNER", "MEDRUNNERS")).toBe(
      "MEDRUNNER — MEDRUNNERS · SC Market",
    )
  })

  it("is '<Org> · SC Market' for the org alone or no title", () => {
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Blackwell Inc.")).toBe(
      "Blackwell Inc. · SC Market",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", "")).toBe(
      "Blackwell Inc. · SC Market",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", "SC Market")).toBe(
      "Blackwell Inc. · SC Market",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", null)).toBe(
      "Blackwell Inc. · SC Market",
    )
  })

  it("is idempotent", () => {
    for (const title of [
      "MEDRUNNER SERVICES - Org",
      "Med & Kits | SC Market",
      "",
    ]) {
      const once = applyWhiteLabelTitle("MEDRUNNER SERVICES", title)
      expect(applyWhiteLabelTitle("MEDRUNNER SERVICES", once)).toBe(once)
    }
  })
})

describe("whiteLabelPageHead", () => {
  const options = {
    orgName: "MEDRUNNER SERVICES",
    origin: "https://medrunner.sc-market.space",
  }
  const TAGS = [
    "<title>MEDRUNNER SERVICES - Org - SC Market</title>",
    '<link rel="canonical" href="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta property="og:title" content="MEDRUNNER SERVICES - SC Market">',
    '<meta property="og:url" content="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta property="og:image" content="https://sc-market.space/og.png">',
    '<meta name="twitter:url" content="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta name="twitter:title" content="Med &amp; Kits - SC Market">',
    '<script type="application/ld+json">{"url":"https://sc-market.space/contractor/MEDRUNNER"}</script>',
  ].join("")

  it("brands the titles and keeps every URL on sc-market.space", () => {
    const out = whiteLabelPageHead(TAGS, options)
    expect(out).toContain("<title>MEDRUNNER SERVICES — Org · SC Market</title>")
    expect(out).toContain(
      '<meta property="og:title" content="MEDRUNNER SERVICES · SC Market">',
    )
    expect(out).toContain(
      '<meta name="twitter:title" content="MEDRUNNER SERVICES — Med &amp; Kits · SC Market">',
    )
    expect(out).toContain(
      '<meta property="og:site_name" content="MEDRUNNER SERVICES">',
    )
    expect(out).toContain(
      '<meta property="twitter:domain" content="medrunner.sc-market.space">',
    )
    for (const tag of [
      '<link rel="canonical" href="https://sc-market.space/contractor/MEDRUNNER">',
      '<meta property="og:url" content="https://sc-market.space/contractor/MEDRUNNER">',
      '<meta name="twitter:url" content="https://sc-market.space/contractor/MEDRUNNER">',
      '<script type="application/ld+json">{"url":"https://sc-market.space/contractor/MEDRUNNER"}</script>',
      '<meta property="og:image" content="https://sc-market.space/og.png">',
    ]) {
      expect(out).toContain(tag)
    }
    expect(out).not.toContain("https://medrunner.sc-market.space/")
  })

  it("adds no twitter:url of its own", () => {
    const out = whiteLabelPageHead(
      '<title>X</title><link rel="canonical" href="https://sc-market.space/market/abc">',
      options,
    )
    expect(out).not.toContain("twitter:url")
  })

  it("escapes the titles and keeps the tags' other markup", () => {
    const out = whiteLabelPageHead(
      '<title>Med &amp; Kits — 1M aUEC · Star Citizen | SC Market</title><meta data-hid="x" property="og:title" content="Med &amp; Kits" />',
      { ...options, orgName: "Medrunner <Ops>" },
    )
    expect(out).toContain(
      "<title>Medrunner &lt;Ops&gt; — Med &amp; Kits — 1M aUEC · Star Citizen · SC Market</title>",
    )
    expect(out).toContain(
      '<meta data-hid="x" property="og:title" content="Medrunner &lt;Ops&gt; — Med &amp; Kits · SC Market" />',
    )
  })

  it("replaces the head's own og:site_name and twitter:domain", () => {
    const out = whiteLabelPageHead(
      '<meta property="og:site_name" content="SC Market"><meta property="twitter:domain" content="sc-market.space">',
      options,
    )
    expect(out).toBe(
      '<meta property="og:site_name" content="MEDRUNNER SERVICES"><meta property="twitter:domain" content="medrunner.sc-market.space">',
    )
  })
})

describe("applyWhiteLabelHeadRules", () => {
  const options = {
    orgName: "MEDRUNNER SERVICES",
    origin: "https://medrunner.sc-market.space",
  }
  const head = (canonical: string): HeadTagModel[] => [
    { tag: "title", props: {}, textContent: "Page - SC Market" },
    { tag: "link", props: { rel: "canonical", href: canonical } },
    { tag: "meta", props: { property: "og:url", content: canonical } },
    { tag: "meta", props: { property: "og:title", content: "Page" } },
    {
      tag: "script",
      props: { type: "application/ld+json" },
      innerHTML: serializeJsonLd({ url: canonical }),
    },
  ]

  it.each([
    "/contractor/MEDRUNNER",
    "/shops/medrunner-kits",
    "/market/abc-med-pen",
    "/market",
    "/",
  ])("keeps %s's URLs on sc-market.space, branded", (path) => {
    const url = `https://sc-market.space${path}`
    const tags = head(url)
    const added = applyWhiteLabelHeadRules(tags, options)
    expect(tags[1].props.href).toBe(url)
    expect(tags[2].props.content).toBe(url)
    expect(JSON.parse(tags[4].innerHTML!)).toEqual({ url })
    expect(tags[0].textContent).toBe("MEDRUNNER SERVICES — Page · SC Market")
    expect(tags[3].props.content).toBe("MEDRUNNER SERVICES — Page · SC Market")
    expect(added).toEqual([
      {
        tag: "meta",
        props: { property: "og:site_name", content: "MEDRUNNER SERVICES" },
      },
      {
        tag: "meta",
        props: {
          property: "twitter:domain",
          content: "medrunner.sc-market.space",
        },
      },
    ])
  })
})
