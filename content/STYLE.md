# Writing Help & Guides

Content here is compiled at build time (`src/features/help/build/compile.ts`)
into the pages under `/guides` and `/about`. A content error fails the build.

## Files

- `guides/categories.json`: the categories (id, title, description, order).
- `guides/<category>/<slug>.md`: one guide. The file name is the URL slug.
- `guides/<category>/<slug>.<locale>.md`: a translation of it (see
  "Translations" below).
  Keep categories balanced (about 3-5 guides each) so the hub's columns stay even.
- Moving or renaming a guide or category changes its URL: add the old path to
  `src/features/help/domain/redirects.ts` (it 301s to the new one; the build
  fails if an old path is still a page or a new one isn't) and update the links.
- `about.md`: the About page.
- Screenshots: `guides/<category>/img/<name>.webp`, at most 3-4 per guide.
- `changelog/<YYYY-MM-DD>.md`: one changelog entry (a release or a week),
  at `/changelog/<YYYY-MM-DD>`. See "Changelog" below.

## Frontmatter

```yaml
title: Buy an item # required, task-shaped
description: First sentence… # required, at most 160 characters
order: 10 # sort order within the category
updated: 2026-10-25 # required; shown on the page, sitemap lastmod
author: Khuzdul # optional (default Khuzdul)
keywords: [buy, cart] # optional
related: [buying/how-orders-work] # optional "Next steps" (guide ids)
howto: true # optional: HowTo JSON-LD from "## Steps"
draft: true # optional: only shown by the dev server
```

Each key is one line, lists included (`[a, b]`). Prettier rewraps a long
`keywords` list over several lines, which the build rejects: keep the
frontmatter as written when you format a guide.

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

## Translations

English is the source. A translation is a file next to the English guide,
named after one of the shipped locales: `de`, `es`, `fr`, `ja`, `uk`,
`zh-CN`, `zh-TW`.

```text
guides/buying/buy-an-item.md        English (the source)
guides/buying/buy-an-item.de.md     German
guides/buying/buy-an-item.zh-TW.md  Traditional Chinese
```

Frontmatter of a translation:

```yaml
title: Einen Artikel kaufen # required, translated
description: … # required, translated, at most 160 characters
source_hash: 1a2b3c4d5e6f # required: the English body it was translated from
updated: 2026-11-06 # optional (default: the English guide's)
keywords: [kaufen, warenkorb] # optional
```

Everything else (`order`, `related`, `howto`, `author`, `draft`) comes from
the English guide and isn't allowed here.

Workflow:

1. Run `npm run content:translations` (`-- --locale de` for one language).
   It lists every guide with its current `source_hash` and, per locale,
   whether the translation is missing, stale or up to date.
2. Translate the English body. Keep the same headings in the same order
   (they keep the English anchors, so links like `#post-a-buy-order` still
   work, and the list under the "Steps" heading's place is the HowTo), and
   the same links and screenshots. Bold UI labels must be the label the
   app shows in that language (`src/locales/<locale>/…json`).
3. Set `source_hash` to the value the script printed for that guide.
4. When the English guide changes, its hash changes and every translation
   of it becomes stale: the script lists it as stale until you update the
   translation and its `source_hash`.

What visitors and crawlers get:

- A translation is published only while its `source_hash` matches the
  English body. Missing and stale translations are never shown: visitors
  in that language get the English guide with a "This guide isn't
  translated yet; showing English." notice.
- A published translation is served on the guide's URL with `?lng=<locale>`
  (`/guides/buying/buy-an-item?lng=de`), the same `?lng` the whole site
  reads the language from. That URL has the translated title, description,
  `<html lang>` and canonical, and the guide lists every published language
  as `hreflang` alternates (with `x-default`, the English page). Guides
  without a published translation have no alternates.
- The sitemap manifest lists each published translation's URL with its
  language and alternates.
- The guides hub, categories and the About page are English only.

## Changelog

Each entry is written for users, not developers: what changed for them, in
plain words. Leave out internal refactors, and never describe a security fix
in a way that helps an attacker. Entry text is English only.

```yaml
title: Price alerts and a faster market # required
date: 2026-11-02 # required; the file name, never in the future once published
summary: One or two sentences… # required, at most 160 characters (meta/OG, index card)
tags: [market, orders] # optional
status: draft # required: draft or published
```

Only `status: published` entries are built. A draft is dropped before
anything reads its body: it is not in the bundle, the prerendered pages,
the sitemap manifest or `/changelog.xml`, not even hidden (the dev server
shows drafts so they can be previewed). To publish an entry, change its
`status` to `published` and push. Until one is published, `/changelog`
shows an empty state and is noindex.
