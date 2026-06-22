import React, { useCallback, useMemo, lazy } from "react"
import { Grid, Skeleton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { LazySection } from "../../components/layout/LazySection"
import { useGetUserProfileQuery, useProfileUpdateAvailabilityMutation, useProfileGetAvailabilityQuery } from "../../features/profile/api/profileApi"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { convertAvailability } from "../../util/availability"

const AvailabilitySelector = lazy(() =>
  import("../../components/time/AvailabilitySelector").then((module) => ({
    default: module.AvailabilitySelector,
  })),
)

interface Span {
  start: number
  finish: number
}

export function Availability() {
  const { t } = useTranslation()
  const { data: userProfile } = useGetUserProfileQuery()
  const spectrumId = userProfile?.contractors?.[0]?.spectrum_id

  // Fetch availability — pass spectrumId for org, undefined for personal
  // Don't skip when spectrumId is undefined — that fetches personal availability
  const { data, isLoading, error } = useProfileGetAvailabilityQuery(spectrumId)
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()
  const issueAlert = useAlertHook()

  const saveCallback = useCallback(
    async (selections: boolean[]) => {
      const spans: Span[] = []
      let current: Span | null = null

      for (let i = 0; i < selections.length; i++) {
        if (selections[i]) {
          if (current) {
            current.finish = i
          } else {
            current = { start: i, finish: i - 1 }
          }
        } else {
          if (current) {
            spans.push(current)
            current = null
          }
        }
      }

      if (current) {
        spans.push(current)
      }

      try {
        await updateAvailability({
          contractor: spectrumId || null,
          selections: spans,
        }).unwrap()
        issueAlert({
          message: t("availability.updated"),
          severity: "success",
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        issueAlert({
          message: `${t("availability.failed")} ${message}`,
          severity: "error",
        })
      }
    },
    [spectrumId, issueAlert, updateAvailability, t],
  )

  // Key on spectrumId so the selector resets when org changes
  const initial = useMemo(
    () => convertAvailability(data?.selections || []),
    [data],
  )

  const skeleton = (
    <Grid item xs={12}>
      <Skeleton width={"100%"} height={400} />
    </Grid>
  )

  return (
    <StandardPageLayout
      title={t("availability.title")}
      breadcrumbs={[
        { label: t("dashboard.title", "Dashboard"), href: "/dashboard" },
        { label: t("availability.title") },
      ]}
      showOrgInBreadcrumbs={true}
      headerTitle={t("availability.title")}
      isLoading={isLoading}
      error={error}
      skeleton={skeleton}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {data && (
        <LazySection
          key={spectrumId || "personal"}
          component={AvailabilitySelector}
          componentProps={{
            onSave: saveCallback,
            initialSelections: initial,
          }}
          skeleton={() => skeleton}
        />
      )}
    </StandardPageLayout>
  )
}
