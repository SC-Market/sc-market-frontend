import { useMemo } from "react"
import { Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
} from "../../../store/services"
import { EmptyListings } from "../../../components/empty-states"
import { HorizontalServiceListings } from "./HorizontalServiceListings"
import { RecentServicesSkeleton } from "./RecentServicesSkeleton"

export function OrgRecentServices(props: { org: string }) {
  const { org } = props
  const { data: services } = useGetServicesContractorQuery(org)
  const filteredServices = useMemo(() => {
    return [...(services || [])]
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 25)
  }, [services])

  return services ? (
    <HorizontalServiceListings listings={filteredServices} />
  ) : (
    <RecentServicesSkeleton />
  )
}

export function UserRecentServices(props: { user: string }) {
  const { user } = props
  const { data: services, isLoading, isFetching } = useGetServicesQuery(user)
  const { t } = useTranslation()
  const filteredServices = useMemo(() => {
    return [...(services || [])]
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 25)
  }, [services])

  if (isLoading || isFetching) {
    return <RecentServicesSkeleton />
  }

  if (!services || filteredServices.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          showCreateAction={false}
          title={t("emptyStates.profile.noServices", {
            defaultValue: "No services yet",
          })}
          description={t("emptyStates.profile.noServicesDescription", {
            defaultValue: "This user hasn't created any services yet",
          })}
        />
      </Grid>
    )
  }

  return <HorizontalServiceListings listings={filteredServices} />
}
