import React from "react"
import { useParams } from "react-router-dom"
import { Grid } from "@mui/material"
import { Helmet } from "react-helmet"
import { useGetLocationDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { LocationDetailContent } from "./LocationDetailContent"
import { FRONTEND_URL } from "../../util/constants"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MiningLocationDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: loc, isLoading, error } = useGetLocationDetailQuery({ name: name! }, { skip: !name })
  const displayName = loc?.displayName || friendlyName(name || "")

  const seoTitle = `${displayName} — Star Citizen Mining Location | SC Market`
  const seoDescription = `${displayName} — mining location in Star Citizen. Available ores and mining guide.`
  const canonicalUrl = `${FRONTEND_URL}/mining/locations/${name}`

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/mining/locations/${name}`}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining?tab=locations" }, { label: "Locations", href: "/mining?tab=locations" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {loc && (
        <Grid item xs={12}>
          <Helmet>
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={`${FRONTEND_URL}/scmarket-logo.png`} />
            <meta property="og:type" content="place" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <meta name="twitter:image" content={`${FRONTEND_URL}/scmarket-logo.png`} />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Place",
                name: displayName,
                description: seoDescription,
                url: canonicalUrl,
                ...(loc.system && {
                  containedInPlace: {
                    "@type": "Place",
                    name: loc.system,
                  },
                }),
              })}
            </script>
          </Helmet>
          <LocationDetailContent location={loc} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
