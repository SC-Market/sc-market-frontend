import React from "react"
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded"
import StorefrontRounded from "@mui/icons-material/StorefrontRounded"
import DesignServicesRounded from "@mui/icons-material/DesignServicesRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useGetOrgStorefrontQuery,
  useSearchListingsQuery,
  type OrgStorefront,
  type StorefrontTrust,
} from "../../../store/api/v2/market"
import { useGetContractorReviewsQuery } from "../../contractor/api/contractorApi"
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"
import { LISTING_CARD_HEIGHT } from "../../market/v2/marketSearchLayout"
import { MARKET_PATHS, ORDER_PATHS, ORG_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import { orgFeaturedListingsArgs, ratingLabel, sinceYear } from "../domain"
import { EnquireBrandedStorefront } from "./EnquireBrandedStorefront"

import { useFormatters } from "../../../util/format"
function SectionTitle(props: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }} spacing={1}>
      <Typography variant="h6" component="h2" color="text.secondary">
        {props.children}
      </Typography>
      {props.action}
    </Stack>
  )
}

/** One trust stat: a big number and its label. */
function Stat(props: { value: React.ReactNode; label: string }) {
  return (
    <Box sx={{ minWidth: 96 }}>
      <Typography variant="h5" component="p" color="text.secondary" fontWeight={700}>
        {props.value}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {props.label}
      </Typography>
    </Box>
  )
}

export function TrustStrip(props: { trust: StorefrontTrust }) {
  const { t } = useTranslation()
  const { trust } = props
  const rating = ratingLabel(trust.avg_rating)
  const since = sinceYear(trust.on_sc_market_since)
  return (
    <Paper sx={{ p: 2 }} data-testid="storefront-trust">
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={3}>
        <Stat value={trust.completed_orders} label={t("storefront.trust.completed", "Completed orders")} />
        <Stat
          value={rating ? `${rating} ★` : "—"}
          label={t("storefront.trust.rating", { n: trust.rating_count, defaultValue: "Rating ({{n}} reviews)" })}
        />
        {trust.response_rate !== null && trust.response_rate !== undefined && (
          <Stat
            value={`${Math.round(trust.response_rate)}%`}
            label={t("storefront.trust.responseRate", "Completed within 24 h")}
          />
        )}
        <Stat value={trust.members} label={t("storefront.trust.members", "Members on SC Market")} />
        <Stat value={trust.active_listings} label={t("storefront.trust.listings", "Active listings")} />
        {since && <Stat value={since} label={t("storefront.trust.since", "On SC Market since")} />}
      </Stack>
    </Paper>
  )
}

function FeaturedListings(props: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useSearchListingsQuery(orgFeaturedListingsArgs(props.spectrumId))
  const listings = data?.listings ?? []
  if (!isLoading && listings.length === 0) return null
  return (
    <Box component="section" aria-labelledby="storefront-featured">
      <SectionTitle>
        <span id="storefront-featured">{t("storefront.featured", "Featured listings")}</span>
      </SectionTitle>
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridAutoRows: LISTING_CARD_HEIGHT,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} variant="rounded" height={LISTING_CARD_HEIGHT} />)
          : listings.map((listing, index) => (
              <Box key={listing.listing_id} sx={{ minWidth: 0 }}>
                <ListingCardV2 listing={listing} index={index} />
              </Box>
            ))}
      </Box>
    </Box>
  )
}

function Services(props: { storefront: OrgStorefront }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { services } = props.storefront
  if (services.length === 0) return null
  return (
    <Box component="section" aria-labelledby="storefront-services">
      <SectionTitle>
        <span id="storefront-services">{t("storefront.services", "Services")}</span>
      </SectionTitle>
      <Grid container spacing={1}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.service_id}>
            <Paper
              component={Link}
              to={ORDER_PATHS.service(service.service_id)}
              sx={{ p: 2, display: "block", textDecoration: "none", height: "100%" }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <DesignServicesRounded color="primary" fontSize="small" aria-hidden />
                <Typography color="text.secondary" fontWeight={600} noWrap>
                  {service.service_name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {service.cost > 0 ? fmt.price(service.cost) : t("storefront.serviceQuote", "Price on request")}
                {service.kind ? ` · ${service.kind}` : ""}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function LatestReviews(props: { spectrumId: string }) {
  const { t } = useTranslation()
  const { data } = useGetContractorReviewsQuery(props.spectrumId)
  const reviews = (data ?? []).filter((r) => r.content?.trim()).slice(0, 3)
  if (reviews.length === 0) return null
  return (
    <Box component="section" aria-labelledby="storefront-reviews">
      <SectionTitle
        action={
          <Button component={Link} to={ORG_PATHS.profileTab(props.spectrumId, "reviews")} size="small">
            {t("storefront.allReviews", "All reviews")}
          </Button>
        }
      >
        <span id="storefront-reviews">{t("storefront.reviews", "Reviews")}</span>
      </SectionTitle>
      <Grid container spacing={1}>
        {reviews.map((review) => (
          <Grid item xs={12} md={4} key={review.review_id}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Rating value={review.rating} readOnly size="small" precision={0.5} />
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>
                {review.content.length > 240 ? `${review.content.slice(0, 239)}…` : review.content}
              </Typography>
              <Typography variant="caption" color="text.primary">
                {review.user_author?.display_name ?? review.contractor_author?.name ?? ""}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

/** The org's SC Orgs page as a recruiting card (headline, members, focus). */
function RecruitingCard(props: { storefront: OrgStorefront }) {
  const { t } = useTranslation()
  const recruiting = props.storefront.recruiting
  if (!recruiting || !recruiting.url.startsWith("https://sc-orgs.space/")) return null
  const tags = [...recruiting.focus_tags, ...recruiting.playstyle_tags].slice(0, 6)
  return (
    <Paper variant="outlined" sx={{ p: 2 }} data-testid="storefront-recruiting">
      <Typography variant="subtitle2" color="text.secondary">
        {t("storefront.recruiting.title", "Recruiting on SC Orgs")}
      </Typography>
      {recruiting.headline && (
        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
          {recruiting.headline}
        </Typography>
      )}
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5} sx={{ mt: 1 }}>
        {recruiting.member_count !== null && recruiting.member_count !== undefined && (
          <Chip
            size="small"
            label={t("storefront.recruiting.members", {
              n: recruiting.member_count,
              defaultValue: "Members on SC Orgs: {{n}}",
            })}
          />
        )}
        {tags.map((tag) => (
          <Chip key={tag} size="small" variant="outlined" label={tag} />
        ))}
      </Stack>
      <Button
        sx={{ mt: 1.5 }}
        variant="contained"
        size="small"
        href={recruiting.url}
        target="_blank"
        rel="noopener"
        endIcon={<OpenInNewRounded />}
      >
        {t("storefront.recruiting.join", "Join via SC Orgs")}
      </Button>
    </Paper>
  )
}

/**
 * The org home page (the Store tab of /contractor/:sid): calls to action,
 * trust stats, featured listings, services, latest reviews, the SC Orgs
 * recruiting card, then the org's shops (`children`).
 */
export function OrgStorefrontHome(props: { spectrumId: string; children?: React.ReactNode }) {
  const { t } = useTranslation()
  const { customOrg } = useCustomDomain()
  const { data: storefront, isLoading } = useGetOrgStorefrontQuery({ spectrumId: props.spectrumId })
  const mainShop = storefront?.shops[0]

  return (
    <Stack spacing={3} data-testid="org-storefront-home">
      {isLoading ? (
        <Skeleton variant="rounded" height={96} />
      ) : storefront ? (
        <>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {mainShop && (
              <Button
                variant="contained"
                component={Link}
                to={SHOP_PATHS.profile(mainShop.slug)}
                startIcon={<StorefrontRounded />}
              >
                {t("storefront.cta.shop", "Shop")}
              </Button>
            )}
            {mainShop && storefront.services.length > 0 && (
              <Button
                variant="outlined"
                component={Link}
                to={SHOP_PATHS.profileTab(mainShop.slug, "services")}
                startIcon={<DesignServicesRounded />}
              >
                {t("storefront.cta.service", "Request a service")}
              </Button>
            )}
            {storefront.recruiting?.url.startsWith("https://sc-orgs.space/") && (
              <Button
                variant="outlined"
                href={storefront.recruiting.url}
                target="_blank"
                rel="noopener"
                endIcon={<OpenInNewRounded />}
              >
                {t("storefront.recruiting.join", "Join via SC Orgs")}
              </Button>
            )}
            {!mainShop && (
              <Button variant="outlined" component={Link} to={MARKET_PATHS.search}>
                {t("storefront.cta.market", "Browse the market")}
              </Button>
            )}
          </Stack>
          <TrustStrip trust={storefront.trust} />
        </>
      ) : null}

      <FeaturedListings spectrumId={props.spectrumId} />
      {storefront && <Services storefront={storefront} />}
      <LatestReviews spectrumId={props.spectrumId} />
      {storefront && <RecruitingCard storefront={storefront} />}

      {props.children && (
        <Box component="section" aria-labelledby="storefront-shops">
          <SectionTitle>
            <span id="storefront-shops">{t("storefront.ourShops", "Our shops")}</span>
          </SectionTitle>
          {props.children}
        </Box>
      )}

      {/* Not on an org's own branded site: that one is theirs. */}
      {!customOrg && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
          <Typography variant="body2" color="text.primary">
            {t("storefront.runAnOrg", "Run an org? Give it a storefront like this one.")}
          </Typography>
          <EnquireBrandedStorefront variant="text" />
        </Stack>
      )}
    </Stack>
  )
}
