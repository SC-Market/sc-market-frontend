import {
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import AddShoppingCartRounded from "@mui/icons-material/AddShoppingCartRounded"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ItemAcquisitionDocument } from "../../features/game-data/api/gameDataApi"
import { MARKET_PATHS } from "../../routes/paths"
import { formatAmount } from "../../seo/itemAcquisition"

/** Player listings: price facts, the cheapest listings and a link to all of them. */ import {
  Fact,
  SubsectionTitle,
  useAUEC,
} from "./ItemAcquisitionParts"

export function AcquisitionBuySection({
  doc,
  itemName,
  onAddToCart,
}: {
  doc: ItemAcquisitionDocument
  itemName: string
  onAddToCart?: (listingId: string) => void
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const aUEC = useAUEC()
  const current = doc.price.current
  const median =
    current.confidence !== "low" && current.confidence !== "none"
      ? current.median_ask
      : null
  return (
    <Box>
      <SubsectionTitle>
        {t("itemAcquisition.buyTitle", "Buy from players")}
      </SubsectionTitle>
      <Stack
        direction="row"
        spacing={3}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1.5 }}
      >
        {typeof doc.listings.lowest_ask === "number" && (
          <Fact
            label={t("itemAcquisition.lowestAsk", "Lowest ask")}
            value={aUEC(doc.listings.lowest_ask)}
          />
        )}
        {typeof median === "number" && (
          <Fact
            label={`${t("itemAcquisition.medianAsk", "Median ask")} (${
              current.confidence === "high"
                ? t("itemAcquisition.confidenceHigh", "high confidence")
                : t("itemAcquisition.confidenceMedium", "medium confidence")
            })`}
            value={aUEC(median)}
          />
        )}
        <Fact
          label={t("itemAcquisition.sellers", "Sellers")}
          value={formatAmount(doc.listings.seller_count, locale)}
        />
        <Fact
          label={t("itemAcquisition.listings", "Listings")}
          value={formatAmount(doc.listings.count, locale)}
        />
        <Fact
          label={t("itemAcquisition.inStock", "In stock")}
          value={formatAmount(doc.listings.quantity_available, locale)}
        />
      </Stack>
      {doc.listings.top.length > 0 && (
        <Table size="small" sx={{ "& td": { px: 1 } }}>
          <TableBody>
            {doc.listings.top.map((listing) => (
              <TableRow key={listing.listing_id} hover>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={MARKET_PATHS.listing(listing.listing_id, listing.title)}
                    underline="hover"
                  >
                    {listing.title}
                  </Link>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {typeof listing.price === "number"
                      ? aUEC(listing.price)
                      : "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" color="text.secondary">
                    {t("itemAcquisition.inStockCount", {
                      defaultValue: "{{quantity}} in stock",
                      quantity: formatAmount(
                        listing.quantity_available,
                        locale,
                      ),
                    })}
                  </Typography>
                </TableCell>
                {onAddToCart && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label={t("itemAcquisition.addToCart", "Add to cart")}
                      onClick={() => onAddToCart(listing.listing_id)}
                      disabled={listing.quantity_available === 0}
                    >
                      <AddShoppingCartRounded fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Button
        component={RouterLink}
        to={MARKET_PATHS.aggregate(doc.item.id, doc.item.name)}
        size="small"
        variant="contained"
        sx={{ mt: 1.5 }}
      >
        {t("itemAcquisition.compareAll", {
          defaultValue: "Compare all {{name}} listings",
          name: itemName,
        })}
      </Button>
    </Box>
  )
}
