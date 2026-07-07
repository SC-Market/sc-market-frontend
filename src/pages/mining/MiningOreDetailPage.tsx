import React from "react"
import { useParams } from "react-router-dom"
import { Grid } from "@mui/material"
import { Helmet } from "react-helmet"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { OreDetailContent } from "./OreDetailContent"
import { FRONTEND_URL } from "../../util/constants"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MiningOreDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: ore, isLoading, error } = useGetOreDetailQuery({ name: name! }, { skip: !name })
  const displayName = ore?.displayName || friendlyName(name || "")

  const seoTitle = `${displayName} — Star Citizen Mining Ore | SC Market`
  const seoDescription = `${displayName} — minable ore in Star Citizen. Mining stats, locations, and market price.`
  const canonicalUrl = `${FRONTEND_URL}/mining/ores/${name}`

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/mining/ores/${name}`}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining" }, { label: "Ores", href: "/mining" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {ore && (
        <Grid item xs={12}>
          <Helmet>
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="product" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: displayName,
                description: seoDescription,
                url: canonicalUrl,
                ...(ore.marketPrice && {
                  offers: {
                    "@type": "Offer",
                    price: ore.marketPrice,
                    priceCurrency: "aUEC",
                  },
                }),
              })}
            </script>
          </Helmet>
          <OreDetailContent ore={ore} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
