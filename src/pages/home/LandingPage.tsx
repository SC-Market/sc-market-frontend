import React, { useMemo, useState } from "react"
import { Page } from "../../components/metadata/Page"
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Container,
  Divider,
  Fade,
  Grid,
  Grid2,
  Link as MaterialLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material"
import { Theme, useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import logo from "../../assets/scmarket-logo.webp"
import recruitingCap from "../../assets/recruiting.webp"
import manageStockCap from "../../assets/manage-stock.webp"
import servicesCap from "../../assets/services-cap.webp"
import { OpenLayout } from "../../components/layout/ContainerGrid"
import { Footer } from "../../components/footer/Footer"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import { MarkdownRender } from "../../components/markdown/Markdown"
import {
  useGetMarketStatsQuery,
  useSearchMarketListingsQuery,
} from "../../features/market"
import { DisplayListingsHorizontal } from "../../views/market/ItemListings"
import { CURRENT_CUSTOM_ORG } from "../../hooks/contractor/CustomDomain"
import { Link, Navigate } from "react-router-dom"
import { MetricSection } from "../../views/orders/OrderMetrics"
import AnimatedNumbers from "react-animated-numbers"
import { Stack } from "@mui/system"
import CharLogo from "../../assets/CharHoldings_Logo.png"
import UNNLogo from "../../assets/UNN_Traders_Logo.webp"
import BirdIncLogo from "../../assets/birdinc.jpg"
import { useTranslation } from "react-i18next"
import { useGetUserProfileQuery } from "../../store/profile"
import { LoginArea } from "../../views/authentication/LoginArea"
import { HorizontalListingSkeleton } from "../../components/skeletons"

const bg = "https://media.tenor.com/4LKXThFQuHMAAAAd/perseus-star-citizen.gif"

function LandingSmallImage(props: { src: string; title: string }) {
  const { src, title } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Stack
      direction={"column"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <img
        src={src}
        style={{
          width: "100%",
          aspectRatio: "1/1",
          border: `1px solid ${theme.palette.outline.main}`,
          marginBottom: theme.spacing(2),
          objectFit: "cover",
          borderRadius: theme.spacing(theme.borderRadius.button),
        }}
        alt={title}
        loading="lazy"
      />
      <Typography
        variant={"h5"}
        sx={{ fontWeight: "bold", textAlign: "center" }}
        color={"text.secondary"}
      >
        {title}
      </Typography>
    </Stack>
  )
}

export function RecentListings() {
  const {
    data: results,
    isLoading,
    isFetching,
  } = useSearchMarketListingsQuery({
    page: 0,
    page_size: 8,
    statuses: "active",
    sale_type: "sale",
    listing_type: "unique",
    sort: "activity",
    quantityAvailable: 1,
  })

  return !(isLoading || isFetching) ? (
    <DisplayListingsHorizontal listings={results?.listings || []} />
  ) : (
    <RecentListingsSkeleton />
  )
}

export function RecentListingsSkeleton() {
  return (
    <Box
      display={"flex"}
      sx={{
        maxWidth: "100%",
        overflowX: "scroll",
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
        (item, index) => (
          <HorizontalListingSkeleton key={index} index={index} />
        ),
      )}
    </Box>
  )
}

export function OrderStatistics() {
  const { t } = useTranslation()
  const { data: stats } = useGetMarketStatsQuery()
  const { total_orders, total_order_value, week_orders, week_order_value } =
    stats || {
      total_orders: 0,
      total_order_value: 0,
      week_orders: 0,
      week_order_value: 0,
    }

  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent={"center"}
    >
      <MetricSection
        title={t("landing.totalOrders")}
        body={<AnimatedNumbers includeComma animateToNumber={total_orders} />}
      />
      <MetricSection
        title={t("landing.totalOrderValue")}
        body={
          <Box display={"flex"}>
            {
              <AnimatedNumbers
                includeComma
                animateToNumber={total_order_value}
              />
            }
            &nbsp;aUEC
          </Box>
        }
      />
      {+week_orders > 0 && (
        <>
          <MetricSection
            title={t("landing.ordersThisWeek")}
            body={
              <Box display={"flex"}>
                {<AnimatedNumbers includeComma animateToNumber={week_orders} />}
              </Box>
            }
          />
          <MetricSection
            title={t("landing.valueOfOrdersThisWeek")}
            body={
              <Box display={"flex"}>
                {
                  <AnimatedNumbers
                    includeComma
                    animateToNumber={week_order_value}
                  />
                }
                &nbsp;aUEC
              </Box>
            }
          />
        </>
      )}
    </Grid>
  )
}

export function LandingPage() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const profile = useGetUserProfileQuery()

  return (
    <Page>
      <OpenLayout
        sidebarOpen={true}
        style={{
          // "& > *": { paddingBottom: 4 },
          position: "relative",
          overflowY: "scroll",
          overflowX: "hidden",
          paddingTop: 20,
          background: `radial-gradient(at 100% 0%, ${theme.palette.primary.main}80 0px, transparent 60%),radial-gradient(at 0% 0%, ${theme.palette.secondary.main}80 0px, transparent 60%)`,
        }}
        noFooter
      >
        {CURRENT_CUSTOM_ORG && (
          <Navigate to={`/contractor/${CURRENT_CUSTOM_ORG}`} />
        )}
        <Stack
          direction={"column"}
          sx={{
            maxWidth: "100%",
            paddingBottom: theme.spacing(4),
            paddingTop: theme.spacing(2),
          }}
        >
          <Box
            sx={{
              // background: `url(${bg})`,
              backgroundSize: "cover",
              display: "flex",
              justifyContent: "center",
              backgroundPosition: "center",
              paddingBottom: theme.spacing(8),
            }}
          >
            {/* corrected central block text */}
            <Container
              maxWidth="lg"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing(4),
              }}
            >
              <Stack
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                sx={{
                  width: "100%",
                  textAlign: "center",
                  flex: { xs: "1 1 auto", md: "0 1 auto" },
                }}
              >
                <Avatar
                  sx={{
                    [theme.breakpoints.up("lg")]: {
                      width: theme.spacing(32),
                      height: theme.spacing(32),
                    },
                    [theme.breakpoints.down("lg")]: {
                      width: theme.spacing(24),
                      height: theme.spacing(24),
                    },
                  }}
                  src={logo}
                  alt={t("accessibility.scMarketLogo", "SC Market logo")}
                />
                <Typography color="secondary" variant="h1">
                  <b>SC MARKET</b>
                </Typography>
                <Typography
                  variant="h2"
                  sx={{ width: "100%", textAlign: "center" }}
                >
                  {t("landing.subtitle")}
                </Typography>
              </Stack>
              {!profile.data && (
                <Box
                  sx={{
                    width: { xs: "100%", md: "auto" },
                    maxWidth: { xs: "100%", md: 480 },
                    flex: { xs: "1 1 auto", md: "0 1 auto" },
                  }}
                >
                  <Grid
                    container
                    spacing={theme.layoutSpacing.layout}
                    justifyContent="center"
                  >
                    <LoginArea />
                  </Grid>
                </Box>
              )}
            </Container>
          </Box>
          <Container>
            <Stack
              spacing={theme.spacing(6)}
              alignItems={"center"}
              justifyContent={"center"}
              direction={"column"}
            >
              <OrderStatistics />

              <Box
                maxWidth={"100%"}
                sx={{
                  overflowX: "scroll",
                }}
              >
                <RecentListings />
              </Box>

              <Grid2
                container
                justifyContent={"center"}
                spacing={theme.layoutSpacing.layout * 4}
              >
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Stack direction={"column"}>
                    <Typography
                      variant={"h4"}
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                      color={"text.secondary"}
                    >
                      {t("landing.buySellItemsTitle")}
                    </Typography>
                    <Typography
                      variant={"body1"}
                      sx={{ textAlign: "left" }}
                      color={"text.secondary"}
                    >
                      {t("landing.buySellItemsText")}
                    </Typography>
                  </Stack>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Stack direction={"column"}>
                    <Typography
                      variant={"h4"}
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                      color={"text.secondary"}
                    >
                      {t("landing.tradeInBulkTitle")}
                    </Typography>
                    <Typography
                      variant={"body1"}
                      sx={{ textAlign: "left" }}
                      color={"text.secondary"}
                    >
                      {t("landing.tradeInBulkText")}
                    </Typography>
                  </Stack>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 4 }}>
                  <Stack direction={"column"}>
                    <Typography
                      variant={"h4"}
                      sx={{ fontWeight: "bold", textAlign: "center" }}
                      color={"text.secondary"}
                    >
                      {t("landing.orderServicesTitle")}
                    </Typography>
                    <Typography
                      variant={"body1"}
                      sx={{ textAlign: "left" }}
                      color={"text.secondary"}
                    >
                      {t("landing.orderServicesText")}
                    </Typography>
                  </Stack>
                </Grid2>
              </Grid2>
            </Stack>
          </Container>
          <Container>
            <Stack
              direction={"column"}
              spacing={theme.spacing(8)}
              sx={{
                paddingTop: theme.spacing(3),
                paddingBottom: theme.spacing(13),
              }}
            >
              <Stack justifyContent={"center"} alignItems={"center"}>
                <Typography
                  variant={"h3"}
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                  color={"text.secondary"}
                >
                  SC Market
                </Typography>
                <Typography
                  variant={"h4"}
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                  color={"text.secondary"}
                >
                  <span style={{ color: theme.palette.secondary.main }}>
                    {t("landing.forOrgs")}
                  </span>
                </Typography>
              </Stack>

              <Grid2
                container
                justifyContent={"center"}
                spacing={theme.layoutSpacing.layout * 2}
              >
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <LandingSmallImage
                    src={recruitingCap}
                    title={t("landing.orgRecruitment")}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <LandingSmallImage
                    src={servicesCap}
                    title={t("landing.serviceListings")}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 4 }}>
                  <LandingSmallImage
                    src={manageStockCap}
                    title={t("landing.stockManagement")}
                  />
                </Grid2>
              </Grid2>

              <Stack
                direction={"column"}
                spacing={theme.spacing(8)}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography
                  variant={"h5"}
                  sx={{ textAlign: "center" }}
                  color={"text.secondary"}
                >
                  {t("landing.orgsHelpText")}
                </Typography>
                <Button
                  variant={"outlined"}
                  color={"secondary"}
                  href={`https://github.com/henry232323/sc-market/wiki`}
                >
                  {t("landing.learnMore")}
                </Button>
              </Stack>
              <SupportersSection />
              <FAQSection />
            </Stack>
          </Container>
          <Footer />
        </Stack>
      </OpenLayout>
    </Page>
  )
}

export function FAQQuestion(props: {
  question: React.ReactNode
  answer: string
  last?: boolean
  first?: boolean
}) {
  const [open, setOpen] = useState(false)
  const { question, answer, last, first } = props
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          ...(first
            ? {
                borderTopLeftRadius: theme.spacing(0.5),
                borderTopRightRadius: theme.spacing(0.5),
              }
            : {}),
          ...(last
            ? {
                borderBottomLeftRadius: theme.spacing(0.5),
                borderBottomRightRadius: theme.spacing(0.5),
              }
            : {}),
        }}
      >
        <ListItemText>
          <Typography variant={"h5"} color={"text.secondary"}>
            {question}
          </Typography>
        </ListItemText>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {/*<Box sx={{
            padding: theme.spacing(1)
        }}>*/}
        <ListItem
          sx={
            {
              // border: `1px solid ${theme.palette.outline.main}`,
              // borderRadius: theme.spacing(1),
            }
          }
        >
          <Typography color={"text.secondary"} variant={"body1"}>
            <MarkdownRender text={answer} />
          </Typography>
        </ListItem>
        {/*</Box>*/}
      </Collapse>
      {!last && <Divider light />}
    </>
  )
}

function FAQSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Stack
      direction={"row"}
      sx={{ flexWrap: "wrap" }}
      spacing={theme.layoutSpacing.compact}
    >
      <Typography
        variant={"h3"}
        color={"text.secondary"}
        sx={{ maxWidth: "min(400px, 100%)", flexShrink: "0", marginBottom: 2 }}
      >
        {t("landing.faqTitle")}
      </Typography>
      <Paper sx={{ flexGrow: "1" }}>
        <List
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            padding: 0,
          }}
        >
          <FAQQuestion
            question={t("landing.faqSellItemsQ")}
            answer={t("landing.faqSellItemsA")}
            first
          />
          <FAQQuestion
            question={t("landing.faqSafeQ")}
            answer={t("landing.faqSafeA")}
          />
          <FAQQuestion
            question={t("landing.faqListThingsQ")}
            answer={t("landing.faqListThingsA")}
          />
          <FAQQuestion
            question={t("landing.faqFeeQ")}
            answer={t("landing.faqFeeA")}
          />
          <FAQQuestion
            question={t("landing.faqRealMoneyQ")}
            answer={t("landing.faqRealMoneyA")}
            last
          />
        </List>
      </Paper>
    </Stack>
  )
}

function SupportersSection() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const supporters = [
    {
      avatar: BirdIncLogo,
      url: "https://robertsspaceindustries.com/en/orgs/BIRDINC",
      name: "BIRD Inc",
    },
    {
      avatar: UNNLogo,
      url: "https://joinunn.com/",
      name: "The Unnamed",
    },
    {
      avatar: CharLogo,
      url: "https://robertsspaceindustries.com/orgs/CHAR",
      name: "Char Holdings",
    },
  ]

  return (
    <Stack spacing={theme.layoutSpacing.layout} sx={{ maxWidth: "100%" }}>
      <Typography
        variant={"h3"}
        sx={{ fontWeight: "bold", textAlign: "center" }}
        color={"text.secondary"}
      >
        {t("landing.supportersTitle")}
      </Typography>
      <Typography
        variant={"h5"}
        sx={{ textAlign: "center" }}
        color={"text.primary"}
      >
        {t("landing.supportersThanks")}
        <MaterialLink
          color={"secondary"}
          target={"_blank"}
          rel="noopener noreferrer"
          underline={"hover"}
          href={"https://www.patreon.com/henry232323"}
        >
          Patreon
        </MaterialLink>{" "}
        {t("landing.supporters")}
      </Typography>
      <Stack
        sx={{ maxWidth: "100%", overflow: "scroll", flexWrap: "wrap" }}
        useFlexGap
        spacing={theme.layoutSpacing.layout}
        direction={"row"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {supporters.map((supporter) => (
          <MaterialLink
            href={supporter.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
            key={supporter.name}
          >
            <Stack
              spacing={theme.layoutSpacing.text}
              direction={"column"}
              key={supporter.name}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <ButtonBase
                sx={{
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                }}
                aria-label={t(
                  "accessibility.viewSupporterWebsite",
                  "Visit {{name}} website",
                  { name: supporter.name },
                )}
              >
                <img
                  src={supporter.avatar}
                  style={{
                    maxHeight: 128,
                    maxWidth: "100%",
                    borderRadius: `${theme.spacing(theme.borderRadius.button)}px`,
                  }}
                  alt={t("accessibility.supporterLogo", "{{name}} logo", {
                    name: supporter.name,
                  })}
                />
              </ButtonBase>

              <Typography
                variant={"body2"}
                align={"center"}
                color={"text.secondary"}
              >
                {supporter.name}
              </Typography>
            </Stack>
          </MaterialLink>
        ))}
      </Stack>
    </Stack>
  )
}

export default LandingPage
