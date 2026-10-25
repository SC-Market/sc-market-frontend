/**
 * Build-time compiler for Help & Guides content (/content/**). Runs in Node
 * (scripts/vite/contentPlugin.ts) and in tests; NEVER import it from app or
 * bridge code: it pulls in the Markdown parser.
 *
 * - Frontmatter: a strict YAML subset (`key: value`, `key: [a, b]`, quoted
 *   strings, numbers, booleans). Anything else is an error.
 * - Markdown: GFM via remark (both already ship with react-markdown), turned
 *   into the small Block tree in ../domain/types. Raw HTML, tables,
 *   reference links, h1 and other unsupported syntax fail the build with the
 *   file name, so content can't loosen what the renderer accepts.
 * - Callouts use GitHub alert syntax (`> [!TIP]`), screenshots are a
 *   paragraph holding one `![alt](./img/x.webp "caption")`, a CTA button is a
 *   paragraph holding one `[Label](/path "cta")`.
 */
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import type {
  BlockContent,
  DefinitionContent,
  ListItem,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast"
import { HELP_PATHS } from "../../../routes/paths"
import {
  inlineText,
  type AboutAsset,
  type AboutMeta,
  type Block,
  type CalloutKind,
  type CategoryAsset,
  type CategoryMeta,
  type ContentBody,
  type ContentIndex,
  type GuideAsset,
  type GuideMeta,
  type Inline,
  type SitemapManifest,
} from "../domain/types"

/** Byline when a page doesn't set `author`. */
export const DEFAULT_AUTHOR = "Khuzdul"
/** Meta descriptions longer than this get cut off in search results. */
export const MAX_DESCRIPTION_LENGTH = 160

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`)
    this.name = "ContentError"
  }
}

// ── Frontmatter ─────────────────────────────────────────────────────────────

export type FrontmatterValue = string | number | boolean | string[]

const KEY_LINE = /^([A-Za-z][\w-]*):\s*(.*)$/

function unquote(raw: string, file: string, line: number): string {
  const value = raw.trim()
  if (value.length >= 2 && (value[0] === '"' || value[0] === "'")) {
    if (value[value.length - 1] !== value[0]) {
      throw new ContentError(file, `line ${line}: unterminated string`)
    }
    return value.slice(1, -1)
  }
  return value
}

function parseValue(raw: string, file: string, line: number): FrontmatterValue {
  const value = raw.trim()
  if (value.startsWith("[")) {
    if (!value.endsWith("]")) throw new ContentError(file, `line ${line}: unterminated list`)
    const inner = value.slice(1, -1).trim()
    return inner === "" ? [] : inner.split(",").map((item) => unquote(item, file, line))
  }
  if (value === "true") return true
  if (value === "false") return false
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return unquote(value, file, line)
}

export function parseFrontmatter(
  source: string,
  file: string,
): { data: Record<string, FrontmatterValue>; body: string } {
  const text = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")
  if (!text.startsWith("---\n")) throw new ContentError(file, "missing frontmatter (--- block)")
  const end = text.indexOf("\n---\n", 3)
  if (end === -1) throw new ContentError(file, "unterminated frontmatter")
  const data: Record<string, FrontmatterValue> = {}
  const lines = text.slice(4, end).split("\n")
  lines.forEach((rawLine, i) => {
    const line = rawLine.trimEnd()
    if (line.trim() === "" || line.trimStart().startsWith("#")) return
    const match = KEY_LINE.exec(line)
    if (!match) throw new ContentError(file, `frontmatter line ${i + 2}: expected "key: value"`)
    const [, key, value] = match
    if (key in data) throw new ContentError(file, `frontmatter key "${key}" repeated`)
    data[key] = parseValue(value, file, i + 2)
  })
  return { data, body: text.slice(end + 5) }
}

const KNOWN_GUIDE_KEYS = new Set([
  "title",
  "description",
  "order",
  "updated",
  "author",
  "keywords",
  "related",
  "howto",
  "draft",
])
const KNOWN_ABOUT_KEYS = new Set(["title", "description", "updated", "author"])

function requireString(data: Record<string, FrontmatterValue>, key: string, file: string): string {
  const value = data[key]
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContentError(file, `frontmatter "${key}" is required (a string)`)
  }
  return value.trim()
}

function optionalString(
  data: Record<string, FrontmatterValue>,
  key: string,
  file: string,
): string | undefined {
  const value = data[key]
  if (value === undefined) return undefined
  if (typeof value !== "string") throw new ContentError(file, `frontmatter "${key}" must be a string`)
  return value.trim()
}

function stringList(data: Record<string, FrontmatterValue>, key: string, file: string): string[] {
  const value = data[key]
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new ContentError(file, `frontmatter "${key}" must be a [list]`)
  return value
}

function checkUnknownKeys(
  data: Record<string, FrontmatterValue>,
  known: ReadonlySet<string>,
  file: string,
) {
  for (const key of Object.keys(data)) {
    if (!known.has(key)) throw new ContentError(file, `unknown frontmatter key "${key}"`)
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function checkDescription(description: string, file: string) {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new ContentError(
      file,
      `description is ${description.length} characters (max ${MAX_DESCRIPTION_LENGTH})`,
    )
  }
}

function checkUpdated(updated: string, today: string, file: string) {
  if (!ISO_DATE.test(updated) || Number.isNaN(Date.parse(updated))) {
    throw new ContentError(file, `"updated" must be a YYYY-MM-DD date`)
  }
  if (updated > today) throw new ContentError(file, `"updated" (${updated}) is in the future`)
}

// ── Markdown → blocks ───────────────────────────────────────────────────────

const ALERT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/

export interface CompileOptions {
  /** Map a relative image src ("./img/x.webp") to the URL/placeholder to emit. */
  resolveImage?: (src: string) => string
}

export interface CompiledBody extends ContentBody {
  /** Site-relative link targets ("/market/cart"), for the link check. */
  links: string[]
  /** Relative image sources as written. */
  images: string[]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Site-relative ("/x", not "//x") or an https URL; in-page "#anchor". */
function checkHref(href: string, file: string): "internal" | "external" | "anchor" {
  if (/^\/(?![/\\])[^\s]*$/.test(href)) return "internal"
  if (/^https:\/\/[^\s]+$/.test(href)) return "external"
  if (/^#[a-z0-9-]+$/.test(href)) return "anchor"
  throw new ContentError(file, `link "${href}" must be site-relative (/path), https:// or #anchor`)
}

class BodyCompiler {
  private readonly ids = new Map<string, number>()
  readonly links: string[] = []
  readonly images: string[] = []

  constructor(
    private readonly file: string,
    private readonly options: CompileOptions,
  ) {}

  private fail(message: string): never {
    throw new ContentError(this.file, message)
  }

  private anchorId(text: string): string {
    const base = slugify(text) || "section"
    const seen = this.ids.get(base) ?? 0
    this.ids.set(base, seen + 1)
    return seen === 0 ? base : `${base}-${seen}`
  }

  inline(nodes: PhrasingContent[]): Inline[] {
    const out: Inline[] = []
    for (const node of nodes) {
      switch (node.type) {
        case "text":
          out.push({ t: "text", v: node.value })
          break
        case "strong":
          out.push({ t: "strong", c: this.inline(node.children) })
          break
        case "emphasis":
          out.push({ t: "em", c: this.inline(node.children) })
          break
        case "delete":
          out.push({ t: "del", c: this.inline(node.children) })
          break
        case "inlineCode":
          out.push({ t: "code", v: node.value })
          break
        case "break":
          out.push({ t: "br" })
          break
        case "link": {
          if (checkHref(node.url, this.file) === "internal") this.links.push(node.url)
          if (node.title) this.fail(`link titles are only allowed for CTAs ("${node.url}")`)
          out.push({ t: "link", href: node.url, c: this.inline(node.children) })
          break
        }
        case "image":
          this.fail(`images must be in a paragraph of their own ("${node.url}")`)
          break
        case "html":
          this.fail("raw HTML is not allowed")
          break
        default:
          this.fail(`unsupported inline syntax "${node.type}"`)
      }
    }
    return out
  }

  private image(src: string, alt: string, caption: string | null | undefined): Block {
    if (!/^\.\/img\/[\w.-]+\.(webp|png|jpg|jpeg)$/.test(src)) {
      this.fail(`screenshots must be local files in ./img/ ("${src}")`)
    }
    if (!alt.trim()) this.fail(`screenshot "${src}" needs alt text`)
    this.images.push(src)
    return {
      t: "img",
      src: this.options.resolveImage ? this.options.resolveImage(src) : src,
      alt: alt.trim(),
      ...(caption ? { caption } : {}),
    }
  }

  private paragraph(children: PhrasingContent[]): Block {
    const meaningful = children.filter((c) => !(c.type === "text" && c.value.trim() === ""))
    if (meaningful.length === 1) {
      const only = meaningful[0]
      if (only.type === "image") return this.image(only.url, only.alt ?? "", only.title)
      if (only.type === "link" && only.title === "cta") {
        if (checkHref(only.url, this.file) === "internal") this.links.push(only.url)
        const label = inlineText(this.inline(only.children)).trim()
        if (!label) this.fail(`CTA "${only.url}" needs a label`)
        return { t: "cta", href: only.url, label }
      }
    }
    return { t: "p", c: this.inline(children) }
  }

  private listItem(item: ListItem): Block[] {
    if (item.checked !== null && item.checked !== undefined) this.fail("task lists are not supported")
    return this.blocks(item.children)
  }

  private blockquote(children: (BlockContent | DefinitionContent)[]): Block {
    const first = children[0]
    if (first?.type === "paragraph" && first.children[0]?.type === "text") {
      const lead = first.children[0]
      const match = ALERT.exec(lead.value)
      if (match) {
        const rest = lead.value.slice(match[0].length)
        const leadChildren: PhrasingContent[] = [
          ...(rest ? [{ ...lead, value: rest }] : []),
          ...first.children.slice(1),
        ]
        // Drop a leading line break left over from "[!TIP]\n".
        while (leadChildren[0]?.type === "break") leadChildren.shift()
        const body: (BlockContent | DefinitionContent)[] =
          leadChildren.length > 0 ? [{ ...first, children: leadChildren }, ...children.slice(1)] : children.slice(1)
        if (body.length === 0) this.fail(`empty [!${match[1]}] callout`)
        return { t: "callout", kind: match[1].toLowerCase() as CalloutKind, c: this.blocks(body) }
      }
    }
    return { t: "quote", c: this.blocks(children) }
  }

  blocks(nodes: RootContent[]): Block[] {
    const out: Block[] = []
    for (const node of nodes) {
      switch (node.type) {
        case "paragraph":
          out.push(this.paragraph(node.children))
          break
        case "heading": {
          if (node.depth === 1) this.fail("don't use # headings: the title comes from frontmatter")
          if (node.depth > 4) this.fail("headings deeper than #### are not supported")
          const c = this.inline(node.children)
          out.push({ t: "h", depth: node.depth as 2 | 3 | 4, id: this.anchorId(inlineText(c)), c })
          break
        }
        case "list":
          if (node.ordered) {
            out.push({ t: "ol", start: node.start ?? 1, items: node.children.map((i) => this.listItem(i)) })
          } else {
            out.push({ t: "ul", items: node.children.map((i) => this.listItem(i)) })
          }
          break
        case "blockquote":
          out.push(this.blockquote(node.children))
          break
        case "code":
          out.push({ t: "code", v: node.value })
          break
        case "thematicBreak":
          out.push({ t: "hr" })
          break
        case "html":
          this.fail("raw HTML is not allowed")
          break
        default:
          this.fail(`unsupported Markdown "${node.type}"`)
      }
    }
    return out
  }
}

/** Plain text of a block list (list items and callouts flattened). */
export function blocksText(blocks: readonly Block[]): string {
  return blocks
    .map((block) => {
      switch (block.t) {
        case "p":
        case "h":
          return inlineText(block.c)
        case "ul":
        case "ol":
          return block.items.map(blocksText).join(" ")
        case "callout":
        case "quote":
          return blocksText(block.c)
        case "cta":
          return block.label
        case "code":
          return block.v
        default:
          return ""
      }
    })
    .filter(Boolean)
    .join(" ")
}

/** Plain-text items of the first ordered list after a "Steps" heading. */
export function extractSteps(blocks: readonly Block[]): string[] {
  let inSteps = false
  for (const block of blocks) {
    if (block.t === "h") {
      inSteps = inlineText(block.c).trim().toLowerCase() === "steps"
      continue
    }
    if (inSteps && block.t === "ol") {
      return block.items.map((item) => blocksText(item).replace(/\s+/g, " ").trim())
    }
  }
  return []
}

export function compileBody(markdown: string, file: string, options: CompileOptions = {}): CompiledBody {
  // remark-gfm registers its micromark/mdast extensions on the processor,
  // so parse() alone yields GFM nodes (tables, strikethrough, autolinks).
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root
  const compiler = new BodyCompiler(file, options)
  const blocks = compiler.blocks(tree.children)
  if (blocks.length === 0) throw new ContentError(file, "page body is empty")
  return { blocks, steps: extractSteps(blocks), links: compiler.links, images: compiler.images }
}

// ── Site ────────────────────────────────────────────────────────────────────

export interface SourceFile {
  /** Path relative to the content root, POSIX separators: "guides/buying/x.md". */
  path: string
  source: string
}

export interface CompiledGuide {
  meta: GuideMeta
  body: CompiledBody
  file: string
}

export interface CompiledSite {
  categories: CategoryMeta[]
  guides: CompiledGuide[]
  about: { meta: AboutMeta; body: CompiledBody; file: string }
}

export const CATEGORIES_FILE = "guides/categories.json"
export const ABOUT_FILE = "about.md"
/** Author-facing docs in /content that aren't pages. */
export const IGNORED_FILES: ReadonlySet<string> = new Set(["STYLE.md", "README.md"])

const GUIDE_FILE = /^guides\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/

function parseCategories(source: string): CategoryMeta[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(source)
  } catch (error) {
    throw new ContentError(CATEGORIES_FILE, `invalid JSON: ${(error as Error).message}`)
  }
  if (!Array.isArray(parsed)) throw new ContentError(CATEGORIES_FILE, "expected an array")
  const seen = new Set<string>()
  return parsed.map((raw: unknown, i) => {
    const c = raw as Partial<CategoryMeta>
    if (
      typeof c?.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id) ||
      typeof c.title !== "string" ||
      typeof c.description !== "string" ||
      typeof c.order !== "number"
    ) {
      throw new ContentError(CATEGORIES_FILE, `entry ${i}: needs id (kebab-case), title, description, order`)
    }
    if (seen.has(c.id)) throw new ContentError(CATEGORIES_FILE, `duplicate id "${c.id}"`)
    seen.add(c.id)
    checkDescription(c.description, CATEGORIES_FILE)
    return { id: c.id, title: c.title, description: c.description, order: c.order }
  })
}

/**
 * Compile every content file. `today` (YYYY-MM-DD) bounds `updated`;
 * `includeDrafts` keeps `draft: true` guides (dev server only).
 */
export function compileSite(
  files: SourceFile[],
  opts: {
    today: string
    includeDrafts?: boolean
    imageResolver?: (file: string) => CompileOptions["resolveImage"]
  },
): CompiledSite {
  const byPath = new Map(files.map((f) => [f.path, f.source]))
  const categoriesSource = byPath.get(CATEGORIES_FILE)
  if (categoriesSource === undefined) throw new ContentError(CATEGORIES_FILE, "missing")
  const categories = parseCategories(categoriesSource).sort((a, b) => a.order - b.order)
  const categoryIds = new Set(categories.map((c) => c.id))

  const aboutSource = byPath.get(ABOUT_FILE)
  if (aboutSource === undefined) throw new ContentError(ABOUT_FILE, "missing")

  const guides: CompiledGuide[] = []
  for (const { path, source } of files) {
    if (path === CATEGORIES_FILE || path === ABOUT_FILE || IGNORED_FILES.has(path)) continue
    if (/\/img\//.test(path)) continue
    const match = GUIDE_FILE.exec(path)
    if (!match) {
      throw new ContentError(path, "content files must be guides/<category>/<slug>.md (kebab-case)")
    }
    const [, category, slug] = match
    if (!categoryIds.has(category)) {
      throw new ContentError(path, `category "${category}" is not in ${CATEGORIES_FILE}`)
    }
    const { data, body } = parseFrontmatter(source, path)
    checkUnknownKeys(data, KNOWN_GUIDE_KEYS, path)
    if (data.draft === true && !opts.includeDrafts) continue
    const description = requireString(data, "description", path)
    checkDescription(description, path)
    const updated = requireString(data, "updated", path)
    checkUpdated(updated, opts.today, path)
    const order = data.order ?? 100
    if (typeof order !== "number") throw new ContentError(path, `"order" must be a number`)
    const howto = data.howto ?? false
    if (typeof howto !== "boolean") throw new ContentError(path, `"howto" must be true or false`)

    const compiled = compileBody(body, path, { resolveImage: opts.imageResolver?.(path) })
    if (howto && compiled.steps.length === 0) {
      throw new ContentError(path, `howto: true needs a "## Steps" heading followed by a numbered list`)
    }
    guides.push({
      file: path,
      meta: {
        id: `${category}/${slug}`,
        category,
        slug,
        title: requireString(data, "title", path),
        description,
        order,
        updated,
        author: optionalString(data, "author", path) || DEFAULT_AUTHOR,
        keywords: stringList(data, "keywords", path),
        related: stringList(data, "related", path),
        howto,
      },
      body: compiled,
    })
  }

  const ids = new Set(guides.map((g) => g.meta.id))
  for (const guide of guides) {
    for (const related of guide.meta.related) {
      if (!ids.has(related)) throw new ContentError(guide.file, `related guide "${related}" doesn't exist`)
    }
  }
  for (const category of categories) {
    if (!guides.some((g) => g.meta.category === category.id)) {
      throw new ContentError(CATEGORIES_FILE, `category "${category.id}" has no guides`)
    }
  }

  const categoryOrder = new Map(categories.map((c, i) => [c.id, i]))
  guides.sort(
    (a, b) =>
      categoryOrder.get(a.meta.category)! - categoryOrder.get(b.meta.category)! ||
      a.meta.order - b.meta.order ||
      a.meta.title.localeCompare(b.meta.title),
  )

  const about = parseFrontmatter(aboutSource, ABOUT_FILE)
  checkUnknownKeys(about.data, KNOWN_ABOUT_KEYS, ABOUT_FILE)
  const aboutDescription = requireString(about.data, "description", ABOUT_FILE)
  checkDescription(aboutDescription, ABOUT_FILE)
  const aboutUpdated = requireString(about.data, "updated", ABOUT_FILE)
  checkUpdated(aboutUpdated, opts.today, ABOUT_FILE)

  return {
    categories,
    guides,
    about: {
      file: ABOUT_FILE,
      meta: {
        title: requireString(about.data, "title", ABOUT_FILE),
        description: aboutDescription,
        updated: aboutUpdated,
        author: optionalString(about.data, "author", ABOUT_FILE) || DEFAULT_AUTHOR,
      },
      body: compileBody(about.body, ABOUT_FILE, { resolveImage: opts.imageResolver?.(ABOUT_FILE) }),
    },
  }
}

// ── Outputs ─────────────────────────────────────────────────────────────────

export function contentIndex(site: CompiledSite): ContentIndex {
  return {
    categories: site.categories,
    guides: site.guides.map((g) => g.meta),
    about: site.about.meta,
  }
}

function latest(dates: string[]): string {
  return dates.reduce((a, b) => (b > a ? b : a))
}

export function sitemapManifest(site: CompiledSite): SitemapManifest {
  const pages: SitemapManifest["pages"] = [
    { path: HELP_PATHS.hub, updated: latest(site.guides.map((g) => g.meta.updated)) },
  ]
  for (const category of site.categories) {
    const inCategory = site.guides.filter((g) => g.meta.category === category.id)
    pages.push({
      path: HELP_PATHS.category(category.id),
      updated: latest(inCategory.map((g) => g.meta.updated)),
    })
  }
  for (const guide of site.guides) {
    pages.push({ path: HELP_PATHS.guide(guide.meta.category, guide.meta.slug), updated: guide.meta.updated })
  }
  pages.push({ path: HELP_PATHS.about, updated: site.about.meta.updated })
  return { version: 1, pages }
}

function publicBody(body: CompiledBody): ContentBody {
  return { blocks: body.blocks, steps: body.steps }
}

export function guideAsset(site: CompiledSite, guide: CompiledGuide): GuideAsset {
  const category = site.categories.find((c) => c.id === guide.meta.category)!
  return {
    version: 1,
    guide: guide.meta,
    category,
    body: publicBody(guide.body),
    related: guide.meta.related.map((id) => {
      const target = site.guides.find((g) => g.meta.id === id)!
      return { href: HELP_PATHS.guide(target.meta.category, target.meta.slug), text: target.meta.title }
    }),
  }
}

export function categoryAsset(site: CompiledSite, category: CategoryMeta): CategoryAsset {
  return {
    version: 1,
    category,
    guides: site.guides.filter((g) => g.meta.category === category.id).map((g) => g.meta),
  }
}

export function aboutAsset(site: CompiledSite): AboutAsset {
  return { version: 1, about: site.about.meta, body: publicBody(site.about.body) }
}
