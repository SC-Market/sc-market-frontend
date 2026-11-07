import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import { useNavigate } from "react-router-dom"
import { Helmet } from "@unhead/react/helmet"
import { useTranslation } from "react-i18next"
import {
  useSearchGameItemsQuery,
  useGetMyShopsQuery,
} from "../../../../store/api/v2/market"
import type {
  GameItemSearchResult,
  StockLotInput,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { MARKET_PATHS } from "../../../../routes/paths"
import { useFormatters } from "../../../../util/format"
import { useCreateListingSubmit } from "../../hooks/useListingMutations"
import {
  BundleItemsCard,
  ItemPickerCard,
  QualityPricingCard,
  StorefrontCard,
  nextId,
  type BundleItem,
  type QualityRow,
} from "./SellFormSections"

/**
 * SellFormRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). ONE adaptive Sell form (§8.5): pick a
 * catalog item (or a custom, non-catalog item), then reveal only the fields that
 * item needs. Optional "price by quality" reveals an inline per-tier table;
 * optional "sell as a bundle" turns the listing into a multi-item set. Sale type
 * (fixed / auction / negotiable) is a toggle inside the form. The word "fungible"
 * never appears.
 *
 * CREATE ONLY. Submits through useCreateListingSubmit. Editing is NOT
 * handled here: the update contract is a diff against existing variant/lot IDs
 * (variant_prices/lot_updates), which this create-shaped form can't express —
 * MarketV2Routes routes edit to EditListingV2 instead. Per-quality/bundle shapes
 * the current create payload can't fully express are noted inline. (§8.6)
 */

export function SellFormRedesign() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()

  const { data: shops } = useGetMyShopsQuery()
  const sellableShops = useMemo(
    () => (shops ?? []).filter((s) => s.permissions?.manage_market !== false),
    [shops],
  )

  const { submit: submitListing, isLoading: isCreating } =
    useCreateListingSubmit(t("SellFormRedesign.created", "Listing created."))

  // ---- Form state ----
  const [shopId, setShopId] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)
  const [itemQuery, setItemQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<GameItemSearchResult | null>(
    null,
  )
  const [customName, setCustomName] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [location, setLocation] = useState("")
  const [quantityUnit, setQuantityUnit] = useState<"unit" | "scu">("unit")
  const [saleType, setSaleType] = useState<"fixed" | "auction" | "negotiable">(
    "fixed",
  )

  const [byQuality, setByQuality] = useState(false)
  const [qualityRows, setQualityRows] = useState<QualityRow[]>([
    { id: nextId(), tier: 3, price: "", quantity: "1" },
  ])

  const [asBundle, setAsBundle] = useState(false)
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([
    { id: nextId(), item: null },
  ])

  const { data: itemResults } = useSearchGameItemsQuery(
    { query: itemQuery || undefined, limit: 25 },
    { skip: isCustom },
  )
  const { data: bundleItemResults } = useSearchGameItemsQuery(
    { query: itemQuery || undefined, limit: 25 },
    { skip: !asBundle },
  )

  // Default the shop selection to the first sellable shop.
  useEffect(() => {
    if (!shopId && sellableShops.length) setShopId(sellableShops[0].shop_id)
  }, [sellableShops, shopId])

  const itemChosen = isCustom ? customName.trim().length > 0 : !!selectedItem
  const quantityLabel =
    quantityUnit === "scu"
      ? t("SellFormRedesign.quantityScu", "Quantity (cSCU)")
      : t("SellFormRedesign.quantity", "Quantity")

  const estimatedTotal = useMemo(() => {
    if (byQuality) {
      return qualityRows.reduce(
        (s, r) => s + (Number(r.price) || 0) * (Number(r.quantity) || 0),
        0,
      )
    }
    return (Number(price) || 0) * (Number(quantity) || 0)
  }, [byQuality, qualityRows, price, quantity])

  const canSubmit =
    !!shopId &&
    itemChosen &&
    title.trim().length > 0 &&
    (byQuality || Number(price) > 0)

  const handleSubmit = async () => {
    if (!canSubmit) return

    // A custom (non-catalog) item, a bundle, or per-quality pricing can't be
    // fully expressed by the current single-item create payload.
    // Phase 0: visual only for those shapes — we still create the catalog listing
    // when possible, but flag the parts the backend can't yet honor.
    if (isCustom || asBundle) {
      issueAlert({
        message: t(
          "SellFormRedesign.visualOnly",
          "Custom items and bundles are only a preview for now. They aren't saved yet.",
        ),
        severity: "info",
      })
      return
    }

    if (!selectedItem) return

    const lots: StockLotInput[] = byQuality
      ? qualityRows.map((r) => ({
          quantity: Number(r.quantity) || 0,
          variant_attributes: { quality_tier: r.tier },
          price: Number(r.price) || 0,
          location_id: location || undefined,
        }))
      : [
          {
            quantity: Number(quantity) || 0,
            variant_attributes: {},
            location_id: location || undefined,
          },
        ]

    const result = await submitListing({
      title: title.trim(),
      description: description.trim(),
      game_item_id: selectedItem.id,
      pricing_mode: byQuality ? "per_variant" : "unified",
      base_price: byQuality ? undefined : Number(price),
      lots,
      quantity_unit: quantityUnit,
      shop_id: shopId,
      sale_type: saleType,
      status: "active",
    })
    if (result.ok) navigate(MARKET_PATHS.myListings)
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Helmet>
        <title>{t("SellFormRedesign.title", "Sell an item")}</title>
      </Helmet>

      <Typography variant="h4" sx={{ color: "text.secondary", mb: 0.5 }}>
        {t("SellFormRedesign.heading", "Sell an item")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary", mb: 3 }}>
        {t(
          "SellFormRedesign.subheading",
          "Pick what you're selling. The form shows only the fields it needs.",
        )}
      </Typography>

      <Stack spacing={2.5}>
        {/* Shop / storefront */}
        <StorefrontCard
          shopId={shopId}
          setShopId={setShopId}
          sellableShops={sellableShops}
        />

        {/* Step 1: pick the item */}
        <ItemPickerCard
          isCustom={isCustom}
          setIsCustom={setIsCustom}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          customName={customName}
          setCustomName={setCustomName}
          title={title}
          setTitle={setTitle}
          itemResults={itemResults}
          setItemQuery={setItemQuery}
        />

        {/* Step 2: adaptive fields (revealed once an item is chosen) */}
        <Collapse in={itemChosen} unmountOnExit>
          <Stack spacing={2.5}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={t("SellFormRedesign.listingTitle", "Listing title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={saleType}
                    onChange={(_, v) => v && setSaleType(v)}
                    color="primary"
                  >
                    <ToggleButton value="fixed">
                      {t("SellFormRedesign.fixed", "Fixed price")}
                    </ToggleButton>
                    <ToggleButton value="auction">
                      {t("SellFormRedesign.auctionType", "Auction")}
                    </ToggleButton>
                    <ToggleButton value="negotiable">
                      {t("SellFormRedesign.negotiableType", "Negotiable")}
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {/* Price + quantity (hidden when per-quality is on) */}
                  <Collapse in={!byQuality} unmountOnExit>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label={t(
                            "SellFormRedesign.pricePerUnit",
                            "Price per unit (aUEC)",
                          )}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label={quantityLabel}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          select
                          fullWidth
                          label={t("SellFormRedesign.unitType", "Unit type")}
                          value={quantityUnit}
                          onChange={(e) =>
                            setQuantityUnit(e.target.value as "unit" | "scu")
                          }
                        >
                          <MenuItem value="unit">
                            {t("SellFormRedesign.unitUnit", "Units")}
                          </MenuItem>
                          <MenuItem value="scu">
                            {t("SellFormRedesign.unitScu", "cSCU")}
                          </MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Collapse>

                  {/* Location — a simple freeform field per §6.3. */}
                  <TextField
                    fullWidth
                    label={t(
                      "SellFormRedesign.location",
                      "Location (optional)",
                    )}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    helperText={t(
                      "SellFormRedesign.locationHelp",
                      "Where the buyer can collect, e.g. Area18 or Everus Harbor.",
                    )}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t("SellFormRedesign.description", "Description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Optional: price by quality */}
            <QualityPricingCard
              byQuality={byQuality}
              setByQuality={setByQuality}
              qualityRows={qualityRows}
              setQualityRows={setQualityRows}
              quantityLabel={quantityLabel}
            />

            {/* Optional: sell as a bundle */}
            <BundleItemsCard
              asBundle={asBundle}
              setAsBundle={setAsBundle}
              bundleItems={bundleItems}
              setBundleItems={setBundleItems}
              bundleItemResults={bundleItemResults}
              setItemQuery={setItemQuery}
            />

            {(isCustom || asBundle) && (
              <Alert severity="info" variant="outlined">
                {t(
                  "SellFormRedesign.phase0Note",
                  "Custom items and bundles are visual previews in this phase and won't be saved yet.",
                )}
              </Alert>
            )}

            <Divider />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {t(
                    "SellFormRedesign.estimatedTotal",
                    "Estimated total value",
                  )}
                </Typography>
                <Typography variant="h6" sx={{ color: "primary.main" }}>
                  {fmt.price(estimatedTotal)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={!canSubmit || isCreating}
                onClick={handleSubmit}
              >
                {t("SellFormRedesign.postListing", "Post listing")}
              </Button>
            </Stack>
          </Stack>
        </Collapse>

        {sellableShops.length === 0 && (
          <Alert severity="warning" variant="outlined">
            {t(
              "SellFormRedesign.needShop",
              "You need a shop before you can sell. Create one from your profile first.",
            )}
          </Alert>
        )}
      </Stack>
    </Container>
  )
}
