#!/usr/bin/env node
/**
 * Post-deploy SEO smoke check against the live site (run by hand after a
 * frontend or backend deploy; not part of CI):
 *
 *   node scripts/smoke-seo.mjs [https://sc-market.space] [https://api.sc-market.space]
 *
 * Checks what crawlers see without JavaScript:
 * - the sitemap index (API and main host) lists every expected section, and
 *   the main-host copy points at main-host section files;
 * - robots.txt points at the main-host sitemap, disallows /error and keeps
 *   AI crawlers allowed;
 * - a live listing's raw HTML has its title, price and at least 10 links;
 * - a mission page's raw HTML has its summary line, a freshness stamp and at
 *   least 10 links (once the missions work is live: reported, not fatal,
 *   until then with --missions-optional);
 * - an unknown listing is a 404, a trailing slash a 301, /error noindex.
 * Exits 1 when any check fails.
 */
const SITE = (process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "https://sc-market.space").replace(/\/+$/, "")
const API = (process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "https://api.sc-market.space").replace(/\/+$/, "")
const MISSIONS_OPTIONAL = process.argv.includes("--missions-optional")

/** Sections the backend always builds (content and recruiting may be empty). */
const EXPECTED_SECTIONS = ["static", "market", "contractors", "shops", "wiki", "users"]

const results = []
function check(name, ok, detail = "", optional = false) {
  results.push({ name, ok, detail, optional })
  console.log(`${ok ? "PASS" : optional ? "WARN" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`)
}

async function get(url, init = {}) {
  const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "scm-smoke-seo/1.0" }, ...init })
  const body = init.method === "HEAD" ? "" : await res.text()
  return { status: res.status, headers: res.headers, body }
}

const countLinks = (html) => (html.match(/<a\s[^>]*href="\/[^"]*"/g) ?? []).length

async function sitemapChecks() {
  for (const [label, base] of [["API", API], ["main host", SITE]]) {
    const res = await get(`${base}/sitemap.xml`)
    check(`${label} /sitemap.xml returns 200`, res.status === 200, `status ${res.status}`)
    const sections = [...res.body.matchAll(/sitemap-([a-z]+)-\d+\.xml/g)].map((m) => m[1])
    const missing = EXPECTED_SECTIONS.filter((s) => !sections.includes(s))
    check(`${label} sitemap index has every section`, missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : [...new Set(sections)].join(", "))
    if (base === SITE) {
      const locs = [...res.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
      check("main-host index lists main-host section files", locs.length > 0 && locs.every((l) => l.startsWith(`${SITE}/sitemap-`)), locs[0] ?? "no <loc>")
      if (locs[0]) {
        const section = await get(locs.find((l) => l.includes("sitemap-market-")) ?? locs[0])
        check("a main-host section file returns 200 XML", section.status === 200 && section.body.includes("<urlset"), `status ${section.status}`)
      }
    }
  }
}

async function robotsChecks() {
  const res = await get(`${SITE}/robots.txt`)
  check("robots.txt points at the main-host sitemap", res.body.includes(`Sitemap: ${SITE}/sitemap.xml`))
  check("robots.txt disallows /error", /^Disallow: \/error$/m.test(res.body))
  check("robots.txt keeps AI crawlers allowed", /ai-input=yes/.test(res.body) && !/User-agent: (GPTBot|ClaudeBot|Google-Extended)/.test(res.body))
}

async function listingChecks() {
  const search = await (await fetch(`${API}/api/v2/listings/search?page=1&page_size=5&quantity_min=1`)).json()
  const listing = search.listings?.[0]
  if (!listing) return check("a live listing to test", false, "search returned none")
  const prefix = listing.listing_id.replace(/-/g, "").slice(0, 8)
  const slug = listing.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").replace(/-{2,}/g, "-").slice(0, 60)
  const path = `/market/${prefix}--${slug}`
  const res = await get(`${SITE}${path}`)
  check(`listing ${path} returns 200`, res.status === 200, `status ${res.status}`)
  const decoded = res.body.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  check("listing HTML has its title", decoded.includes(listing.title))
  const price = Math.round(Number(listing.price_min)).toLocaleString("en-US")
  check("listing HTML has its price", decoded.includes(`${price} aUEC`), `${price} aUEC`)
  const title = decoded.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
  check("listing <title> has price and Star Citizen", /aUEC · Star Citizen \| SC Market$/.test(title), title)
  const links = countLinks(res.body)
  check("listing HTML has at least 10 links", links >= 10, `${links} links`)
  check("listing JSON-LD has no Offer", !/"@type":"(Aggregate)?Offer"/.test(res.body))

  const slash = await get(`${SITE}${path}/`)
  check("trailing slash 301s to the bare URL", slash.status === 301 && slash.headers.get("location") === `${SITE}${path}`, `${slash.status} → ${slash.headers.get("location")}`)
  const uuid = await get(`${SITE}/market/${listing.listing_id}`)
  check("bare UUID 301s to the slug URL", uuid.status === 301 && uuid.headers.get("location") === `${SITE}${path}`, `${uuid.status} → ${uuid.headers.get("location")}`)
}

async function notFoundChecks() {
  const gone = await get(`${SITE}/market/00000000-0000-0000-0000-000000000000`)
  check("unknown listing is a 404 with noindex", gone.status === 404 && gone.body.includes('content="noindex"'), `status ${gone.status}`)
  const tab = await get(`${SITE}/user/SCMarketSmokeNobody/market`)
  check("unknown user (tab) is a 404", tab.status === 404, `status ${tab.status}`)
  const error = await get(`${SITE}/error?message=x`)
  check("/error is noindex", /noindex/i.test(error.headers.get("x-robots-tag") ?? ""), `X-Robots-Tag: ${error.headers.get("x-robots-tag")}`)
  const query = await get(`${SITE}/market?text=gold`)
  check("search query variant is noindex", query.status === 200 && query.body.includes('content="noindex"'))
  const page2 = await get(`${SITE}/market?page=2`)
  check("?page=2 is self-canonical", page2.body.includes(`<link rel="canonical" href="${SITE}/market?page=2">`) && !page2.body.includes('content="noindex"'))
}

async function missionChecks() {
  const search = await (await fetch(`${API}/api/v2/game-data/missions/search?page=1&page_size=1`)).json()
  const mission = search.missions?.[0]
  if (!mission) return check("a mission to test", false, "search returned none", MISSIONS_OPTIONAL)
  const res = await get(`${SITE}/missions/${encodeURIComponent(mission.mission_code)}`)
  check("mission page returns 200", res.status === 200, `status ${res.status}`, MISSIONS_OPTIONAL)
  check("mission HTML has its summary line", / is an? (legal|illegal|lawful|unlawful)\b[^<]* mission /i.test(res.body), "", MISSIONS_OPTIONAL)
  check("mission HTML has a freshness stamp", /Data from Star Citizen [^<]+ LIVE, updated /.test(res.body), "", MISSIONS_OPTIONAL)
  const links = countLinks(res.body)
  check("mission HTML has at least 10 links", links >= 10, `${links} links`, MISSIONS_OPTIONAL)
}

for (const step of [sitemapChecks, robotsChecks, listingChecks, notFoundChecks, missionChecks]) {
  try {
    await step()
  } catch (error) {
    check(step.name, false, error instanceof Error ? error.message : String(error))
  }
}
const failed = results.filter((r) => !r.ok && !r.optional)
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? `, ${failed.length} failed` : ""}`)
process.exit(failed.length ? 1 : 0)
