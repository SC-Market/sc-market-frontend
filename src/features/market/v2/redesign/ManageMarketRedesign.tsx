import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import AddRounded from "@mui/icons-material/AddRounded"
import StorefrontRounded from "@mui/icons-material/StorefrontRounded"
import { Link as RouterLink } from "react-router-dom"
import { Helmet } from "@unhead/react/helmet"
import { useTranslation } from "react-i18next"
import {
  useGetMyShopsQuery,
  useGetMyListingsQuery,
} from "../../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../../routes/paths"
import { WipeRelistBanner } from "../components/WipeRelistBanner"
import { ListingRow } from "./ManageListingRow"

/**
 * ManageMarketRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). ONE page (§8.4) that replaces the five
 * stock/inventory surfaces: a table of the shop's listings, each row expanding
 * inline to its backing lots (quantity by location + holder, listed vs.
 * unlisted). An actor/shop switcher includes an "Everything I own" cross-shop
 * scope (§8.8) which adds a Shop column.
 *
 * Reads are wired to the real hooks (my-listings + stock-lots). Inline edit
 * affordances (price / qty / status / cross-shop move) are Phase 0: visual only
 * because the current backend can't honor them shop-scoped without more plumbing.
 */

const ALL_SCOPE = "__all__"

export function ManageMarketRedesign() {
  const { t } = useTranslation()

  const { data: shops } = useGetMyShopsQuery()
  const manageableShops = useMemo(
    () => (shops ?? []).filter((s) => s.permissions?.manage_market !== false),
    [shops],
  )

  const [scope, setScope] = useState<string>("")
  // Default to the first manageable shop (guardrail §8.8: single-shop is default).
  const effectiveScope = scope || manageableShops[0]?.shop_id || ""
  const isAllScope = effectiveScope === ALL_SCOPE

  const currentShop = manageableShops.find((s) => s.shop_id === effectiveScope)
  const spectrumId = currentShop?.owner_contractor_spectrum_id || undefined

  const {
    data: listingsData,
    isLoading,
    error,
  } = useGetMyListingsQuery({
    pageSize: 100,
    shopId: isAllScope ? undefined : effectiveScope || undefined,
    spectrumId: isAllScope ? undefined : spectrumId,
  })

  const listings = listingsData?.listings ?? []

  const shopNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const s of manageableShops) m.set(s.shop_id, s.name)
    return m
  }, [manageableShops])

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Helmet>
        <title>{t("ManageMarketRedesign.title", "Manage Market")}</title>
      </Helmet>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "text.secondary", mb: 0.5 }}>
            {t("ManageMarketRedesign.heading", "Manage Market")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {t(
              "ManageMarketRedesign.subheading",
              "Everything you sell in one place. Expand a row to see the stock behind it.",
            )}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            select
            size="small"
            label={t("ManageMarketRedesign.actor", "Storefront")}
            value={effectiveScope}
            onChange={(e) => setScope(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <StorefrontRounded sx={{ mr: 1, color: "text.primary" }} />
              ),
            }}
          >
            <MenuItem value={ALL_SCOPE}>
              {t("ManageMarketRedesign.everythingIOwn", "Everything I own")}
            </MenuItem>
            {manageableShops.map((s) => (
              <MenuItem key={s.shop_id} value={s.shop_id}>
                {s.name}
                {s.is_org_owned
                  ? ` (${t("ManageMarketRedesign.org", "org")})`
                  : ""}
              </MenuItem>
            ))}
          </TextField>
          <Button
            component={RouterLink}
            to={MARKET_PATHS.create}
            variant="contained"
            color="primary"
            startIcon={<AddRounded />}
          >
            {t("ManageMarketRedesign.createListing", "Create listing")}
          </Button>
        </Stack>
      </Stack>

      <WipeRelistBanner />

      {isAllScope && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          {t(
            "ManageMarketRedesign.allScopeNote",
            "Showing everything you own across shops. The Shop column shows where each listing currently sells.",
          )}
        </Alert>
      )}

      {isLoading && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("ManageMarketRedesign.loading", "Loading your listings…")}
        </Typography>
      )}
      {error && (
        <Typography sx={{ color: "error.main", py: 6, textAlign: "center" }}>
          {t("ManageMarketRedesign.error", "Failed to load your listings.")}
        </Typography>
      )}

      {!isLoading && !error && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell>
                  {t("ManageMarketRedesign.colItem", "Item")}
                </TableCell>
                {isAllScope && (
                  <TableCell>
                    {t("ManageMarketRedesign.colShop", "Shop")}
                  </TableCell>
                )}
                <TableCell align="right">
                  {t("ManageMarketRedesign.colPrice", "Price")}
                </TableCell>
                <TableCell align="right">
                  {t("ManageMarketRedesign.colQty", "Available")}
                </TableCell>
                <TableCell>
                  {t("ManageMarketRedesign.colStatus", "Status")}
                </TableCell>
                <TableCell align="right">
                  {t("ManageMarketRedesign.colActions", "Actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((l) => (
                <ListingRow
                  key={l.listing_id}
                  listing={l}
                  showShop={isAllScope}
                  shopName={shopNameById.get(currentShop?.shop_id ?? "") ?? ""}
                />
              ))}
            </TableBody>
          </Table>

          {listings.length === 0 && (
            <Typography
              sx={{ color: "text.primary", py: 6, textAlign: "center" }}
            >
              {t(
                "ManageMarketRedesign.empty",
                "Nothing here yet. Create your first listing.",
              )}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  )
}
