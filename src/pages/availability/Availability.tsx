import React, { useCallback, useMemo } from "react"
import { Grid, Skeleton } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  AvailabilitySelector,
} from "../../components/time/AvailabilitySelector"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useProfileUpdateAvailabilityMutation } from "../../store/profile"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { convertAvailability } from "../../util/availability"
import { usePageAvailability } from "../../features/availability/hooks/usePageAvailability"

interface Span {
  start: number
  finish: number
}

export function Availability() {
  const { t } = useTranslation()
  const [currentOrg] = useCurrentOrg()
  const pageData = usePageAvailability(currentOrg?.spectrum_id)
  const [updateAvailability] = useProfileUpdateAvailabilityMutation()
  const issueAlert = useAlertHook()

  const saveCallback = useCallback(
    async (selections: boolean[]) => {
      const spans: Span[] = []
      let current: Span | null = null

      // Convert boolean slots to bounded spans
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
        current = null
      }

      updateAvailability({
        contractor: currentOrg?.spectrum_id || null,
        selections: spans,
      })
        .unwrap()
        .then((data) => {
          issueAlert({
            message: t("availability.updated"),
            severity: "success",
          })
        })
        .catch((error) =>
          issueAlert({
            message: `${t("availability.failed")} ${
              error?.error || error?.data?.error || error
            }`,
            severity: "error",
          }),
        )
    },
    [currentOrg?.spectrum_id, issueAlert, updateAvailability, t],
  )

  const initial = useMemo(
    () => convertAvailability(pageData.data?.selections || []),
    [pageData.data],
  )

  const skeleton = (
    <Grid item xs={12}>
      <Skeleton width={"100%"} height={400} />
    </Grid>
  )

  return (
    <StandardPageLayout
      title={t("availability.title")}
      headerTitle={t("availability.title")}
      isLoading={pageData.isLoading}
      error={pageData.error}
      skeleton={skeleton}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {pageData.data && (
        <AvailabilitySelector
          onSave={saveCallback}
          initialSelections={initial}
        />
      )}
    </StandardPageLayout>
  )
}
