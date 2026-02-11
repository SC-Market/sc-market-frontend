import React, { useMemo, useCallback } from "react"
import { Helmet } from "react-helmet"
import { useMainRef } from "../../hooks/layout/MainRef"
import { FRONTEND_URL } from "../../util/constants"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Link } from "react-router-dom"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { getRelativeTime } from "../../util/time"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
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

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';

export function ServiceSellerReviews(props: {
  userSeller?: { username: string } | null
  contractorSeller?: { spectrum_id: string } | null
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
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
        <Grid container spacing={theme.layoutSpacing.layout}>
          {reviews.map((review: OrderReview) => (
            <Grid item xs={12} md={4} key={review.review_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: (theme) =>
                    theme.spacing(theme.borderRadius.topLevel),
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
                  maxWidth: 320,
                  flexShrink: 0,
                }}
              >
                <ButtonBase
                  component={Link}
                  to={`/order/service/${service.service_id}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: (theme) =>
                      theme.spacing(theme.borderRadius.button),
                    textAlign: "left",
                  }}
                >
                  <Card
                    sx={{
                      height: 200, // Fixed height for consistent appearance
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      sx={{ pb: 1 }}
                      title={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            wordBreak: "break-word",
                          }}
                        >
                          {service.service_name}
                        </Typography>
                      }
                      subheader={
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {service.cost.toLocaleString()} aUEC
                        </Typography>
                      }
                    />
                    <CardContent
                      sx={{ pt: 0, pb: 2, flexGrow: 1, overflow: "hidden" }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                          lineHeight: 1.4,
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

  // Get services filtered by kind for related services
  const { data: servicesResponse, isLoading } = useGetPublicServicesQuery({
    kind: serviceKind,
    pageSize: 20, // Get more to filter out current service
  })

  const relatedServices = useMemo(() => {
    if (!servicesResponse?.data) return []

    return servicesResponse.data
      .filter((s) => s.service_id !== currentServiceId)
      .slice(0, 6) // Show max 6 related services
  }, [servicesResponse?.data, currentServiceId])

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
                  maxWidth: 320,
                  flexShrink: 0,
                }}
              >
                <ButtonBase
                  component={Link}
                  to={`/order/service/${service.service_id}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: (theme) =>
                      theme.spacing(theme.borderRadius.button),
                    textAlign: "left",
                  }}
                >
                  <Card
                    sx={{
                      height: 200, // Fixed height for consistent appearance
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      sx={{ pb: 1 }}
                      title={
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            wordBreak: "break-word",
                          }}
                        >
                          {service.service_name}
                        </Typography>
                      }
                      subheader={
                        <Box>
                          <Typography variant="body2" color="primary">
                            {service.cost.toLocaleString()} aUEC
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                            }}
                          >
                            by{" "}
                            {service.user?.display_name ||
                              service.contractor?.name}
                          </Typography>
                        </Box>
                      }
                    />
                    <CardContent
                      sx={{ pt: 0, pb: 2, flexGrow: 1, overflow: "hidden" }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                          lineHeight: 1.4,
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
  const theme = useTheme<ExtendedTheme>()
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
  );
}
