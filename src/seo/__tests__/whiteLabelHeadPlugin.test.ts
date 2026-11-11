import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createHead, renderDOMHead } from "@unhead/react/client"
import { applyTitleTemplate, serializeJsonLd } from "../pageHead"
import { whiteLabelHeadPlugin } from "../whiteLabelHeadPlugin"
import type { ResolvableHead } from "unhead/types"

const OPTIONS = {
  orgName: "MEDRUNNER",
  origin: "https://medrunner.sc-market.space",
}

// The shell's (src/document/document.html) tags the pages' heads replace.
const SHELL = `
  <meta property="og:url" content="https://sc-market.space/" />
  <meta property="og:title" content="SC Market" />
  <meta property="twitter:domain" content="sc-market.space" />
  <meta property="twitter:url" content="https://sc-market.space/" />
  <meta name="twitter:title" content="SC Market" />
  <title>SC Market</title>`

const ORG_URL = "https://sc-market.space/contractor/MEDRUNNER"

/** The org page's head as SeoHead pushes it. */
const orgPageHead = (url = ORG_URL): ResolvableHead => ({
  title: "MEDRUNNER - Org",
  link: [{ rel: "canonical" as const, href: url }],
  meta: [
    { property: "og:title", content: "MEDRUNNER - Org - SC Market" },
    { property: "og:url", content: url },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: "MEDRUNNER - Org - SC Market" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: serializeJsonLd({ "@type": "Organization", url }),
    },
  ],
})

function meta(key: string): string[] {
  return Array.from(
    document.head.querySelectorAll(
      `meta[property="${key}"], meta[name="${key}"]`,
    ),
  ).map((m) => m.getAttribute("content") ?? "")
}

function canonical(): string[] {
  return Array.from(
    document.head.querySelectorAll('link[rel="canonical"]'),
  ).map((l) => l.getAttribute("href") ?? "")
}

function jsonLd(): unknown[] {
  return Array.from(
    document.head.querySelectorAll('script[type="application/ld+json"]'),
  ).map((s) => JSON.parse(s.textContent ?? ""))
}

describe("whiteLabelHeadPlugin", () => {
  beforeEach(() => {
    document.head.innerHTML = SHELL
    document.title = "SC Market"
  })
  afterEach(() => {
    document.head.innerHTML = ""
  })

  it("gives a page rendered from scratch the server render's head rules", () => {
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => OPTIONS)],
    })
    head.push(orgPageHead())
    renderDOMHead(head)

    expect(document.title).toBe("MEDRUNNER — Org · SC Market")
    // URLs stay on sc-market.space: one site for search engines.
    expect(canonical()).toEqual([ORG_URL])
    expect(meta("og:url")).toEqual([ORG_URL])
    expect(meta("twitter:url")).toEqual([ORG_URL])
    expect(meta("og:title")).toEqual(["MEDRUNNER — Org · SC Market"])
    expect(meta("twitter:title")).toEqual(["MEDRUNNER — Org · SC Market"])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
    // The shell's own tag, replaced rather than duplicated.
    expect(meta("twitter:domain")).toEqual(["medrunner.sc-market.space"])
    expect(jsonLd()).toEqual([{ "@type": "Organization", url: ORG_URL }])
  })

  it("adopts a server render's tags without duplicating them", () => {
    // What the SSR `host` variant sent (whiteLabelPageHead).
    document.head.innerHTML = `
      <title>MEDRUNNER — Org · SC Market</title>
      <link rel="canonical" href="${ORG_URL}">
      <meta property="og:title" content="MEDRUNNER — Org · SC Market">
      <meta property="og:url" content="${ORG_URL}">
      <meta name="twitter:url" content="${ORG_URL}">
      <meta name="twitter:title" content="MEDRUNNER — Org · SC Market">
      <script type="application/ld+json">${serializeJsonLd({ "@type": "Organization", url: ORG_URL })}</script>
      <meta property="og:site_name" content="MEDRUNNER">
      <meta property="twitter:domain" content="medrunner.sc-market.space">`
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => OPTIONS)],
    })
    head.push(orgPageHead())
    renderDOMHead(head)

    expect(document.title).toBe("MEDRUNNER — Org · SC Market")
    expect(canonical()).toEqual([ORG_URL])
    expect(meta("og:url")).toEqual([ORG_URL])
    expect(meta("og:title")).toEqual(["MEDRUNNER — Org · SC Market"])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
    expect(meta("twitter:domain")).toEqual(["medrunner.sc-market.space"])
    expect(jsonLd()).toEqual([{ "@type": "Organization", url: ORG_URL }])
  })

  it("brands a page already showing once the org is known (invalidate)", () => {
    let options: typeof OPTIONS | null = null
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => options)],
    })
    // The static "/" before the domain answer is in.
    head.push({
      title: "SC Market — Star Citizen Trading Marketplace",
      meta: [
        {
          property: "og:title",
          content: "SC Market — Star Citizen Trading Marketplace",
        },
      ],
    })
    renderDOMHead(head)
    expect(document.title).toBe("SC Market — Star Citizen Trading Marketplace")

    options = OPTIONS
    head.invalidate()
    renderDOMHead(head)
    expect(document.title).toBe(
      "MEDRUNNER — Star Citizen Trading Marketplace · SC Market",
    )
    expect(meta("og:title")).toEqual([
      "MEDRUNNER — Star Citizen Trading Marketplace · SC Market",
    ])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
  })

  it("marks a members-only or internal domain's page noindex once its domain answer is in", () => {
    let options: (typeof OPTIONS & { noindex: boolean }) | null = null
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => options)],
    })
    // The static "/" before the domain answer is in.
    head.push({ title: "SC Market — Star Citizen Trading Marketplace" })
    renderDOMHead(head)
    expect(meta("robots")).toEqual([])

    options = { ...OPTIONS, noindex: true }
    head.invalidate()
    renderDOMHead(head)
    expect(meta("robots")).toEqual(["noindex, nofollow"])

    // A page with robots of its own (a query variant's noindex): one tag.
    head.push({ meta: [{ name: "robots", content: "noindex" }] })
    renderDOMHead(head)
    expect(meta("robots")).toEqual(["noindex, nofollow"])
  })

  it("leaves a public domain's pages indexable", () => {
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => ({ ...OPTIONS, noindex: false }))],
    })
    head.push(orgPageHead())
    renderDOMHead(head)
    expect(meta("robots")).toEqual([])
  })

  it("leaves the head alone until the org is known", () => {
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => null)],
    })
    head.push(orgPageHead())
    renderDOMHead(head)

    expect(document.title).toBe("MEDRUNNER - Org - SC Market")
    expect(canonical()).toEqual([ORG_URL])
    expect(meta("og:title")).toEqual(["MEDRUNNER - Org - SC Market"])
    expect(meta("og:site_name")).toEqual([])
    expect(meta("twitter:domain")).toEqual(["sc-market.space"])
  })

  it("on the main site (no plugin) the head is the pages' own", () => {
    const head = createHead({ init: [{ titleTemplate: applyTitleTemplate }] })
    head.push(orgPageHead())
    renderDOMHead(head)

    expect(document.title).toBe("MEDRUNNER - Org - SC Market")
    expect(canonical()).toEqual([ORG_URL])
    expect(meta("og:url")).toEqual([ORG_URL])
    expect(meta("twitter:url")).toEqual([ORG_URL])
    expect(meta("og:title")).toEqual(["MEDRUNNER - Org - SC Market"])
    expect(meta("og:site_name")).toEqual([])
    expect(meta("twitter:domain")).toEqual(["sc-market.space"])
  })
})
