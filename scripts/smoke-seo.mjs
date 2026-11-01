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
 * - a game item page's raw HTML has its "how to get" title and section
 *   (missions and blueprints linked, the CC BY 4.0 line, no Offer);
 * - mission hubs (3 of each kind: givers, factions, types, systems) and
 *   their index pages: real HTML as Googlebot gets it, title with the
 *   count, the generated intro, mission links, CollectionPage + ItemList +
 *   BreadcrumbList JSON-LD with dateModified; /missions links the indexes,
 *   ?page=2 of a big hub is self-canonical, and the sitemap lists the hubs;
 * - an unknown listing is a 404, a trailing slash a 301, /error noindex.
 * Exits 1 when any check fails.
 */
const SITE = (process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "https://sc-market.space").replace(/\/+$/, "")
const API = (process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "https://api.sc-market.space").replace(/\/+$/, "")
const MISSIONS_OPTIONAL = process.argv.includes("--missions-optional")

/** Sections the backend always builds (content and recruiting may be empty). */
const EXPECTED_SECTIONS = ["static", "market", "contractors", "shops", "wiki", "missions-hubs", "users"]

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
    const sections = [...res.body.matchAll(/sitemap-([a-z]+(?:-[a-z]+)*)-\d+\.xml/g)].map((m) => m[1])
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

/** Siebe Helmet: crafted from a blueprint a Rayari mission awards (stable game data). */
const ITEM_PATH = "/wiki/items/9bb3a108--siebe-helmet"

async function itemChecks() {
  const res = await get(`${SITE}${ITEM_PATH}`, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } })
  check(`item ${ITEM_PATH} returns 200`, res.status === 200, `status ${res.status}`)
  const title = res.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
  check("item <title> is the how-to-get query", /^How to Get .+ in Star Citizen \| SC Market$/.test(title), title)
  check("item HTML has the how-to-get section", res.body.includes("<h2>How to get Siebe Helmet</h2>"))
  check("item HTML links a mission that rewards it", /<a href="\/missions\/[^"]+">/.test(res.body))
  check("item HTML links its blueprint", /<a href="\/blueprints\/[^"]+">/.test(res.body))
  check("item HTML has the CC BY 4.0 attribution", res.body.includes("CC BY 4.0") && res.body.includes("/api/public/items/9bb3a108--siebe-helmet.json"))
  check("item JSON-LD has no Offer", !/"@type":"(Aggregate)?Offer"/.test(res.body))
}

const GOOGLEBOT = { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" } }
const HUB_KINDS = ["givers", "factions", "types", "systems"]
const jsonLdTypes = (html) =>
  [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/g)].flatMap((m) => {
    try {
      const node = JSON.parse(m[1])
      return [node["@type"], node.mainEntity?.["@type"]].filter(Boolean)
    } catch {
      return []
    }
  })

async function missionHubChecks() {
  const hubs = await (await fetch(`${API}/api/v2/game-data/missions/hubs`)).json()
  for (const kind of HUB_KINDS) {
    const list = hubs[kind] ?? []
    check(`API has ${kind} hubs`, list.length > 0, `${list.length} hubs`)
    const index = await get(`${SITE}/missions/${kind}`, GOOGLEBOT)
    check(`/missions/${kind} returns 200`, index.status === 200, `status ${index.status}`)
    const indexTitle = index.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
    check(`/missions/${kind} <title>`, / \| SC Market$/.test(indexTitle) && /Star Citizen/.test(indexTitle), indexTitle)
    const indexLinks = list.filter((h) => index.body.includes(`href="/missions/${kind}/${h.slug}"`)).length
    check(`/missions/${kind} links every hub`, indexLinks === list.length, `${indexLinks}/${list.length}`)
    for (const hub of list.slice(0, 3)) {
      const path = `/missions/${kind}/${hub.slug}`
      const res = await get(`${SITE}${path}`, GOOGLEBOT)
      check(`${path} returns 200`, res.status === 200, `status ${res.status}`)
      const html = res.body.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'")
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
      check(`${path} <title> has the count`, title.includes(`Missions in Star Citizen (${hub.mission_count}) | SC Market`), title)
      check(`${path} canonical`, html.includes(`<link rel="canonical" href="${SITE}${path}">`))
      check(`${path} HTML has the intro`, html.includes(`${hub.mission_count.toLocaleString("en-US")} missions`))
      const missionLinks = new Set([...res.body.matchAll(/href="(\/missions\/[^"/?]+)"/g)].map((m) => m[1]).filter((h) => !HUB_KINDS.includes(h.split("/")[2])))
      check(`${path} links its missions`, missionLinks.size >= Math.min(20, hub.mission_count), `${missionLinks.size} mission links`)
      const types = jsonLdTypes(res.body)
      check(`${path} JSON-LD CollectionPage + ItemList + BreadcrumbList`, ["CollectionPage", "ItemList", "BreadcrumbList"].every((t) => types.includes(t)), types.join(", "))
      check(`${path} has dateModified and a freshness stamp`, /"dateModified":"\d{4}-/.test(res.body) && /Data from Star Citizen [^<]+ LIVE/.test(res.body))
    }
  }
  const missions = await get(`${SITE}/missions`, GOOGLEBOT)
  check("/missions links the hub indexes", HUB_KINDS.every((k) => missions.body.includes(`href="/missions/${k}"`)))
  const big = [...(hubs.types ?? [])].sort((a, b) => b.mission_count - a.mission_count)[0]
  if (big && big.mission_count > 100) {
    const path = `/missions/types/${big.slug}?page=2`
    const res = await get(`${SITE}${path}`, GOOGLEBOT)
    check(`${path} is self-canonical`, res.status === 200 && res.body.includes(`<link rel="canonical" href="${SITE}${path}">`) && !res.body.includes('content="noindex"'), `status ${res.status}`)
  }
  const index = await get(`${SITE}/sitemap.xml`)
  const loc = index.body.match(/<loc>([^<]*sitemap-missions-hubs-0\.xml)<\/loc>/)?.[1]
  check("sitemap index lists the mission hubs section", !!loc, loc ?? "missing")
  if (loc) {
    const section = await get(loc)
    const first = hubs.givers?.[0]
    check("mission hubs sitemap lists the hubs", section.status === 200 && section.body.includes(`/missions/givers</loc>`) && (!first || section.body.includes(`/missions/givers/${first.slug}</loc>`)), `status ${section.status}`)
  }
}

for (const step of [sitemapChecks, robotsChecks, listingChecks, itemChecks, notFoundChecks, missionChecks, missionHubChecks]) {
  try {
    await step()
  } catch (error) {
    check(step.name, false, error instanceof Error ? error.message : String(error))
  }
}
const failed = results.filter((r) => !r.ok && !r.optional)
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? `, ${failed.length} failed` : ""}`)
process.exit(failed.length ? 1 : 0)
