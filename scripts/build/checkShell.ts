/**
 * Sanity checks on the built HTML shell (dist/index.html), which Cloudflare
 * Pages serves for every app path and the edge bridge rewrites.
 */
export function shellProblems(html: string): string[] {
  const problems: string[] = []
  for (const tag of html.match(/<script\b[^>]*>/gi) ?? []) {
    if (!/\bdata-cfasync="false"/.test(tag))
      problems.push(`script without data-cfasync="false": ${tag}`)
  }
  // The edge bridge appends its summary here (src/bridge/render.ts).
  if (!/<div id="root">/.test(html)) problems.push('no <div id="root">')
  if (!html.includes("window.__reactRouterContext"))
    problems.push("no React Router bootstrap (<Scripts />)")
  if (!html.includes("scmarket_asset_reload_attempts"))
    problems.push("no inline asset-reload guard")
  if (!/<link rel="manifest" href="\/manifest\.webmanifest"/.test(html))
    problems.push("no web manifest link")
  if (
    !/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"/.test(html) &&
    !/<style data-inlined-from="\/assets\/[^"]+\.css">/.test(html)
  )
    problems.push("no app stylesheet")
  if (/<!--app-(head|html)-->/.test(html))
    problems.push("unfilled document.html marker")
  return problems
}

export function checkShell(html: string): void {
  const problems = shellProblems(html)
  if (problems.length > 0)
    throw new Error(`dist/index.html:\n- ${problems.join("\n- ")}`)
}
