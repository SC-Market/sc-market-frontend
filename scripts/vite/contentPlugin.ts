/**
 * Vite plugin for Help & Guides content (/content/**, see
 * src/features/help/build/compile.ts for the format).
 *
 * - `virtual:help-content`: the content index (categories + guide metadata,
 *   no bodies) and a lazy loader per page body. Only the guides/about route
 *   chunks import it, so nothing reaches the main bundle.
 * - `/content/<page>.md?help-body`: one compiled body per page, a lazy chunk
 *   each. Screenshots become imports, so they get hashed /assets/ URLs.
 * - Build only: emits /content/manifest.json (backend sitemap) and the
 *   /content/bridge/*.json files the edge bridge renders for crawlers.
 *
 * Registered in both vite.config.ts and vitest.config.ts (vitest doesn't
 * inherit the Vite plugins). Content errors fail the build with the file name.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import type { Plugin, ViteDevServer } from "vite"
import {
  aboutAsset,
  ABOUT_FILE,
  categoryAsset,
  compileSite,
  ContentError,
  contentIndex,
  guideAsset,
  sitemapManifest,
  type CompiledSite,
} from "../../src/features/help/build/compile"
import { CONTENT_ASSET_PATHS } from "../../src/features/help/domain/assetPaths"
import type { Block, ContentBody } from "../../src/features/help/domain/types"

export const HELP_CONTENT_ID = "virtual:help-content"
const RESOLVED_HELP_CONTENT_ID = "\0" + HELP_CONTENT_ID
const BODY_QUERY = "?help-body"
const IMAGE_PLACEHOLDER = "__HELP_IMG__"

function listFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listFiles(full, base))
    else if (name.endsWith(".md") || name.endsWith(".json")) {
      out.push(path.relative(base, full).split(path.sep).join("/"))
    }
  }
  return out
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Drop screenshots (the bridge renders text only). */
function withoutImages(blocks: Block[]): Block[] {
  return blocks
    .filter((b) => b.t !== "img")
    .map((b) => {
      switch (b.t) {
        case "ul":
        case "ol":
          return { ...b, items: b.items.map(withoutImages) }
        case "callout":
        case "quote":
          return { ...b, c: withoutImages(b.c) }
        default:
          return b
      }
    })
}

function bridgeBody(body: ContentBody): ContentBody {
  return { blocks: withoutImages(body.blocks), steps: body.steps }
}

export function contentPlugin(): Plugin {
  let root = process.cwd()
  let contentRoot = path.join(root, "content")
  let includeDrafts = false
  let site: CompiledSite | null = null

  const compile = (): CompiledSite => {
    if (site) return site
    const files = listFiles(contentRoot).map((rel) => ({
      path: rel,
      source: readFileSync(path.join(contentRoot, rel), "utf8"),
    }))
    site = compileSite(files, {
      today: todayUtc(),
      includeDrafts,
      imageResolver: (file) => (src) => {
        const abs = path.join(contentRoot, path.dirname(file), src)
        if (!existsSync(abs)) throw new ContentError(file, `screenshot "${src}" not found`)
        // Root-relative, so Vite resolves it the same in dev and build.
        return IMAGE_PLACEHOLDER + "/" + path.relative(root, abs).split(path.sep).join("/")
      },
    })
    return site
  }

  /** Root-relative module id of a page body. */
  const bodyId = (file: string) =>
    "/" + path.relative(root, path.join(contentRoot, file)).split(path.sep).join("/") + BODY_QUERY

  const fail = (ctx: { error(message: string): never }, error: unknown): never => {
    if (error instanceof ContentError) ctx.error(error.message)
    throw error
  }

  return {
    name: "sc-market-help-content",
    enforce: "pre",

    configResolved(config) {
      root = config.root
      contentRoot = path.join(root, "content")
      includeDrafts = config.command === "serve" && config.mode !== "test"
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(contentRoot)
      const reload = (file: string) => {
        if (!file.startsWith(contentRoot)) return
        site = null
        const mod = server.moduleGraph.getModuleById(RESOLVED_HELP_CONTENT_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: "full-reload" })
      }
      server.watcher.on("change", reload)
      server.watcher.on("add", reload)
      server.watcher.on("unlink", reload)
    },

    resolveId(id) {
      if (id === HELP_CONTENT_ID) return RESOLVED_HELP_CONTENT_ID
      return null
    },

    load(id) {
      if (id === RESOLVED_HELP_CONTENT_ID) {
        let compiled: CompiledSite
        try {
          compiled = compile()
        } catch (error) {
          return fail(this, error)
        }
        const loaders = [
          ...compiled.guides.map((g) => [g.meta.id, bodyId(g.file)] as const),
          ["about", bodyId(ABOUT_FILE)] as const,
        ]
        return [
          `export const index = ${JSON.stringify(contentIndex(compiled))}`,
          `export const bodies = {`,
          ...loaders.map(([key, mod]) => `  ${JSON.stringify(key)}: () => import(${JSON.stringify(mod)}),`),
          `}`,
        ].join("\n")
      }

      if (!id.endsWith(BODY_QUERY)) return null
      const file = path
        .relative(contentRoot, id.slice(0, -BODY_QUERY.length))
        .split(path.sep)
        .join("/")
      let compiled: CompiledSite
      try {
        compiled = compile()
      } catch (error) {
        return fail(this, error)
      }
      this.addWatchFile(id.slice(0, -BODY_QUERY.length))
      const page =
        file === ABOUT_FILE ? compiled.about : compiled.guides.find((g) => g.file === file)
      if (!page) return this.error(`${file}: not a content page (draft or unknown)`)

      // Swap image placeholders for imports so they get hashed asset URLs.
      const imports: string[] = []
      let json = JSON.stringify({ blocks: page.body.blocks, steps: page.body.steps })
      json = json.replace(new RegExp(`"${IMAGE_PLACEHOLDER}([^"]+)"`, "g"), (_m, src: string) => {
        const name = `img${imports.length}`
        imports.push(`import ${name} from ${JSON.stringify("/" + src.replace(/^\//, ""))}`)
        return name
      })
      return [...imports, `export default ${json}`].join("\n")
    },

    generateBundle() {
      let compiled: CompiledSite
      try {
        compiled = compile()
      } catch (error) {
        return fail(this, error)
      }
      const emit = (assetPath: string, value: unknown) =>
        this.emitFile({
          type: "asset",
          fileName: assetPath.replace(/^\//, ""),
          source: JSON.stringify(value),
        })

      emit(CONTENT_ASSET_PATHS.manifest, sitemapManifest(compiled))
      emit(CONTENT_ASSET_PATHS.index, { version: 1, ...contentIndex(compiled) })
      emit(CONTENT_ASSET_PATHS.about, { ...aboutAsset(compiled), body: bridgeBody(compiled.about.body) })
      for (const category of compiled.categories) {
        emit(CONTENT_ASSET_PATHS.category(category.id), categoryAsset(compiled, category))
      }
      for (const guide of compiled.guides) {
        const asset = guideAsset(compiled, guide)
        emit(CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug), {
          ...asset,
          body: bridgeBody(asset.body),
        })
      }
    },
  }
}
