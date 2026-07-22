import React, { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import AddRounded from "@mui/icons-material/AddRounded"
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded"
import { useNavigate, useParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { formatPrice } from "../../../../util/formatPrice"
import {
  useSearchGameItemsQuery,
  useGetMyShopsQuery,
  useCreateListingMutation,
  useGetListingDetailQuery,
} from "../../../../store/api/v2/market"
import type {
  GameItemSearchResult,
  StockLotInput,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { MARKET_PATHS } from "../../../../routes/paths"

/**
 * SellFormRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). ONE adaptive Sell form (§8.5): pick a
 * catalog item (or a custom, non-catalog item), then reveal only the fields that
 * item needs. Optional "price by quality" reveals an inline per-tier table;
 * optional "sell as a bundle" turns the listing into a multi-item set. Sale type
 * (fixed / auction / negotiable) is a toggle inside the form. The word "fungible"
 * never appears. Edit mode is the same form, pre-filled.
 *
 * Create submits to the real `useCreateListingMutation`. Per-quality/bundle
 * shapes that the current create payload can't fully express are noted inline.
 */

interface QualityRow {
  id: string
  tier: number
  price: string
  quantity: string
}

interface BundleItem {
  id: string
  item: GameItemSearchResult | null
}

let rowSeq = 0
const nextId = () => `row-${rowSeq++}`

export function SellFormRedesign() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const issueAlert = useAlertHook()
  const params = useParams()

  // Edit mode: /market_edit/:id or /market/multiple/:id/edit carry an id.
  const editId = params.id
  const isEdit = !!editId
  const { data: editData } = useGetListingDetailQuery(
    { id: editId! },
    { skip: !editId },
  )

  const { data: shops } = useGetMyShopsQuery()
  const sellableShops = useMemo(
    () => (shops ?? []).filter((s) => s.permissions?.manage_market !== false),
    [shops],
  )

  const [createListing, { isLoading: isCreating }] = useCreateListingMutation()

  // ---- Form state ----
  const [shopId, setShopId] = useState<string>("")
  const [isCustom, setIsCustom] = useState(false)
  const [itemQuery, setItemQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<GameItemSearchResult | null>(null)
  const [customName, setCustomName] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [location, setLocation] = useState("")
  const [quantityUnit, setQuantityUnit] = useState<"unit" | "scu">("unit")
  const [saleType, setSaleType] = useState<"fixed" | "auction" | "negotiable">("fixed")

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

  // Prefill in edit mode.
  useEffect(() => {
    if (!editData) return
    const l = editData.listing
    setShopId(l.shop_id)
    setTitle(l.title)
    setDescription(l.description ?? "")
    setQuantityUnit(l.quantity_unit ?? "unit")
    setSaleType(l.sale_type ?? "fixed")
    const first = editData.items[0]
    if (first) {
      setSelectedItem({
        id: first.game_item.id,
        name: first.game_item.name,
        type: first.game_item.type,
      })
      const variants = first.variants ?? []
      const totalQty = variants.reduce((s, v) => s + v.quantity, 0)
      setQuantity(String(totalQty || 1))
      setPrice(String(first.base_price ?? variants[0]?.price ?? ""))
      if (variants.length > 1) {
        setByQuality(true)
        setQualityRows(
          variants.map((v) => ({
            id: nextId(),
            tier: v.attributes.quality_tier ?? 3,
            price: String(v.price),
            quantity: String(v.quantity),
          })),
        )
      }
    }
    if (editData.items.length > 1) {
      setAsBundle(true)
      setBundleItems(
        editData.items.map((it) => ({
          id: nextId(),
          item: {
            id: it.game_item.id,
            name: it.game_item.name,
            type: it.game_item.type,
          },
        })),
      )
    }
  }, [editData])

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
    !!shopId && itemChosen && title.trim().length > 0 && (byQuality || Number(price) > 0)

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
          "Custom items and bundles are previewed only in this phase — not yet saved.",
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

    try {
      await createListing({
        createListingRequest: {
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
        },
      }).unwrap()
      issueAlert({
        message: t("SellFormRedesign.created", "Listing created."),
        severity: "success",
      })
      navigate(MARKET_PATHS.myListings)
    } catch (e) {
      issueAlert(e as never)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Helmet>
        <title>
          {isEdit
            ? t("SellFormRedesign.editTitle", "Edit listing")
            : t("SellFormRedesign.title", "Sell an item")}
        </title>
      </Helmet>

      <Typography variant="h4" sx={{ color: "text.secondary", mb: 0.5 }}>
        {isEdit
          ? t("SellFormRedesign.editHeading", "Edit listing")
          : t("SellFormRedesign.heading", "Sell an item")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary", mb: 3 }}>
        {t(
          "SellFormRedesign.subheading",
          "Pick what you're selling — the form shows only the fields it needs.",
        )}
      </Typography>

      <Stack spacing={2.5}>
        {/* Shop / storefront */}
        <Card>
          <CardContent>
            <Typography variant="overline" sx={{ color: "text.primary" }}>
              {t("SellFormRedesign.storefront", "Storefront")}
            </Typography>
            <TextField
              select
              fullWidth
              label={t("SellFormRedesign.sellThrough", "Sell through")}
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              sx={{ mt: 1 }}
              helperText={t(
                "SellFormRedesign.sellThroughHelp",
                "Your personal store or an org shop you help manage.",
              )}
            >
              {sellableShops.length === 0 && (
                <MenuItem value="" disabled>
                  {t("SellFormRedesign.noShops", "No shops available")}
                </MenuItem>
              )}
              {sellableShops.map((s) => (
                <MenuItem key={s.shop_id} value={s.shop_id}>
                  {s.name}
                  {s.is_org_owned ? ` (${t("SellFormRedesign.org", "org")})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {/* Step 1: pick the item */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" sx={{ color: "text.primary" }}>
                {t("SellFormRedesign.whatSelling", "What are you selling?")}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isCustom}
                    onChange={(e) => {
                      setIsCustom(e.target.checked)
                      setSelectedItem(null)
                    }}
                  />
                }
                label={t("SellFormRedesign.customItem", "Custom item (not in catalog)")}
              />
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              {isCustom ? (
                <TextField
                  fullWidth
                  label={t("SellFormRedesign.customNameLabel", "Item name")}
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    if (!title) setTitle(e.target.value)
                  }}
                />
              ) : (
                <Autocomplete
                  options={itemResults ?? []}
                  getOptionLabel={(o) => `${o.name} — ${o.type}`}
                  value={selectedItem}
                  onChange={(_, v) => {
                    setSelectedItem(v)
                    if (v && !title) setTitle(v.name)
                  }}
                  onInputChange={(_, v) => setItemQuery(v)}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label={t("SellFormRedesign.searchCatalog", "Search the catalog")}
                    />
                  )}
                />
              )}
            </Box>
          </CardContent>
        </Card>

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
                          label={t("SellFormRedesign.pricePerUnit", "Price per unit (aUEC)")}
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
                          onChange={(e) => setQuantityUnit(e.target.value as "unit" | "scu")}
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

                  {/* Location — freeform (SelectLocation is a fixed-shape section;
                      here we use a simple freeform field per §6.3). */}
                  <TextField
                    fullWidth
                    label={t("SellFormRedesign.location", "Location (optional)")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    helperText={t(
                      "SellFormRedesign.locationHelp",
                      "Where the buyer can collect — e.g. Area18, Everus Harbor.",
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
            <Card>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch checked={byQuality} onChange={(e) => setByQuality(e.target.checked)} />
                  }
                  label={t("SellFormRedesign.priceByQuality", "Price by quality")}
                />
                <Collapse in={byQuality} unmountOnExit>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {qualityRows.map((row) => (
                      <Grid container spacing={1.5} key={row.id} alignItems="center">
                        <Grid size={{ xs: 4, sm: 3 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label={t("SellFormRedesign.tier", "Tier")}
                            value={row.tier}
                            onChange={(e) =>
                              setQualityRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, tier: Number(e.target.value) } : r,
                                ),
                              )
                            }
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <MenuItem key={n} value={n}>
                                {t("SellFormRedesign.tierN", "Tier {{n}}", { n })}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 4, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={t("SellFormRedesign.price", "Price")}
                            value={row.price}
                            onChange={(e) =>
                              setQualityRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, price: e.target.value } : r,
                                ),
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 3, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={quantityLabel}
                            value={row.quantity}
                            onChange={(e) =>
                              setQualityRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, quantity: e.target.value } : r,
                                ),
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                          <IconButton
                            size="small"
                            disabled={qualityRows.length <= 1}
                            onClick={() =>
                              setQualityRows((rows) => rows.filter((r) => r.id !== row.id))
                            }
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Button
                      startIcon={<AddRounded />}
                      onClick={() =>
                        setQualityRows((rows) => [
                          ...rows,
                          { id: nextId(), tier: 3, price: "", quantity: "1" },
                        ])
                      }
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {t("SellFormRedesign.addTier", "Add tier")}
                    </Button>
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>

            {/* Optional: sell as a bundle */}
            <Card>
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch checked={asBundle} onChange={(e) => setAsBundle(e.target.checked)} />
                  }
                  label={t("SellFormRedesign.sellAsBundle", "Sell as a bundle (multiple items per set)")}
                />
                <Collapse in={asBundle} unmountOnExit>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "text.primary" }}>
                      {t(
                        "SellFormRedesign.bundleHelp",
                        "Each set includes all these items. Quantity above is the number of sets.",
                      )}
                    </Typography>
                    {bundleItems.map((bi) => (
                      <Stack direction="row" spacing={1} key={bi.id} alignItems="center">
                        <Autocomplete
                          fullWidth
                          size="small"
                          options={bundleItemResults ?? []}
                          getOptionLabel={(o) => `${o.name} — ${o.type}`}
                          value={bi.item}
                          onChange={(_, v) =>
                            setBundleItems((items) =>
                              items.map((it) => (it.id === bi.id ? { ...it, item: v } : it)),
                            )
                          }
                          onInputChange={(_, v) => setItemQuery(v)}
                          isOptionEqualToValue={(o, v) => o.id === v.id}
                          renderInput={(p) => (
                            <TextField
                              {...p}
                              label={t("SellFormRedesign.bundleItem", "Item in set")}
                            />
                          )}
                        />
                        <IconButton
                          size="small"
                          disabled={bundleItems.length <= 1}
                          onClick={() =>
                            setBundleItems((items) => items.filter((it) => it.id !== bi.id))
                          }
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button
                      startIcon={<AddRounded />}
                      onClick={() =>
                        setBundleItems((items) => [...items, { id: nextId(), item: null }])
                      }
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {t("SellFormRedesign.addBundleItem", "Add another item")}
                    </Button>
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>

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
                  {t("SellFormRedesign.estimatedTotal", "Estimated total value")}
                </Typography>
                <Typography variant="h6" sx={{ color: "primary.main" }}>
                  {formatPrice(estimatedTotal)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={!canSubmit || isCreating}
                onClick={handleSubmit}
              >
                {isEdit
                  ? t("SellFormRedesign.saveChanges", "Save changes")
                  : t("SellFormRedesign.postListing", "Post listing")}
              </Button>
            </Stack>

            {isEdit && (
              <Alert severity="info" variant="outlined">
                {t(
                  "SellFormRedesign.editNote",
                  "Quantity and stock lots are edited on the Manage Market page. This form edits listing details.",
                )}
              </Alert>
            )}
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
