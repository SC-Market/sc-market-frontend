import React from "react"
import { Helmet } from "@unhead/react/helmet"
import {
  BREADCRUMB_JSONLD_KEY,
  isBreadcrumbJsonLd,
  PageHead,
  serializeJsonLd,
} from "./pageHead"

/**
 * Renders a PageHead through Unhead. The edge bridge renders the same
 * PageHead into the static shell, so JSON-LD uses the same serializer: the
 * script content then matches byte for byte and Unhead adopts the
 * server-injected tags instead of duplicating them (the BreadcrumbList by
 * its key, BREADCRUMB_JSONLD_KEY).
 */
export function SeoHead({ head }: { head: PageHead }) {
  return (
    <Helmet
      title={head.title}
      link={head.canonical ? [{ rel: "canonical", href: head.canonical }] : undefined}
      meta={head.meta.map((m) => ({ ...m }))}
      script={head.jsonLd.map((data) => ({
        type: "application/ld+json",
        innerHTML: serializeJsonLd(data),
        // One BreadcrumbList per page: this one replaces the layout's
        // (PageBreadcrumbs, lower priority) and adopts the server's.
        ...(isBreadcrumbJsonLd(data)
          ? {
              key: BREADCRUMB_JSONLD_KEY,
              tagDuplicateStrategy: "replace" as const,
            }
          : {}),
      }))}
    />
  )
}
