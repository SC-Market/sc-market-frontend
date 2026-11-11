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

describe("applyWhiteLabelTitle (an org's white-label subdomain)", () => {
  it("is '<Org> — <page>' without SC Market's suffix", () => {
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market")).toBe(
      "Blackwell Inc. — Market",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", "Market - SC Market")).toBe(
      "Blackwell Inc. — Market",
    )
    expect(
      applyWhiteLabelTitle(
        "Blackwell Inc.",
        "Aurora MR — Star Citizen Ship | SC Market",
      ),
    ).toBe("Blackwell Inc. — Aurora MR — Star Citizen Ship")
  })

  it("keeps a title that already starts with the org, and is the org without one", () => {
    expect(
      applyWhiteLabelTitle(
        "Blackwell Inc.",
        "Blackwell Inc. - Org - SC Market",
      ),
    ).toBe("Blackwell Inc. - Org")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "")).toBe("Blackwell Inc.")
    expect(applyWhiteLabelTitle("Blackwell Inc.", "SC Market")).toBe(
      "Blackwell Inc.",
    )
    expect(applyWhiteLabelTitle("Blackwell Inc.", null)).toBe("Blackwell Inc.")
  })
})

describe("whiteLabelPageHead", () => {
  const options = {
    orgName: "MEDRUNNER SERVICES",
    origin: "https://medrunner.sc-market.space",
    mainOrigin: "https://sc-market.space",
  }
  const TAGS = [
    "<title>MEDRUNNER SERVICES - Org - SC Market</title>",
    '<link rel="canonical" href="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta property="og:title" content="MEDRUNNER SERVICES - SC Market">',
    '<meta property="og:url" content="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta property="og:image" content="https://sc-market.space/og.png">',
    '<meta name="twitter:url" content="https://sc-market.space/contractor/MEDRUNNER">',
    '<meta name="twitter:title" content="Med &amp; Kits - SC Market">',
    '<script type="application/ld+json">{"url":"https://sc-market.space/contractor/MEDRUNNER","brand":{"url":"https://sc-market.space/contractor/MEDRUNNER/about"}}</script>',
  ].join("")

  it("puts the page's own URL on the org's host and brands the titles", () => {
    const out = whiteLabelPageHead(TAGS, options)
    expect(out).toContain("<title>MEDRUNNER SERVICES - Org</title>")
    expect(out).toContain(
      '<link rel="canonical" href="https://medrunner.sc-market.space/contractor/MEDRUNNER">',
    )
    expect(out).toContain(
      '<meta property="og:url" content="https://medrunner.sc-market.space/contractor/MEDRUNNER">',
    )
    expect(out).toContain(
      '<meta name="twitter:url" content="https://medrunner.sc-market.space/contractor/MEDRUNNER">',
    )
    expect(out).toContain(
      '{"url":"https://medrunner.sc-market.space/contractor/MEDRUNNER"',
    )
    expect(out).toContain(
      '<meta property="og:title" content="MEDRUNNER SERVICES">',
    )
    expect(out).toContain(
      '<meta name="twitter:title" content="MEDRUNNER SERVICES — Med &amp; Kits">',
    )
    expect(out).toContain(
      '<meta property="og:site_name" content="MEDRUNNER SERVICES">',
    )
    expect(out).toContain(
      '<meta property="twitter:domain" content="medrunner.sc-market.space">',
    )
    // Other URLs stay: images, other pages.
    expect(out).toContain('content="https://sc-market.space/og.png"')
    expect(out).toContain(
      '"url":"https://sc-market.space/contractor/MEDRUNNER/about"',
    )
    expect(out).not.toContain(
      'content="https://sc-market.space/contractor/MEDRUNNER"',
    )
  })

  it("adds twitter:url when the page has none, replacing the shell's", () => {
    const out = whiteLabelPageHead(
      '<title>X</title><link rel="canonical" href="https://sc-market.space/market/abc">',
      options,
    )
    expect(out).toContain(
      '<meta name="twitter:url" content="https://medrunner.sc-market.space/market/abc">',
    )
  })

  it("leaves a canonical on another origin alone", () => {
    const out = whiteLabelPageHead(
      '<link rel="canonical" href="https://elsewhere.test/x">',
      options,
    )
    expect(out).toContain('href="https://elsewhere.test/x"')
    expect(out).not.toContain("twitter:url")
  })

  it("escapes the titles and keeps the tags' other markup", () => {
    const out = whiteLabelPageHead(
      '<title>Med &amp; Kits — 1M aUEC · Star Citizen | SC Market</title><meta data-hid="x" property="og:title" content="Med &amp; Kits" />',
      { ...options, orgName: "Medrunner <Ops>" },
    )
    expect(out).toContain(
      "<title>Medrunner &lt;Ops&gt; — Med &amp; Kits — 1M aUEC · Star Citizen</title>",
    )
    expect(out).toContain(
      '<meta data-hid="x" property="og:title" content="Medrunner &lt;Ops&gt; — Med &amp; Kits" />',
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
    mainOrigin: "https://sc-market.space",
  }
  const head = (canonical: string): HeadTagModel[] => [
    { tag: "title", props: {}, textContent: "Page - SC Market" },
    { tag: "link", props: { rel: "canonical", href: canonical } },
    { tag: "meta", props: { property: "og:url", content: canonical } },
    { tag: "meta", props: { property: "og:title", content: "Page" } },
  ]

  it.each([
    "/contractor/MEDRUNNER",
    "/contractor/MEDRUNNER/about",
    "/shops/medrunner-kits",
    "/market/abc-med-pen",
  ])("puts the org's own page %s on the host", (path) => {
    const tags = head(`https://sc-market.space${path}`)
    const added = applyWhiteLabelHeadRules(tags, options)
    expect(tags[1].props.href).toBe(`https://medrunner.sc-market.space${path}`)
    expect(tags[2].props.content).toBe(
      `https://medrunner.sc-market.space${path}`,
    )
    expect(added).toContainEqual({
      tag: "meta",
      props: {
        name: "twitter:url",
        content: `https://medrunner.sc-market.space${path}`,
      },
    })
  })

  it.each(["/market", "/contracts", "/market/cart", "/"])(
    "keeps %s's URLs on sc-market.space, branded",
    (path) => {
      const tags = head(`https://sc-market.space${path}`)
      const added = applyWhiteLabelHeadRules(tags, options)
      expect(tags[1].props.href).toBe(`https://sc-market.space${path}`)
      expect(tags[2].props.content).toBe(`https://sc-market.space${path}`)
      expect(tags[0].textContent).toBe("MEDRUNNER SERVICES — Page")
      expect(tags[3].props.content).toBe("MEDRUNNER SERVICES — Page")
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
    },
  )

  it("rewrites the JSON-LD's page URL, serialized, and no other", () => {
    const url = "https://sc-market.space/market/a?b=1&c=2"
    const tags: HeadTagModel[] = [
      { tag: "link", props: { rel: "canonical", href: url } },
      {
        tag: "script",
        props: { type: "application/ld+json" },
        innerHTML: serializeJsonLd({
          url,
          seller: "https://sc-market.space/contractor/MEDRUNNER",
        }),
      },
    ]
    applyWhiteLabelHeadRules(tags, options)
    expect(JSON.parse(tags[1].innerHTML!)).toEqual({
      url: "https://medrunner.sc-market.space/market/a?b=1&c=2",
      seller: "https://sc-market.space/contractor/MEDRUNNER",
    })
  })
})
