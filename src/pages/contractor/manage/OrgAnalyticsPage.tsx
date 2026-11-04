import React from "react"
import {
  Alert,
  Box,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { usePageOrgManage } from "../../../features/contractor/hooks/usePageOrgManage"
import { useGetOrgStatsQuery } from "../../../store/api/v2/market"
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths"

function Total(props: { value: React.ReactNode; label: string }) {
  return (
    <Paper sx={{ p: 2, minWidth: 140, flex: "1 1 140px" }}>
      <Typography
        variant="h5"
        component="p"
        color="text.secondary"
        fontWeight={700}
      >
        {props.value}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {props.label}
      </Typography>
    </Paper>
  )
}

/**
 * Org settings › Analytics: the org's shops' analytics rolled up, and
 * (Manage Orders only) orders per member, as plain numbers by name.
 */
export function OrgAnalyticsPage() {
  const { t } = useTranslation()
  const { data: page } = usePageOrgManage()
  const spectrumId = page?.contractor?.spectrum_id
  const { data, isLoading, isError } = useGetOrgStatsQuery(
    { spectrumId: spectrumId ?? "" },
    { skip: !spectrumId },
  )

  if (!spectrumId || isLoading)
    return <Skeleton variant="rounded" height={320} />
  if (isError || !data) {
    return (
      <Alert severity="warning">
        {t(
          "storefront.analytics.loadFailed",
          "Org analytics couldn't be loaded. Try again later.",
        )}
      </Alert>
    )
  }
  const { totals } = data

  return (
    <Stack spacing={3} data-testid="org-analytics">
      <Box>
        <Typography variant="h6" component="h2" color="text.secondary">
          {t("storefront.analytics.title", "Org analytics")}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {t(
            "storefront.analytics.intro",
            "Every shop your org owns, added up. Views are counted since view tracking began.",
          )}
        </Typography>
      </Box>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
        <Total
          value={totals.views}
          label={t("storefront.analytics.views", "Listing views")}
        />
        <Total
          value={totals.unique_viewers}
          label={t("storefront.analytics.uniqueViewers", "Signed-in viewers")}
        />
        <Total
          value={totals.cart_adds}
          label={t("storefront.analytics.cartAdds", "Cart adds")}
        />
        <Total
          value={totals.orders}
          label={t("storefront.analytics.orders", "Market orders")}
        />
        <Total
          value={totals.sales}
          label={t("storefront.analytics.sales", "Sales")}
        />
        <Total
          value={`${totals.conversion_rate}%`}
          label={t("storefront.analytics.conversion", "Sales per view")}
        />
        <Total
          value={totals.completed_orders}
          label={t(
            "storefront.analytics.completed",
            "Completed orders (all kinds)",
          )}
        />
        <Total
          value={totals.active_listings}
          label={t("storefront.analytics.listings", "Active listings")}
        />
      </Stack>

      {data.shops.length > 0 && (
        <TableContainer component={Paper}>
          <Table
            size="small"
            aria-label={t("storefront.analytics.byShop", "By shop")}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t("storefront.analytics.shop", "Shop")}</TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.views", "Listing views")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.orders", "Market orders")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.sales", "Sales")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.conversion", "Sales per view")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.listings", "Active listings")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.shops.map((shop) => (
                <TableRow key={shop.shop_id}>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      to={SHOP_PATHS.dashboard(shop.slug)}
                    >
                      {shop.name}
                    </MuiLink>
                  </TableCell>
                  <TableCell align="right">{shop.views}</TableCell>
                  <TableCell align="right">{shop.orders}</TableCell>
                  <TableCell align="right">{shop.sales}</TableCell>
                  <TableCell align="right">{shop.conversion_rate}%</TableCell>
                  <TableCell align="right">{shop.active_listings}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data.top_listings.length > 0 && (
        <TableContainer component={Paper}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ px: 2, pt: 2 }}
          >
            {t("storefront.analytics.topListings", "Most viewed listings")}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("storefront.analytics.listing", "Listing")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.views", "Listing views")}
                </TableCell>
                <TableCell align="right">
                  {t("storefront.analytics.sales", "Sales")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.top_listings.map((listing) => (
                <TableRow key={listing.listing_id}>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      to={MARKET_PATHS.listing(
                        listing.listing_id,
                        listing.title,
                      )}
                    >
                      {listing.title}
                    </MuiLink>
                  </TableCell>
                  <TableCell align="right">{listing.views}</TableCell>
                  <TableCell align="right">{listing.sales}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data.orders_by_member_visible && data.orders_by_member && (
        <TableContainer component={Paper} data-testid="orders-by-member">
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {t("storefront.analytics.byMember", "Orders per member")}
            </Typography>
            <Typography variant="body2" color="text.primary">
              {t("storefront.analytics.byMemberNote", {
                n: data.unassigned_open_orders ?? 0,
                defaultValue:
                  "Only members with Manage Orders see this. Listed by name, to help share out the work; it isn't a ranking. Open orders nobody has claimed: {{n}}.",
              })}
            </Typography>
          </Box>
          {data.orders_by_member.length === 0 ? (
            <Typography variant="body2" color="text.primary" sx={{ p: 2 }}>
              {t(
                "storefront.analytics.noAssigned",
                "No orders have been assigned to members yet.",
              )}
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("storefront.analytics.member", "Member")}
                  </TableCell>
                  <TableCell align="right">
                    {t("storefront.analytics.assigned", "Assigned")}
                  </TableCell>
                  <TableCell align="right">
                    {t("storefront.analytics.done", "Completed")}
                  </TableCell>
                  <TableCell align="right">
                    {t("storefront.analytics.open", "Open")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.orders_by_member.map((m) => (
                  <TableRow key={m.username}>
                    <TableCell>{m.display_name || m.username}</TableCell>
                    <TableCell align="right">{m.assigned}</TableCell>
                    <TableCell align="right">{m.completed}</TableCell>
                    <TableCell align="right">{m.open}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
    </Stack>
  )
}
