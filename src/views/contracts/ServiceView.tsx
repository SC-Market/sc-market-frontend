import React, { useMemo, useCallback } from "react"
import { Helmet } from "@unhead/react/helmet"
import { useMainRef } from "../../hooks/layout/MainRef"
import { FRONTEND_URL } from "../../util/constants"
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
  Button,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import {
  ORDER_PATHS,
  ORG_PATHS,
  SHOP_PATHS,
  USER_PATHS,
} from "../../routes/paths"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { CreateRounded, ShoppingCartRounded } from "@mui/icons-material"
import { orderIcons } from "../../features/orders/components/orderIcons"
import type { Service } from "../../features/orders/domain/types"
import { MarkdownRender } from "../../components/markdown/Markdown.lazy"
import { dateDiffInDays } from "../../util/dateDiff"
import { statusColors } from "../orders/OrderList"
import { ImagePreviewPaper } from "../../components/paper/ImagePreviewPaper"
import { PAYMENT_TYPE_MAP } from "../../util/constants"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../components/button/ReportButton"
import { useFormatters, useNow } from "../../util/format"
import { ServiceSellerReviews } from "./ServiceSellerReviews"
import { ServiceSellerOtherServices } from "./ServiceSellerOtherServices"
import { RelatedServicesByCategory } from "./RelatedServicesByCategory"
export { RelatedServicesByCategory } from "./RelatedServicesByCategory"
export { ServiceSellerOtherServices } from "./ServiceSellerOtherServices"
export { ServiceSellerReviews } from "./ServiceSellerReviews"

export function ServiceView(props: {
  service: Service
  orderFormRef?: React.RefObject<HTMLDivElement | null>
}) {
  const fmt = useFormatters()
  const now = useNow()
  const { service } = props
  const theme = useTheme<ExtendedTheme>()
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()
  const mainRef = useMainRef()
  const paymentType = PAYMENT_TYPE_MAP.get(service.payment_type) || ""

  const amAssigned = useMemo(
    () => profile && service.user?.username === profile?.username,
    [service, profile],
  )
  const amContractor = useMemo(
    () =>
      !!profile &&
      !!service?.contractor?.spectrum_id &&
      profile.contractors?.some(
        (c) => c.spectrum_id === service.contractor?.spectrum_id,
      ),
    [profile, service?.contractor?.spectrum_id],
  )
  const amRelated = useMemo(
    () => amAssigned || amContractor,
    [amAssigned, amContractor],
  )

  const scrollToOrderForm = useCallback(() => {
    if (props.orderFormRef?.current && mainRef.current) {
      const formElement = props.orderFormRef.current
      const scrollContainer = mainRef.current

      const formRect = formElement.getBoundingClientRect()
      const containerRect = scrollContainer.getBoundingClientRect()

      const headerOffset = 80
      const targetPosition =
        scrollContainer.scrollTop +
        (formRect.top - containerRect.top) -
        headerOffset

      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
  }, [props.orderFormRef, mainRef])

  // TODO: Display all fields, like collateral

  return (
    <>
      <Helmet>
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${FRONTEND_URL}/order/service/${service.service_id}`}
        />
        <meta
          property="og:title"
          content={`${service.service_name} - SC Market`}
        />
        <meta
          property="og:description"
          content={service.service_description || service.description}
        />
        <meta property="og:image" content={service.photos[0]} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content={`${FRONTEND_URL}/order/service/${service.service_id}`}
        />
        <meta
          name="twitter:title"
          content={`${service.service_name} - SC Market`}
        />
        <meta
          name="twitter:description"
          content={service.service_description || service.description}
        />
        <meta name="twitter:image" content={service.photos[0]} />
      </Helmet>
      <Grid item xs={12} lg={4}>
        <ImagePreviewPaper photos={service.photos} />
      </Grid>

      <Grid item xs={12} lg={8}>
        <Fade in={true}>
          <Card
            sx={{
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
                  {dateDiffInDays(new Date(now), new Date(service.timestamp)) <
                    1 && (
                    <Chip
                      variant="outlined"
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
                      service.shop?.slug
                        ? SHOP_PATHS.profile(service.shop.slug)
                        : service.user?.username
                          ? USER_PATHS.profile(service.user.username)
                          : ORG_PATHS.profile(
                              service.contractor?.spectrum_id ?? "",
                            )
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
                    &nbsp;- {fmt.relative(new Date(service.timestamp), now)}{" "}
                    -&nbsp;
                  </Typography>
                  <Typography
                    display={"inline"}
                    color={"primary"}
                    variant={"subtitle2"}
                  >
                    {fmt.number(service.cost)} aUEC{" "}
                    {paymentType ? t(paymentType) : ""}
                  </Typography>
                  <Typography display={"inline"} variant={"subtitle2"}>
                    &nbsp;-&nbsp;
                    <ReportButton
                      reportedUrl={ORDER_PATHS.service(service.service_id)}
                    />
                  </Typography>
                </Box>
              }
              action={
                <>
                  {amRelated ? (
                    <Link to={ORDER_PATHS.serviceEdit(service.service_id)}>
                      <IconButton
                        aria-label={t("serviceView.edit", "Edit service")}
                      >
                        <CreateRounded
                          sx={{ color: theme.palette.background.light }}
                        />
                      </IconButton>
                    </Link>
                  ) : undefined}
                </>
              }
            />
            <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
              {
                <Typography component="div">
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
                spacing={{ xs: 2, sm: 0 }}
                sx={{
                  flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                  alignItems: { xs: "stretch", sm: "center" }, // Stretch on mobile for full-width button
                }}
              >
                <Grid item xs={12} sm="auto">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: { xs: "nowrap", sm: "wrap" }, // No wrap on mobile, wrap on desktop
                      overflowX: { xs: "auto", sm: "visible" }, // Horizontal scroll on mobile
                      overflowY: "hidden",
                      pb: { xs: 0.5, sm: 0 }, // Small padding on mobile for scrollbar
                      "&::-webkit-scrollbar": {
                        height: 4,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.divider,
                        borderRadius: 2,
                      },
                    }}
                  >
                    <Chip
                      color={"primary"}
                      label={t(`myServices.${service.kind}`, {
                        defaultValue: service.kind,
                      })}
                      sx={{
                        marginRight: 1,
                        marginBottom: { xs: 0, sm: 1 },
                        padding: 1,
                        flexShrink: 0, // Prevent shrinking on mobile
                      }}
                      variant={"outlined"}
                      icon={orderIcons[service.kind]}
                      onClick={
                        (event) => event.stopPropagation() // Don't highlight cell if button clicked
                      }
                    />
                    {service.languages &&
                      service.languages.length > 0 &&
                      service.languages.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={lang.name}
                          variant="outlined"
                          sx={{
                            marginRight: 1,
                            marginBottom: { xs: 0, sm: 1 },
                            padding: 1,
                            flexShrink: 0, // Prevent shrinking on mobile
                          }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartRounded />}
                    onClick={scrollToOrderForm}
                    sx={{
                      marginBottom: { xs: 0, sm: 1 },
                      width: { xs: "100%", sm: "auto" }, // Full width on mobile
                    }}
                  >
                    {t("serviceView.placeOrder", "Place Order")}
                  </Button>
                </Grid>
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
