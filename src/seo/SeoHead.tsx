import React from "react"
import { Helmet } from "@unhead/react/helmet"
import { PageHead, serializeJsonLd } from "./pageHead"

/**
 * Renders a PageHead through Unhead. The edge bridge renders the same
 * PageHead into the static shell, so JSON-LD uses the same serializer: the
 * script content then matches byte for byte and Unhead adopts the
 * server-injected tags instead of duplicating them.
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
      }))}
    />
  )
}
