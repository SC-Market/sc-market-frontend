import React, { useMemo, useCallback } from "react"
import { useMainRef } from "../../hooks/layout/MainRef"
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Fade,
  Grid,
  IconButton,
  Link as MaterialLink,
  Typography,
  Rating,
  Divider,
  ButtonBase,
  Button,
} from "@mui/material"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  CreateRounded,
  StarRounded,
  ShoppingCartRounded,
} from "@mui/icons-material"
import { orderIcons, Service } from "../../datatypes/Order"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { dateDiffInDays } from "../market/MarketListingView"
import { statusColors } from "../orders/OrderList"
import { ImagePreviewPaper } from "../../components/paper/ImagePreviewPaper"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../components/button/ReportButton"
import { useGetUserOrderReviews } from "../../store/profile"
import { useGetContractorReviewsQuery } from "../../store/contractor"
import {
  useGetServicesContractorQuery,
  useGetServicesQuery,
  useGetPublicServicesQuery,
} from "../../store/services"
import { OrderReview } from "../../datatypes/Order"

export function ServiceSellerReviews(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
}) {
  const { t } = useTranslation()
  const { userSeller, contractorSeller } = props

  // Get reviews for user or contractor
  const { data: userReviews, isLoading: userReviewsLoading } =
    useGetUserOrderReviews(userSeller?.username || "", {
      skip: !userSeller?.username,
    })

  const { data: contractorReviews, isLoading: contractorReviewsLoading } =
    useGetContractorReviewsQuery(contractorSeller?.spectrum_id || "", {
      skip: !contractorSeller?.spectrum_id,
    })

  const reviews = useMemo(() => {
    const allReviews = userReviews || contractorReviews || []
    return allReviews.slice(0, 3) // Show max 3 recent reviews
  }, [userReviews, contractorReviews])

  const isLoading = userReviewsLoading || contractorReviewsLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""
  const totalReviews = userReviews?.length || contractorReviews?.length || 0

  // Don't show section if no seller info, still loading, or no reviews
  if (!sellerName || isLoading || !reviews.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight="bold">
            {t("serviceView.sellerReviews", {
              seller: sellerName,
              defaultValue: `Reviews for ${sellerName}`,
            })}
          </Typography>
          {totalReviews > 3 && (
            <MaterialLink
              component={Link}
              to={
                userSeller
                  ? `/user/${userSeller.username}/reviews`
                  : `/contractor/${contractorSeller?.spectrum_id}/reviews`
              }
              underline="hover"
              color="primary"
              variant="body2"
            >
              {t("serviceView.viewAllReviews", "View all {{count}} reviews", {
                count: totalReviews,
              })}
            </MaterialLink>
          )}
        </Box>
        <Grid container spacing={2}>
          {reviews.map((review: OrderReview) => (
            <Grid item xs={12} md={4} key={review.review_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Rating
                    value={review.rating}
                    max={5}
                    readOnly
                    size="small"
                    icon={<StarRounded fontSize="inherit" />}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(new Date(review.timestamp))}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    mb: 1,
                  }}
                >
                  {review.content ||
                    t("serviceView.noReviewContent", "No review content")}
                </Typography>
                <Divider light sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {t("serviceView.reviewBy", "by")}{" "}
                  {review.user_author?.display_name ||
                    review.contractor_author?.name ||
                    t("serviceView.anonymousReviewer", "Anonymous")}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  )
}

export function ServiceSellerOtherServices(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
  currentServiceId: string
}) {
  const { t } = useTranslation()
  const { userSeller, contractorSeller, currentServiceId } = props

  // Get other services from the same seller
  const { data: userServices, isLoading: userServicesLoading } =
    useGetServicesQuery(userSeller?.username || "", {
      skip: !userSeller?.username,
    })

  const { data: contractorServices, isLoading: contractorServicesLoading } =
    useGetServicesContractorQuery(contractorSeller?.spectrum_id || "", {
      skip: !contractorSeller?.spectrum_id,
    })

  const otherServices = useMemo(() => {
    const allServices = userServices || contractorServices || []
    return allServices
      .filter((s) => s.service_id !== currentServiceId) // Exclude current service
      .slice(0, 6) // Show max 6 other services
  }, [userServices, contractorServices, currentServiceId])

  const isLoading = userServicesLoading || contractorServicesLoading
  const sellerName = userSeller?.username || contractorSeller?.spectrum_id || ""

  // Don't show section if no seller info, still loading, or no other services
  if (!sellerName || isLoading || !otherServices.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("serviceView.otherServicesFrom", {
            seller: sellerName,
            defaultValue: `Other services from ${sellerName}`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1,
          }}
        >
          <Box display={"flex"} gap={2}>
            {otherServices.map((service, index) => (
              <Box
                key={service.service_id}
                sx={{
                  minWidth: 280,
                  flexShrink: 0,
                }}
              >
                <ButtonBase
                  component={Link}
                  to={`/order/service/${service.service_id}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 1,
                    textAlign: "left",
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          noWrap
                        >
                          {service.service_name}
                        </Typography>
                      }
                      subheader={
                        <Typography variant="body2" color="primary">
                          {service.cost.toLocaleString()} aUEC
                        </Typography>
                      }
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {service.service_description}
                      </Typography>
                    </CardContent>
                  </Card>
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

export function RelatedServicesByCategory(props: {
  serviceKind: string
  currentServiceId: string
}) {
  const { t } = useTranslation()
  const { serviceKind, currentServiceId } = props

  // Get all public services and filter by kind
  const { data: allServices, isLoading } = useGetPublicServicesQuery()

  const relatedServices = useMemo(() => {
    if (!allServices) return []

    return allServices
      .filter(
        (s) => s.kind === serviceKind && s.service_id !== currentServiceId,
      )
      .slice(0, 6) // Show max 6 related services
  }, [allServices, serviceKind, currentServiceId])

  // Don't show section if no related services or still loading
  if (isLoading || !relatedServices.length) return null

  return (
    <Grid item xs={12}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          color="text.secondary"
          fontWeight="bold"
          gutterBottom
        >
          {t("serviceView.relatedServices", {
            category: serviceKind,
            defaultValue: `Related ${serviceKind} services`,
          })}
        </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            overflowX: "scroll",
            pb: 1,
          }}
        >
          <Box display={"flex"} gap={2}>
            {relatedServices.map((service) => (
              <Box
                key={service.service_id}
                sx={{
                  minWidth: 280,
                  flexShrink: 0,
                }}
              >
                <ButtonBase
                  component={Link}
                  to={`/order/service/${service.service_id}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 1,
                    textAlign: "left",
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          noWrap
                        >
                          {service.service_name}
                        </Typography>
                      }
                      subheader={
                        <Box>
                          <Typography variant="body2" color="primary">
                            {service.cost.toLocaleString()} aUEC
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by{" "}
                            {service.user?.display_name ||
                              service.contractor?.name}
                          </Typography>
                        </Box>
                      }
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {service.service_description}
                      </Typography>
                    </CardContent>
                  </Card>
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Grid>
  )
}

export function ServiceView(props: {
  service: Service
  orderFormRef?: React.RefObject<HTMLDivElement | null>
}) {
  const { service } = props
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const { t } = useTranslation()
  const mainRef = useMainRef()
  const paymentType = PAYMENT_TYPE_MAP.get(service.payment_type) || ""

  const amAssigned = useMemo(
    () => profile && service.user?.username === profile?.username,
    [service, profile],
  )
  const amContractor = useMemo(
    () =>
      profile && currentOrg?.spectrum_id === service?.contractor?.spectrum_id,
    [currentOrg?.spectrum_id, profile, service?.contractor?.spectrum_id],
  )
  const amRelated = useMemo(
    () => amAssigned || amContractor,
    [amAssigned, amContractor],
  )
  // const amContractorManager = useMemo(() =>
  //         amContractor && has_permission(service.contractor, profile, 'manage_orders'),
  //     [currentOrg, profile, amContractor]
  // )

  const scrollToOrderForm = useCallback(() => {
    if (props.orderFormRef?.current && mainRef.current) {
      const formElement = props.orderFormRef.current
      const scrollContainer = mainRef.current
      
      const formRect = formElement.getBoundingClientRect()
      const containerRect = scrollContainer.getBoundingClientRect()
      
      const headerOffset = 80
      const targetPosition = scrollContainer.scrollTop + (formRect.top - containerRect.top) - headerOffset
      
      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }, [props.orderFormRef, mainRef])

  // TODO: Display all fields, like collateral

  return (
    <>
      <Grid item xs={12} lg={4}>
        <ImagePreviewPaper photos={service.photos} />
      </Grid>

      <Grid item xs={12} lg={8}>
        <Fade in={true}>
          <Card
            sx={{
              borderRadius: 3,
              padding: 0,
            }}
          >
            <CardHeader
              disableTypography
              title={
                <Typography
                  sx={{ marginRight: 1 }}
                  variant={"h6"}
                  color={"text.secondary"}
                >
                  {service.service_name}
                </Typography>
              }
              subheader={
                <Box
                  sx={{ padding: 1.5, paddingLeft: 0 }}
                  display={"flex"}
                  alignItems={"center"}
                >
                  {dateDiffInDays(new Date(), new Date(service.timestamp)) <
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
                  {amRelated && (
                    <Chip
                      label={t(
                        `orders.status.${service.status.replace(
                          /-([a-z])/g,
                          (g) => g[1].toUpperCase(),
                        )}`,
                        { defaultValue: service.status.replace("-", " ") },
                      )}
                      color={statusColors.get(service.status)}
                      sx={{
                        marginRight: 1,
                        textTransform: "capitalize",
                        fontSize: "0.85em",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                  <MaterialLink
                    component={Link}
                    to={
                      service.user?.username
                        ? `/user/${service.user.username}`
                        : `/contractor/${service.contractor?.spectrum_id}`
                    }
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <UnderlineLink
                      color={"text.primary"}
                      variant={"subtitle2"}
                      sx={{
                        fontWeight: "400",
                      }}
                    >
                      {service.user?.display_name || service.contractor?.name}
                    </UnderlineLink>
                  </MaterialLink>
                  <Typography
                    display={"inline"}
                    color={"text.primary"}
                    variant={"subtitle2"}
                  >
                    &nbsp;- {getRelativeTime(new Date(service.timestamp))}{" "}
                    -&nbsp;
                  </Typography>
                  <Typography
                    display={"inline"}
                    color={"primary"}
                    variant={"subtitle2"}
                  >
                    {service.cost.toLocaleString(undefined)} aUEC{" "}
                    {paymentType ? t(paymentType) : ""}
                  </Typography>
                  <Typography display={"inline"} variant={"subtitle2"}>
                    &nbsp;-&nbsp;
                    <ReportButton
                      reportedUrl={`/order/service/${service.service_id}`}
                    />
                  </Typography>
                </Box>
              }
              action={
                <>
                  {amRelated ? (
                    <Link to={`/order/service/${service.service_id}/edit`}>
                      <IconButton>
                        <CreateRounded style={{ color: "white" }} />
                      </IconButton>
                    </Link>
                  ) : undefined}
                </>
              }
            />
            <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
              {
                <Typography>
                  <MarkdownRender text={service.service_description} />
                </Typography>
              }
            </CardContent>
            <CardActions>
              <Grid
                container
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    color={"primary"}
                    label={t(`myServices.${service.kind}`, {
                      defaultValue: service.kind,
                    })}
                    sx={{ marginRight: 1, marginBottom: 1, padding: 1 }}
                    variant={"outlined"}
                    icon={orderIcons[service.kind]}
                    onClick={
                      (event) => event.stopPropagation() // Don't highlight cell if button clicked
                    }
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ShoppingCartRounded />}
                  onClick={scrollToOrderForm}
                  sx={{ marginBottom: 1 }}
                >
                  {t("serviceView.placeOrder", "Place Order")}
                </Button>
              </Grid>
            </CardActions>
          </Card>
        </Fade>
      </Grid>

      {/* Service Seller Reviews Section - Full Width */}
      <ServiceSellerReviews
        userSeller={service.user}
        contractorSeller={service.contractor}
      />

      {/* Service Seller's Other Services Section - Full Width */}
      <ServiceSellerOtherServices
        userSeller={service.user}
        contractorSeller={service.contractor}
        currentServiceId={service.service_id}
      />

      {/* Related Services by Category Section - Full Width */}
      <RelatedServicesByCategory
        serviceKind={service.kind}
        currentServiceId={service.service_id}
      />
    </>
  )
}
