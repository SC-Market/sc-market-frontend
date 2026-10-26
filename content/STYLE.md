# Writing Help & Guides

Content here is compiled at build time (`src/features/help/build/compile.ts`)
into the pages under `/guides` and `/about`. A content error fails the build.

## Files

- `guides/categories.json`: the categories (id, title, description, order).
- `guides/<category>/<slug>.md`: one guide. The file name is the URL slug.
  Keep categories balanced (about 3-5 guides each) so the hub's columns stay even.
- Moving or renaming a guide or category changes its URL: add the old path to
  `src/features/help/domain/redirects.ts` (it 301s to the new one; the build
  fails if an old path is still a page or a new one isn't) and update the links.
- `about.md`: the About page.
- Screenshots: `guides/<category>/img/<name>.webp`, at most 3-4 per guide.

## Frontmatter

```yaml
title: Buy an item               # required, task-shaped
description: First sentence…     # required, at most 160 characters
order: 10                        # sort order within the category
updated: 2026-10-25              # required; shown on the page, sitemap lastmod
author: Khuzdul                  # optional (default Khuzdul)
keywords: [buy, cart]            # optional
related: [buying/how-orders-work] # optional "Next steps" (guide ids)
howto: true                      # optional: HowTo JSON-LD from "## Steps"
draft: true                      # optional: only shown by the dev server
```

## Style

- The first sentence answers the question. It usually doubles as `description`.
- One task per guide: "Before you start", then `## Steps` (a numbered list,
  imperative, one action each, exact UI labels in **bold**), then
  "What happens next".
- Keep it under ~600 words. Say aUEC, never real money. Don't speculate about
  game rules.
- Every claim must match the code. Check labels in
  `src/locales/en/english.json`.
- Link to routes (`[your cart](/market/cart)`) instead of describing the
  navigation. A test checks that every site link resolves to a real route.
- Callouts: `> [!TIP]`, `> [!NOTE]`, `> [!WARNING]`.
- Screenshot: `![Alt text](./img/x.webp "Caption: what to notice")` in its
  own paragraph.
- Button: `[Label](/path "cta")` in its own paragraph.
- No raw HTML, tables or `#` headings (the title is the page's only h1).
