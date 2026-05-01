import React from "react"
import { useParams } from "react-router-dom"
import { Grid, CircularProgress, Box } from "@mui/material"
import { useGetOreDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { OreDetailContent } from "./OreDetailContent"

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function MiningOreDetailPage() {
  const { name } = useParams<{ name: string }>()
  const { data: ore, isLoading, error } = useGetOreDetailQuery({ name: name! }, { skip: !name })
  const displayName = ore?.displayName || friendlyName(name || "")

  return (
    <StandardPageLayout
      title={displayName}
      headerTitle={displayName}
      breadcrumbs={[{ label: "Mining", href: "/mining" }, { label: "Ores", href: "/mining" }, { label: displayName }]}
      isLoading={isLoading} skeleton={<DetailPageSkeleton />} error={error || undefined}
      sidebarOpen={true} maxWidth="lg"
    >
      {ore && (
        <Grid item xs={12}>
          <OreDetailContent ore={ore} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
