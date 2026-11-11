import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createHead, renderDOMHead } from "@unhead/react/client"
import { applyTitleTemplate, serializeJsonLd } from "../pageHead"
import { whiteLabelHeadPlugin } from "../whiteLabelHeadPlugin"
import type { ResolvableHead } from "unhead/types"

const OPTIONS = {
  orgName: "MEDRUNNER",
  origin: "https://medrunner.sc-market.space",
  mainOrigin: "https://sc-market.space",
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

    const host = "https://medrunner.sc-market.space/contractor/MEDRUNNER"
    expect(document.title).toBe("MEDRUNNER - Org")
    expect(canonical()).toEqual([host])
    expect(meta("og:url")).toEqual([host])
    expect(meta("twitter:url")).toEqual([host])
    expect(meta("og:title")).toEqual(["MEDRUNNER - Org"])
    expect(meta("twitter:title")).toEqual(["MEDRUNNER - Org"])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
    // The shell's own tag, replaced rather than duplicated.
    expect(meta("twitter:domain")).toEqual(["medrunner.sc-market.space"])
    expect(jsonLd()).toEqual([{ "@type": "Organization", url: host }])
  })

  it("adopts a server render's tags without duplicating them", () => {
    const host = "https://medrunner.sc-market.space/contractor/MEDRUNNER"
    // What the SSR `host` variant sent (whiteLabelPageHead).
    document.head.innerHTML = `
      <title>MEDRUNNER - Org</title>
      <link rel="canonical" href="${host}">
      <meta property="og:title" content="MEDRUNNER - Org">
      <meta property="og:url" content="${host}">
      <meta name="twitter:url" content="${host}">
      <meta name="twitter:title" content="MEDRUNNER - Org">
      <script type="application/ld+json">${serializeJsonLd({ "@type": "Organization", url: host })}</script>
      <meta property="og:site_name" content="MEDRUNNER">
      <meta property="twitter:domain" content="medrunner.sc-market.space">`
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => OPTIONS)],
    })
    head.push(orgPageHead())
    renderDOMHead(head)

    expect(canonical()).toEqual([host])
    expect(meta("og:url")).toEqual([host])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
    expect(meta("twitter:domain")).toEqual(["medrunner.sc-market.space"])
    expect(jsonLd()).toEqual([{ "@type": "Organization", url: host }])
  })

  it("keeps a page that isn't the org's own on sc-market.space", () => {
    const head = createHead({
      init: [{ titleTemplate: applyTitleTemplate }],
      plugins: [whiteLabelHeadPlugin(() => OPTIONS)],
    })
    head.push(orgPageHead("https://sc-market.space/contracts"))
    renderDOMHead(head)

    expect(canonical()).toEqual(["https://sc-market.space/contracts"])
    expect(meta("og:url")).toEqual(["https://sc-market.space/contracts"])
    expect(meta("og:title")).toEqual(["MEDRUNNER - Org"])
    expect(meta("og:site_name")).toEqual(["MEDRUNNER"])
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
