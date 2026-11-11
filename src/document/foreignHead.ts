/**
 * Structured data a static page brought for another host.
 *
 * Cloudflare Pages serves the prerendered files (the homepage "/", the game
 * data hubs, the guides) for every host, so an org's white-label domain gets
 * the main site's page there, with SC Market's own JSON-LD in <head>
 * (Organization/WebSite, the homepage FAQ). The app renders such a page from
 * scratch, and on an org's domain it never renders those nodes itself (the
 * Footer leaves out the site JSON-LD, the landing page redirects to the
 * org's page), so Unhead never adopts the static scripts and nothing would
 * ever remove them: they stayed in <head> after the redirect. entry.client
 * removes them before the first render; the org's page adds its own.
 */
export function removeStaticJsonLd(doc: Document = document): void {
  for (const node of Array.from(
    doc.head.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    node.remove()
  }
}
