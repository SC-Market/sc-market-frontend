import React from "react"
import { useParams } from "react-router-dom"
import { Grid } from "@mui/material"
import { useGetLocationDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { LocationDetailContent } from "./LocationDetailContent"
import { FRONTEND_URL } from "../../util/constants"
import { buildMiningLocationHead, miningDisplayName, miningLocationSeoText } from "../../seo/gameDataHeads"
import { SeoHead } from "../../seo/SeoHead"

export function MiningLocationDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: loc, isLoading, error } = useGetLocationDetailQuery({ name: name! }, { skip: !name })
  const displayName = miningDisplayName(loc?.displayName, name)
  const head = loc && name ? buildMiningLocationHead(loc, name, FRONTEND_URL) : null

  const { title: seoTitle, description: seoDescription } = miningLocationSeoText(displayName)

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
          {head && <SeoHead head={head} />}
          <LocationDetailContent location={loc} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
