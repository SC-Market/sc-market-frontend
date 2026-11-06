import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Divider, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useServiceSearch } from "../../contracting/hooks/ServiceSearch"
import { SERVICE_LISTINGS_PAGE_SIZE } from "../../../components/skeletons/ServiceListingSkeleton"
import { ServiceListingsSkeleton } from "../../../components/skeletons/MarketSearchSkeleton"
import { EmptyListings } from "../../../components/empty-states"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetPublicServicesQuery,
  ServicesQueryParams,
} from "../api/servicesApi"
import {
  SERVICE_LISTING_GRID_BREAKPOINTS,
  ServiceListing,
} from "./ServiceListing"
import { SERVICE_CARD_HEIGHT } from "./ServiceListingCard"
import { formatServiceUrl } from "../../../util/urls"
import {
  CardStub,
  firstScreenCards,
  useFirstScreenRender,
} from "../../../components/grid/firstScreen"
import { isAwaitingData } from "../../../util/queryLoading"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"

import { NumberedPagination } from "../../../components/pagination/NumberedPagination"
export function ServiceListings(props: { user?: string; contractor?: string }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(SERVICE_LISTINGS_PAGE_SIZE)
  const [searchState] = useServiceSearch()
  const { user, contractor } = props
  const theme = useTheme<ExtendedTheme>()

  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { customOrg } = useCustomDomain()

  const queryParams: ServicesQueryParams = useMemo(() => {
    const params: ServicesQueryParams = {
      page,
      pageSize: perPage,
      sortBy: "timestamp",
      sortOrder: "desc",
    }

    if (contractor) params.contractor = contractor
    if (user) params.user = user
    // On an org's white-label domain: the org's own services only.
    if (!contractor && !user && customOrg) params.contractor = customOrg
    if (searchState.query) params.search = searchState.query
    if (searchState.kind) params.kind = searchState.kind
    if (searchState.minOffer) params.minCost = searchState.minOffer
    if (searchState.maxOffer) params.maxCost = searchState.maxOffer
    if (searchState.paymentType) params.paymentType = searchState.paymentType
    if (searchState.language_codes && searchState.language_codes.length > 0) {
      params.language_codes = searchState.language_codes.join(",")
    }

    return params
  }, [page, perPage, searchState, contractor, user, customOrg])

  const {
    data: servicesResponse,
    isFetching,
    currentData,
    error,
    refetch,
    isLoading: pageIsLoading,
  } = useGetPublicServicesQuery(queryParams)
  // Primary content wherever services are listed: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading: pageIsLoading, isFetching, currentData }),
  )

  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = (rowsPerPage: number) => {
    setPerPage(rowsPerPage)
    setPage(0)
  }

  const displayedServices = useMemo(() => {
    if (!servicesResponse?.data) return []
    // Scoped by the query on a white-label domain (contractor above).
    return servicesResponse.data
  }, [servicesResponse?.data])

  // Only the first screen of cards in the commit that shows the services;
  // the rest right after (components/grid/firstScreen.tsx). The row gap is
  // the grid's layout spacing.
  const firstScreen = firstScreenCards(
    SERVICE_LISTING_GRID_BREAKPOINTS,
    SERVICE_CARD_HEIGHT +
      Number.parseFloat(theme.spacing(theme.layoutSpacing.layout)),
  )
  const rendered = useFirstScreenRender(
    displayedServices.length,
    firstScreen.count,
  )

  if (isAwaitingData({ isFetching, currentData })) {
    // The same cards as the route skeleton and the chunk fallbacks above.
    return <ServiceListingsSkeleton count={perPage} />
  }

  if (error) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          title={t("emptyStates.services.errorTitle", {
            defaultValue: "Unable to load services",
          })}
          description={t("emptyStates.services.errorDescription", {
            defaultValue:
              "We encountered an error while loading services. Please try again.",
          })}
          showCreateAction={false}
          action={{
            label: t("emptyStates.services.retry", { defaultValue: "Retry" }),
            onClick: () => refetch(),
            variant: "contained",
          }}
        />
      </Grid>
    )
  }

  return (
    <React.Fragment>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {displayedServices.map((service, index) =>
            index >= rendered ? (
              <Grid
                item
                {...SERVICE_LISTING_GRID_BREAKPOINTS}
                key={service.service_id}
              >
                <CardStub
                  height={SERVICE_CARD_HEIGHT}
                  to={formatServiceUrl(service)}
                  label={service.service_name}
                />
              </Grid>
            ) : (
              <ServiceListing
                service={service}
                key={service.service_id}
                index={index}
                priority={index < firstScreen.priorityCount}
              />
            ),
          )}
          {servicesResponse && displayedServices.length === 0 && (
            <Grid item xs={12}>
              <EmptyListings
                isSearchResult={false}
                title={t("emptyStates.services.noServices", {
                  defaultValue: "No services yet",
                })}
                description={t("emptyStates.services.noServicesDescription", {
                  defaultValue:
                    "Create your first service to start offering your expertise",
                })}
                showCreateAction={false}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <NumberedPagination
          count={servicesResponse?.pagination.totalItems ?? 0}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[10, 20, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </React.Fragment>
  )
}
