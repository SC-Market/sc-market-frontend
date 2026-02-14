import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Divider, Grid, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { HapticTablePagination } from "../../../components/haptic"
import { useServiceSearch } from "../../../hooks/contract/ServiceSearch"
import { ServiceListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetPublicServicesQuery,
  ServicesQueryParams,
} from "../../../store/services"
import { ServiceListing } from "./ServiceListing"

export function ServiceListings(props: { user?: string; contractor?: string }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(20)
  const [searchState] = useServiceSearch()
  const { user, contractor } = props
  const theme = useTheme<ExtendedTheme>()

  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const queryParams: ServicesQueryParams = useMemo(() => {
    const params: ServicesQueryParams = {
      page,
      pageSize: perPage,
      sortBy: "timestamp",
      sortOrder: "desc",
    }

    if (contractor) params.contractor = contractor
    if (user) params.user = user
    if (searchState.query) params.search = searchState.query
    if (searchState.kind) params.kind = searchState.kind
    if (searchState.minOffer) params.minCost = searchState.minOffer
    if (searchState.maxOffer) params.maxCost = searchState.maxOffer
    if (searchState.paymentType) params.paymentType = searchState.paymentType
    if (searchState.language_codes && searchState.language_codes.length > 0) {
      params.language_codes = searchState.language_codes.join(",")
    }

    return params
  }, [page, perPage, searchState, contractor, user])

  const {
    data: servicesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPublicServicesQuery(queryParams)

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
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

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPerPage(+event.target.value)
    setPage(0)
  }

  const displayedServices = useMemo(() => {
    if (!servicesResponse?.data) return []
    if (contractor ?? user) return servicesResponse.data
    if (CURRENT_CUSTOM_ORG) {
      return servicesResponse.data.filter(
        (service) => service.contractor?.spectrum_id === CURRENT_CUSTOM_ORG,
      )
    }
    return servicesResponse.data
  }, [servicesResponse?.data, contractor, user])

  if (isLoading || isFetching) {
    return (
      <>
        {Array.from({ length: perPage }).map((_, i) => (
          <ServiceListingSkeleton key={i} index={i} />
        ))}
      </>
    )
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
      <Grid item xs={12} sx={{ paddingTop: 0 }}>
        <div ref={ref} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {displayedServices.map((service, index) => (
            <ServiceListing
              service={service}
              key={service.service_id}
              index={index}
            />
          ))}
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
        <HapticTablePagination
          labelRowsPerPage={t("rows_per_page")}
          labelDisplayedRows={({ from, to, count }) => (
            <>
              {t("displayed_rows", {
                from: from.toLocaleString(undefined),
                to: to.toLocaleString(undefined),
                count: count,
              })}
            </>
          )}
          SelectProps={{
            "aria-label": t("rows_per_page"),
            color: "primary",
          }}
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={servicesResponse?.pagination.totalItems ?? 0}
          rowsPerPage={perPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      </Grid>
    </React.Fragment>
  )
}
