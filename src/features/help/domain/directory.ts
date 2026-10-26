/**
 * The Help & Guides directory (hub, categories with their guides, About) as
 * plain links. Pure: the build embeds it in every bridge asset, and the
 * bridge renders it as crawlable link lists.
 */
import { HELP_PATHS } from "../../../routes/paths"
import type { ContentIndex } from "./types"

export interface DirectoryLink {
  href: string
  text: string
}

export interface ContentDirectory {
  hub: DirectoryLink
  categories: { link: DirectoryLink; guides: DirectoryLink[] }[]
  about: DirectoryLink
}

export function buildDirectory(index: ContentIndex): ContentDirectory {
  return {
    hub: { href: HELP_PATHS.hub, text: "Help & Guides" },
    categories: index.categories.map((category) => ({
      link: { href: HELP_PATHS.category(category.id), text: category.title },
      guides: index.guides
        .filter((g) => g.category === category.id)
        .map((g) => ({ href: HELP_PATHS.guide(g.category, g.slug), text: g.title })),
    })),
    about: { href: HELP_PATHS.about, text: index.about.title },
  }
}
