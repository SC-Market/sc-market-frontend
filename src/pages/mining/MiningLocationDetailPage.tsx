import React from "react"
import { useParams } from "react-router-dom"
import { Grid } from "@mui/material"
import { useGetLocationDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { LocationDetailContent } from "./LocationDetailContent"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MiningLocationDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: loc, isLoading, error } = useGetLocationDetailQuery({ name: name! }, { skip: !name })
  const displayName = loc?.displayName || friendlyName(name || "")

  return (
    <StandardPageLayout
      title={displayName}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining?tab=locations" }, { label: "Locations", href: "/mining?tab=locations" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {loc && (
        <Grid item xs={12}>
          <LocationDetailContent location={loc} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
