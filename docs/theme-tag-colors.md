# Tag colours

Pages with lots of tags (blueprints, missions, wiki items, mining) use colour
to help people scan. Each colour means one thing: a tag **type** always has
the same colour wherever it appears.

- Code: `src/hooks/styles/theme/tagPalette.ts` (the palette) and
  `src/components/tags/tagColors.ts` (tag type -> colour). Draw tags with
  `<TagChip tag="category" … />`; never pick a tag colour at a call site.
- Style: soft tint fill, coloured text, 1px border (`TagChip`). Rarity is a
  filled chip on the quality scale.
- Tests: `src/hooks/styles/theme/__tests__/tagPalette.test.ts` (AA in every
  theme) and `src/components/tags/__tests__/TagChip.test.tsx` (each type
  renders its mapped colour).

## The palette (`palette.tag`)

Eight categorical hues plus the two meaning colours, each with `text`,
`border`, `tint` and `hover`:

`blue`, `cyan`, `amber`, `orange`, `pink`, `magenta`, `lime`, `slate`,
`positive` (from `success`, green), `negative` (from `error`, red).

They avoid the colours that already mean something: green is the accent and
"owned/positive", violet (`palette.secondary`) is the buy side and premium,
red is error/illegal, and rarity/quality have the quality scale
(`util/qualityColor`). Teal is left out because it reads as the emerald
accent.

### Derived per theme

`createAppTheme` sets `palette.tag` on every theme (presets and org themes
included) from that theme's own paper and page:

- `tint` = paper mixed with the hue (16% dark, 10% light); `hover` 26% / 18%.
- `text` = the hue, nudged towards white (dark themes) or black (light) until
  it is at least 4.5:1 on the tint, the hover, paper and the page.
- `border` = paper mixed 60% / 55% with the hue, nudged until it is at least
  3:1 on paper and the page.

Dark themes start from a light seed and light themes from a deep one, so the
hue survives the nudging. A theme whose surfaces the contrast maths can't read
(a gradient or `url()` paper) is derived against the base dark or light
surfaces. No preset needs hand-set values; the test fails if one ever does.

### Base values

#### Default dark theme (paper #111828)

| token    | text    | border  | tint    | text on tint/hover | text/paper | border/paper |
| -------- | ------- | ------- | ------- | ------------------ | ---------- | ------------ |
| blue     | #74b4ff | #4c76a9 | #21314a | 4.79               | 8.20       | 3.77         |
| cyan     | #4fd3ee | #36889f | #1b3648 | 5.48               | 10.03      | 4.37         |
| amber    | #f4c24d | #997e3e | #35332e | 5.81               | 10.69      | 4.56         |
| orange   | #ff9a57 | #a06644 | #372d30 | 5.04               | 8.45       | 3.78         |
| pink     | #ff8fc0 | #a05f83 | #372b40 | 4.98               | 8.39       | 3.76         |
| magenta  | #e58cf5 | #905ea3 | #332b49 | 4.79               | 7.93       | 3.64         |
| lime     | #b5dd4f | #738e3f | #2b382e | 5.98               | 11.32      | 4.78         |
| slate    | #a7b4c8 | #6b7688 | #293142 | 4.89               | 8.44       | 3.86         |
| positive | #66bb6a | #447a50 | #1f3233 | 4.61               | 7.49       | 3.50         |
| negative | #f77268 | #a8514f | #351f2a | 4.77               | 6.38       | 3.34         |

#### Light theme (paper #ffffff)

| token    | text    | border  | tint    | text on tint/hover | text/paper | border/paper |
| -------- | ------- | ------- | ------- | ------------------ | ---------- | ------------ |
| blue     | #1858b5 | #7393c1 | #e8eef8 | 5.12               | 6.77       | 3.15         |
| cyan     | #0a6980 | #6796a1 | #e7f1f3 | 4.83               | 6.28       | 3.25         |
| amber    | #8a5a00 | #a28b62 | #f3efe6 | 4.57               | 5.93       | 3.28         |
| orange   | #a9420b | #b58267 | #f7ece7 | 4.65               | 6.05       | 3.31         |
| pink     | #af2769 | #c27b9e | #f8eaf1 | 4.74               | 6.33       | 3.17         |
| magenta  | #9a2fae | #b37fbd | #f5eaf7 | 4.68               | 6.19       | 3.14         |
| lime     | #4d6b06 | #859464 | #edf0e6 | 4.73               | 6.14       | 3.27         |
| slate    | #4a5568 | #8c929b | #edeef0 | 5.69               | 7.53       | 3.13         |
| positive | #29712d | #779c79 | #eaf2eb | 4.72               | 6.01       | 3.08         |
| negative | #be2a2a | #c47878 | #fbeaea | 4.50               | 5.91       | 3.33         |

Ratios are the worst case (text: tint and hover; text and border: paper and
page). Every preset is derived the same way; its worst cases are at least
4.50:1 for text and 3.00:1 for borders.

## Tag type -> colour

| Tag type       | Colour                 | Where                                                                     |
| -------------- | ---------------------- | ------------------------------------------------------------------------- |
| `owned`        | `positive` (green)     | Blueprints (owned, default)                                               |
| `reward`       | `positive` (green)     | Mission blueprint rewards                                                 |
| `illegal`      | `negative` (red)       | Missions                                                                  |
| `rarity`       | quality scale (filled) | Blueprints, wiki crafting recipes, mining ores                            |
| `category`     | `blue`                 | Blueprint item category, mission type, wiki item type, location type      |
| `tier`         | `amber`                | Blueprint tier, wiki grade, mission difficulty, lot blueprint tier        |
| `modifier`     | `magenta`              | Blueprint quality modifiers                                               |
| `location`     | `cyan`                 | Mission star system, mining systems and locations                         |
| `faction`      | `orange`               | Mission giver                                                             |
| `event`        | `pink`                 | Mission live event                                                        |
| `size`         | `lime`                 | Wiki item size                                                            |
| `source`       | `slate`                | Default blueprint source, resource acquisition method, lot crafted source |
| `trait`        | `slate`                | Mission unique / chain / starter / shareable, refinery and amenities      |
| `discount`     | `orange`               | Listing bulk discount                                                     |
| `manufacturer` | neutral (outlined)     | Blueprints, wiki items: on nearly everything, so colour would be noise    |

`orange` and `slate` are each shared by two types that never appear on the
same surface. Quality values and tiers outside tags (resource quality bands,
lot quality tier) use the quality scale through `qualityTagSx`.

Status chips are not tags and keep their status colours: out of stock
(error), internal listing (warning), new (neutral).
