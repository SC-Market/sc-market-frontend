import { Link, useParams } from "react-router-dom"
import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Tabs,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useTheme } from "@mui/material/styles"
import {
  CreateRounded,
  DesignServicesRounded,
  InfoRounded,
  StarRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import {
  useGetShopQuery,
  ShopPublicResponse,
} from "../../../store/api/v2/market"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  BANNER_OVERLAP,
  DarkBannerContainer,
  LightBannerContainer,
} from "../../profile/components/BannerContainers"
import type { User } from "../../../datatypes/User"
import { HapticTab } from "../../../components/haptic"
import { a11yProps } from "../../../components/tabs/Tabs"
import { useShopTab } from "../hooks/useShopTab"
import { ServiceListings } from "../../services/components/ServiceListings"
import { ServiceSearchArea } from "../../../views/services/ServiceSearchArea"
import { MarkdownRender } from "../../../components/markdown/Markdown"
import { FRONTEND_URL } from "../../../util/constants"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import { SHOP_PATHS, ORG_PATHS, USER_PATHS } from "../../../routes/paths"
import { buildShopHead } from "../../../seo/entityHeads"
import { SeoHead } from "../../../seo/SeoHead"
import { ShopProfileSkeleton } from "../../../components/skeletons/ShopProfileSkeleton"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"
import { useTranslation } from "react-i18next"

import { ShopHeader, ShopRatingSummary } from "./ShopProfileHeader"
import { ShopReviewsTab } from "./ShopReviewsTab"
import { ShopListingsTab } from "./ShopListingsTab"
export function ShopProfile() {
  const { slug } = useParams<{ slug: string }>()
  const theme = useTheme<ExtendedTheme>()
  const {
    data: shop,
    isLoading,
    error,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useGetShopQuery({ slug: slug! }, { skip: !slug })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )
  const currentTab = useShopTab()
  const { t } = useTranslation()

  if (isLoading) return <ShopProfileSkeleton />

  if (error || !shop) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <StorefrontRounded
          sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h5">{t("shops.profile.notFound")}</Typography>
      </Container>
    )
  }

  const bannerProfile = { banner: shop.banner_url || "" } as unknown as User

  return (
    <Box sx={{ position: "relative" }}>
      <SeoHead head={buildShopHead(shop, FRONTEND_URL)} />
      {theme.palette.mode === "dark" ? (
        <DarkBannerContainer profile={bannerProfile} />
      ) : (
        <LightBannerContainer profile={bannerProfile} />
      )}
      <Box
        sx={{
          position: "relative",
          top: -BANNER_OVERLAP[theme.palette.mode],
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.component}
                alignItems="flex-end"
                justifyContent="space-between"
                minHeight={375}
              >
                <Grid item xs={12} md={8}>
                  <ShopHeader shop={shop} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ShopRatingSummary shop={shop} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ShopTabs slug={slug!} currentTab={currentTab} shop={shop} />
            </Grid>
          </Grid>
        </Container>

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <ShopTabContent currentTab={currentTab} slug={slug!} shop={shop} />
        </Container>
      </Box>
    </Box>
  )
}

function ShopTabs(props: {
  slug: string
  currentTab: number
  shop: ShopPublicResponse
}) {
  const { t } = useTranslation()
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider.light" }}>
      <Tabs
        value={props.currentTab}
        variant="scrollable"
        aria-label={t("shops.profile.tabsLabel")}
      >
        <HapticTab
          label={t("shops.profile.tabListings")}
          component={Link}
          to={SHOP_PATHS.profile(props.slug)}
          icon={<StorefrontRounded />}
          {...a11yProps(0)}
        />
        <HapticTab
          label={t("shops.profile.tabServices")}
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "services")}
          icon={<DesignServicesRounded />}
          {...a11yProps(1)}
        />
        <HapticTab
          label={t("shops.profile.tabReviews")}
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "reviews")}
          icon={<StarRounded />}
          {...a11yProps(2)}
        />
        <HapticTab
          label={t("shops.profile.tabAbout")}
          component={Link}
          to={SHOP_PATHS.profileTab(props.slug, "about")}
          icon={<InfoRounded />}
          {...a11yProps(3)}
        />
        {props.shop.accepts_custom_orders && (
          <HapticTab
            label={t("shops.profile.tabOrder")}
            component={Link}
            to={SHOP_PATHS.profileTab(props.slug, "order")}
            icon={<CreateRounded />}
            {...a11yProps(4)}
          />
        )}
      </Tabs>
    </Box>
  )
}

function ShopTabContent(props: {
  currentTab: number
  slug: string
  shop: ShopPublicResponse
}) {
  switch (props.currentTab) {
    case 0:
      return <ShopListingsTab slug={props.slug} />
    case 1:
      return <ShopServicesTab shop={props.shop} />
    case 2:
      return <ShopReviewsTab shop={props.shop} />
    case 3:
      return <ShopAboutTab shop={props.shop} />
    case 4:
      return <ShopOrderTab shop={props.shop} />
    default:
      return null
  }
}

function ShopServicesTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  // Services are owned by users/orgs, so filter by the shop owner
  const ownerFilter = shop.owner
    ? shop.owner.type === "user"
      ? { user: shop.owner.slug }
      : { contractor: shop.owner.slug }
    : {}

  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent="center"
    >
      <Grid item xs={12} md={3} sx={{ display: { xs: "none", md: "block" } }}>
        <Paper sx={{ padding: 1 }}>
          <ServiceSearchArea />
        </Paper>
      </Grid>
      <Grid item xs={12} md={9}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent="center"
        >
          <ServiceListings {...ownerFilter} />
        </Grid>
      </Grid>
    </Grid>
  )
}

function ShopAboutTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12} md={8}>
        {shop.description ? (
          <MarkdownRender text={shop.description} />
        ) : (
          <Typography color="text.secondary">
            {t("shops.profile.noDescription")}
          </Typography>
        )}
      </Grid>
      {shop.owner && (
        <Grid item xs={12} md={4}>
          <OwnerCard owner={shop.owner} />
        </Grid>
      )}
    </Grid>
  )
}

function ShopOrderTab(props: { shop: ShopPublicResponse }) {
  const { shop } = props
  const theme = useTheme<ExtendedTheme>()

  const contractorId =
    shop.owner?.type === "contractor" ? shop.owner.slug : undefined
  const assignedTo = shop.owner?.type === "user" ? shop.owner.slug : undefined

  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent="center"
    >
      <CreateOrderForm contractor_id={contractorId} assigned_to={assignedTo} />
    </Grid>
  )
}

function OwnerCard(props: { owner: NonNullable<ShopPublicResponse["owner"]> }) {
  const { owner } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const ownerLink =
    owner.type === "contractor"
      ? ORG_PATHS.profile(owner.slug)
      : USER_PATHS.profile(owner.slug)

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: theme.spacing(1),
        border: `1px solid`,
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t("shops.profile.owner")}
      </Typography>
      <Stack
        component={Link}
        to={ownerLink}
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ textDecoration: "none", color: "inherit" }}
      >
        <ImageAvatar
          alt=""
          src={owner.avatar_url || undefined}
          sx={{ width: 40, height: 40 }}
        >
          {owner.name[0]}
        </ImageAvatar>
        <Typography variant="body1" fontWeight={500}>
          {owner.name}
        </Typography>
      </Stack>
    </Box>
  )
}
