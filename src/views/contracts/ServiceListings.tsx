import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { orderIcons, Service } from "../../datatypes/Order"
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  Grid,
  Skeleton,
  TablePagination,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Link } from "react-router-dom"
import { ElectricBoltRounded } from "@mui/icons-material"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useServiceSearch } from "../../hooks/contract/ServiceSearch"
import { dateDiffInDays } from "../market/MarketListingView"
import { ListingNameAndRating } from "../../components/rating/ListingRating"
import { ServiceListingSkeleton } from "../../components/skeletons"
import { EmptyListings } from "../../components/empty-states"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  useGetPublicServicesQuery,
  useGetServicesContractorQuery,
  useGetServicesQuery,
  ServicesQueryParams,
} from "../../store/services"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { formatServiceUrl } from "../../util/urls"

export type ContractKindIconKey = keyof typeof orderIcons

export const ServiceListingBase = React.memo(
  function ServiceListingBase(props: { service: Service; index: number }) {
    const { service, index } = props
    const { t } = useTranslation()
    const theme = useTheme<ExtendedTheme>()
    const key = PAYMENT_TYPE_MAP.get(service.payment_type) || ""

    return (
      <Link
        to={formatServiceUrl(service)}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Fade
          in={true}
          style={{
            transitionDelay: `${50 + 50 * index}ms`,
            transitionDuration: "500ms",
          }}
        >
          <CardActionArea
            sx={{
              borderRadius: theme.spacing(theme.borderRadius.topLevel),
            }}
          >
            <Card
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <CardHeader
                disableTypography
                sx={{
                  overflow: "hidden",
                  root: {
                    overflow: "hidden",
                  },
                  content: {
                    overflow: "hidden",
                    width: "100%",
                    display: "contents",
                    flex: "1 1 auto",
                  },
                  "& .MuiCardHeader-content": {
                    overflow: "hidden",
                  },
                  paddingBottom: 1,
                }}
                title={
                  <Box display={"flex"} alignItems={"center"}>
                    {dateDiffInDays(new Date(), new Date(service.timestamp)) <=
                      1 && (
                      <Chip
                        color={"secondary"}
                        label={t("serviceListings.new")}
                        sx={{
                          marginRight: 1,
                          textTransform: "uppercase",
                          fontSize: "0.85em",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                    <Typography
                      noWrap
                      sx={{ marginRight: 1 }}
                      variant={"h6"}
                      color={"text.secondary"}
                    >
                      {service.service_name}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box>
                    <ListingNameAndRating
                      user={service.user}
                      contractor={service.contractor}
                    />
                    <Typography color={"primary"} variant={"subtitle2"}>
                      {service.cost.toLocaleString(undefined)} aUEC{" "}
                      {key ? t(key) : ""}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ padding: 2, paddingTop: 0 }}>
                <Stack
                  spacing={theme.layoutSpacing.text}
                  direction={"row"}
                  justifyContent={"space-between"}
                >
                  <Typography
                    variant={"body2"}
                    component="div"
                    color={"text.secondary"}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: "6",
                      lineClamp: "6",
                      WebkitBoxOrient: "vertical",
                      overflowY: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <MarkdownRender
                      text={service.service_description}
                      plainText
                    />
                  </Typography>
                  {service.photos[0] ? (
                    <Avatar
                      src={
                        service.photos[0] ||
                        "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                      }
                      variant={"rounded"}
                      sx={{ height: 128 + 32, width: 128 + 32 }}
                    />
                  ) : (
                    <Box sx={{ height: 128 + 32 }} />
                  )}
                </Stack>
              </CardContent>
              <Box sx={{ padding: 2, paddingTop: 0 }}>
                <Stack
                  direction={"row"}
                  spacing={theme.layoutSpacing.compact}
                  flexWrap={"wrap"}
                >
                  <Chip
                    color={"primary"}
                    label={t(`myServices.${service.kind}`, {
                      defaultValue: service.kind,
                    })}
                    sx={{ marginBottom: 1, padding: 1 }}
                    variant={"outlined"}
                    icon={orderIcons[service.kind]}
                    onClick={
                      (event) => event.stopPropagation() // Don't highlight cell if button clicked
                    }
                  />
                  {service.rush && (
                    <Chip
                      color={"warning"}
                      label={t("serviceListings.rush")}
                      sx={{ marginBottom: 1, padding: 1 }}
                      variant={"outlined"}
                      icon={<ElectricBoltRounded />}
                      onClick={
                        (event) => event.stopPropagation() // Don't highlight cell if button clicked
                      }
                    />
                  )}
                  {service.languages && service.languages.length > 0 && (
                    <>
                      {service.languages.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={lang.name}
                          variant="outlined"
                          sx={{ marginBottom: 1, padding: 1 }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ))}
                    </>
                  )}
                </Stack>
              </Box>
            </Card>
          </CardActionArea>
        </Fade>
      </Link>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if service data actually changed
    return (
      prevProps.service.service_id === nextProps.service.service_id &&
      prevProps.service.cost === nextProps.service.cost &&
      prevProps.service.status === nextProps.service.status &&
      prevProps.index === nextProps.index
    )
  },
)

export function ServiceListing(props: { service: Service; index: number }) {
  const { service, index } = props

  return (
    <Grid item xs={12} lg={6}>
      <ServiceListingBase service={service} index={index} />
    </Grid>
  )
}

export function ServiceListings(props: { user?: string; contractor?: string }) {
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(20)
  const [searchState] = useServiceSearch()
  const { user, contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  // Build query parameters for server-side filtering and pagination
  const queryParams: ServicesQueryParams = useMemo(() => {
    const params: ServicesQueryParams = {
      page,
      pageSize: perPage,
      sortBy: "timestamp",
      sortOrder: "desc",
    }

    // Add search filters
    if (searchState.query) {
      params.search = searchState.query
    }
    if (searchState.kind) {
      params.kind = searchState.kind
    }
    if (searchState.minOffer) {
      params.minCost = searchState.minOffer
    }
    if (searchState.maxOffer) {
      params.maxCost = searchState.maxOffer
    }
    if (searchState.paymentType) {
      params.paymentType = searchState.paymentType
    }
    if (searchState.language_codes && searchState.language_codes.length > 0) {
      params.language_codes = searchState.language_codes.join(",")
    }

    return params
  }, [page, perPage, searchState])

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

  // Apply client-side filters for user/contractor (these are specific to the component)
  const filteredServices = useMemo(() => {
    if (!servicesResponse?.data) return []

    return servicesResponse.data.filter((service) => {
      // Filter by user if specified
      if (user && service.user?.username !== user) {
        return false
      }

      // Filter by contractor if specified
      if (contractor && service.contractor?.spectrum_id !== contractor) {
        return false
      }

      // Filter by custom org if specified
      if (
        CURRENT_CUSTOM_ORG &&
        service.contractor?.spectrum_id !== CURRENT_CUSTOM_ORG
      ) {
        return false
      }

      return true
    })
  }, [servicesResponse?.data, user, contractor])

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
        <Typography color="error">{t("error_loading_services")}</Typography>
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
          {filteredServices.map((service, index) => (
            <ServiceListing
              service={service}
              key={service.service_id}
              index={index}
            />
          ))}
          {servicesResponse && filteredServices.length === 0 && (
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
        <TablePagination
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
          count={servicesResponse?.pagination.totalItems || 0}
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

export function HorizontalServiceListings(props: { listings: Service[] }) {
  const { listings } = props

  return (
    <Grid item xs={12}>
      <Box
        display={"flex"}
        sx={{
          // "& > *": {
          // [theme.breakpoints.up("xs")]: {
          //     width: 250,
          // },
          // },
          maxWidth: "100%",
          overflowX: "scroll",
        }}
      >
        {listings.map((item, index) => (
          <Box
            key={item.service_id}
            sx={{
              marginLeft: 1,
              marginRight: 1,
              width: 400,
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            <ServiceListingBase service={item} key={index} index={index} />
          </Box>
        ))}
      </Box>
    </Grid>
  )
}

export function RecentServicesSkeleton() {
  return (
    <Grid item xs={12}>
      <Box
        display={"flex"}
        sx={{
          maxWidth: "100%",
          overflowX: "scroll",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
          (item, index) => (
            <Box
              key={index}
              sx={{
                marginLeft: 1,
                marginRight: 1,
                width: 400,
                display: "inline-block",
                flexShrink: 0,
              }}
            >
              <Skeleton
                variant={"rectangular"}
                height={400}
                width={250}
                sx={{
                  borderRadius: (theme) =>
                    theme.spacing((theme as ExtendedTheme).borderRadius.image),
                }}
              />
            </Box>
          ),
        )}
      </Box>
    </Grid>
  )
}

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
