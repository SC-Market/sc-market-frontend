import React from "react"
import { Grid, Skeleton } from "@mui/material"
import { Section } from "../../../components/paper/Section"

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Section xs={12} title={title}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={400} width="100%" />
      </Grid>
    </Section>
  )
}

function ListSkeleton({ title, lg = 3 }: { title: string; lg?: number }) {
  return (
    <Section title={title} xs={12} lg={lg}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid item xs={12} key={i}>
          <Skeleton variant="text" width={`${70 + Math.random() * 25}%`} height={28} />
        </Grid>
      ))}
    </Section>
  )
}

function SummarySkeleton({ title }: { title: string }) {
  return (
    <Section title={title} xs={12} lg={6}>
      <Grid container spacing={1}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={6} key={i}>
            <Skeleton variant="text" width="80%" height={28} />
          </Grid>
        ))}
      </Grid>
    </Section>
  )
}

export function OrderAnalyticsSkeleton() {
  return (
    <>
      <ChartSkeleton title="Order Count (Daily)" />
      <ChartSkeleton title="Order Count (Weekly)" />
      <ChartSkeleton title="Order Count (Monthly)" />
      <ChartSkeleton title="Average Order Value (Monthly)" />
      <ListSkeleton title="Top Shops" lg={3} />
      <ListSkeleton title="Top Users" lg={3} />
      <SummarySkeleton title="Order Summary" />
    </>
  )
}

export function OfferAnalyticsSkeleton() {
  return (
    <>
      <ChartSkeleton title="Offer Count (Daily)" />
      <ChartSkeleton title="Offer Count (Weekly)" />
      <ChartSkeleton title="Offer Count (Monthly)" />
      <ChartSkeleton title="Average Accepted Offer Value (Monthly)" />
      <ListSkeleton title="Top Shops (Offers)" lg={3} />
      <ListSkeleton title="Top Users (Offers)" lg={3} />
      <SummarySkeleton title="Offer Summary" />
    </>
  )
}

export function AdminOrderStatsSkeleton() {
  return (
    <>
      <OrderAnalyticsSkeleton />
      <OfferAnalyticsSkeleton />
    </>
  )
}
