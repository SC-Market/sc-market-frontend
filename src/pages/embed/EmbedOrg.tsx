/**
 * Read-only embeddable widgets of an org's storefront, for orgs to iframe on
 * their own sites (owner decision 2026-11-01):
 * - /embed/org/:id           the storefront card (id: the org's spectrum ID)
 * - /embed/org/:id/listings  a grid of the org's listings
 *
 * Outside the app layout: no sign-in, no cart, no forms, no actions. Data
 * comes from public, anonymous endpoints only, never credentialed (the
 * entry uses store/embedNetworkEnv.ts on /embed/*). Every link opens
 * sc-market.space in a new tab. public/_headers lets any site frame this
 * path, and only this path.
 */
import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useHead } from "@unhead/react"
import { useTranslation } from "react-i18next"
import {
  Avatar,
  Box,
  CssBaseline,
  Link,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material"
import VerifiedRounded from "@mui/icons-material/VerifiedRounded"
import { mainTheme } from "../../hooks/styles/Theme"
import {
  useGetOrgStorefrontQuery,
  useSearchListingsQuery,
  type ListingSearchResult,
} from "../../store/api/v2/market"
import { FRONTEND_URL } from "../../util/constants"
import { MARKET_PATHS, ORG_PATHS } from "../../routes/paths"
import { formatPrice } from "../../util/formatPrice"
import { orgFeaturedListingsArgs, ratingLabel } from "../../features/storefront/domain"
import { markRouterReady } from "../../routes/definePage"

/** An sc-market.space URL, opened outside the frame. */
function Out(props: { to: string; children: React.ReactNode; sx?: object }) {
  return (
    <Link
      href={`${FRONTEND_URL}${props.to}`}
      target="_blank"
      rel="noopener"
      underline="hover"
      color="inherit"
      sx={props.sx}
    >
      {props.children}
    </Link>
  )
}

function ListingTile(props: { listing: ListingSearchResult }) {
  const { listing } = props
  return (
    <Out to={MARKET_PATHS.listing(listing.listing_id, listing.title)} sx={{ display: "block", minWidth: 0 }}>
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
          height: "100%",
        }}
      >
        <Box
          component="img"
          src={listing.photo || undefined}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          sx={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", bgcolor: "action.hover" }}
        />
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap fontWeight={600}>
            {listing.title}
          </Typography>
          <Typography variant="caption" color="text.primary">
            {formatPrice(Number(listing.price_min))}
          </Typography>
        </Box>
      </Box>
    </Out>
  )
}

export function EmbedOrg(props: { variant?: "card" | "listings" }) {
  const variant = props.variant ?? "card"
  const { t } = useTranslation()
  const { id: spectrum_id = "" } = useParams<{ id: string }>()
  const storefront = useGetOrgStorefrontQuery({ spectrumId: spectrum_id }, { skip: !spectrum_id })
  const listings = useSearchListingsQuery(
    orgFeaturedListingsArgs(spectrum_id, variant === "listings" ? 12 : 3),
    { skip: !spectrum_id },
  )
  // A widget is never a search result of its own.
  useHead({
    title: storefront.data?.name ?? "SC Market",
    meta: [{ name: "robots", content: "noindex" }],
  })
  useEffect(() => {
    markRouterReady()
    // document.html hides a prerendered page until the app's first effect.
    document.documentElement.removeAttribute("data-pre-theme")
  }, [])

  const org = storefront.data
  const ready = !storefront.isLoading && !listings.isLoading
  const items = listings.data?.listings ?? []
  const orgPath = ORG_PATHS.profile(spectrum_id)

  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{ p: 1.5, minHeight: "100vh" }}
        id="main-content"
        data-testid="embed-org"
        // The page-ready signal (docs/testing-with-mcp.md), outside the app layout's PageReady.
        aria-busy={ready ? "false" : "true"}
        data-ready={ready ? "true" : "false"}
      >
        {storefront.isError ? (
          <Typography color="text.primary">
            {t("storefront.embed.notFound", "This storefront isn't available.")}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={org?.logo_url ?? undefined} alt="" variant="rounded" sx={{ width: 48, height: 48 }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={700} noWrap>
                    <Out to={orgPath}>{org?.name ?? spectrum_id}</Out>
                  </Typography>
                  {org?.verified && (
                    <VerifiedRounded
                      color="primary"
                      fontSize="small"
                      titleAccess={t("storefront.verified.label", "Verified org")}
                    />
                  )}
                </Stack>
                {org && (
                  <Typography variant="caption" color="text.primary" component="p" noWrap>
                    {[
                      t("storefront.embed.completed", { n: org.trust.completed_orders, defaultValue: "{{n}} completed orders" }),
                      ratingLabel(org.trust.avg_rating)
                        ? t("storefront.embed.rating", {
                            rating: ratingLabel(org.trust.avg_rating),
                            n: org.trust.rating_count,
                            defaultValue: "{{rating}}★ ({{n}})",
                          })
                        : null,
                      t("storefront.embed.listings", { n: org.trust.active_listings, defaultValue: "{{n}} listings" }),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography>
                )}
              </Box>
            </Stack>

            {items.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns:
                    variant === "listings"
                      ? "repeat(auto-fill, minmax(140px, 1fr))"
                      : "repeat(3, minmax(0, 1fr))",
                }}
              >
                {items.map((listing) => (
                  <ListingTile key={listing.listing_id} listing={listing} />
                ))}
              </Box>
            )}

            <Typography variant="caption" color="text.primary">
              <Out to={orgPath} sx={{ fontWeight: 600 }}>
                {t("storefront.embed.open", "Open the storefront on SC Market")}
              </Out>
            </Typography>
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  )
}

export function EmbedOrgListings() {
  return <EmbedOrg variant="listings" />
}
