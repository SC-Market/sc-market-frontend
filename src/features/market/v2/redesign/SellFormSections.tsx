import React from "react"
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { LabeledSwitch } from "../../../../components/buttons/LabeledSwitch"
import Grid from "@mui/material/Grid2"
import AddRounded from "@mui/icons-material/AddRounded"
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded"
import { useTranslation } from "react-i18next"
import type { GameItemSearchResult } from "../../../../store/api/v2/market"
import type { ShopResponse } from "../../../../store/api/v2/market"

export interface QualityRow {
  id: string
  tier: number
  price: string
  quantity: string
}

export interface BundleItem {
  id: string
  item: GameItemSearchResult | null
}

let rowSeq = 0
export const nextId = () => `row-${rowSeq++}`

/** The shop (personal store or org shop) the listing goes in. */
export function StorefrontCard({
  shopId,
  setShopId,
  sellableShops,
}: {
  shopId: string
  setShopId: (id: string) => void
  sellableShops: ShopResponse[]
}) {
  const { t } = useTranslation()
  return (
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
  )
}

/** Step 1: a catalog item, or a custom item that isn't in the catalog. */
export function ItemPickerCard({
  isCustom,
  setIsCustom,
  selectedItem,
  setSelectedItem,
  customName,
  setCustomName,
  title,
  setTitle,
  itemResults,
  setItemQuery,
}: {
  isCustom: boolean
  setIsCustom: (custom: boolean) => void
  selectedItem: GameItemSearchResult | null
  setSelectedItem: (item: GameItemSearchResult | null) => void
  customName: string
  setCustomName: (name: string) => void
  title: string
  setTitle: (title: string) => void
  itemResults: GameItemSearchResult[] | undefined
  setItemQuery: (query: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="overline" sx={{ color: "text.primary" }}>
            {t("SellFormRedesign.whatSelling", "What are you selling?")}
          </Typography>
          <LabeledSwitch
            checked={isCustom}
            onChange={(checked) => {
              setIsCustom(checked)
              setSelectedItem(null)
            }}
            label={t(
              "SellFormRedesign.customItem",
              "Custom item (not in catalog)",
            )}
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
                  label={t(
                    "SellFormRedesign.searchCatalog",
                    "Search the catalog",
                  )}
                />
              )}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

/** Optional per-quality-tier price and quantity rows. */
export function QualityPricingCard({
  byQuality,
  setByQuality,
  qualityRows,
  setQualityRows,
  quantityLabel,
}: {
  byQuality: boolean
  setByQuality: (on: boolean) => void
  qualityRows: QualityRow[]
  setQualityRows: React.Dispatch<React.SetStateAction<QualityRow[]>>
  quantityLabel: string
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent>
        <LabeledSwitch
          checked={byQuality}
          onChange={setByQuality}
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
                          r.id === row.id
                            ? { ...r, tier: Number(e.target.value) }
                            : r,
                        ),
                      )
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <MenuItem key={n} value={n}>
                        {t("SellFormRedesign.tierN", "Tier {{n}}", {
                          n,
                        })}
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
                          r.id === row.id
                            ? { ...r, quantity: e.target.value }
                            : r,
                        ),
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton
                    size="small"
                    disabled={qualityRows.length <= 1}
                    aria-label={t(
                      "SellFormRedesign.removeQualityRow",
                      "Remove quality row",
                    )}
                    onClick={() =>
                      setQualityRows((rows) =>
                        rows.filter((r) => r.id !== row.id),
                      )
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
  )
}

/** Optional bundle: several catalog items sold together as one set. */
export function BundleItemsCard({
  asBundle,
  setAsBundle,
  bundleItems,
  setBundleItems,
  bundleItemResults,
  setItemQuery,
}: {
  asBundle: boolean
  setAsBundle: (on: boolean) => void
  bundleItems: BundleItem[]
  setBundleItems: React.Dispatch<React.SetStateAction<BundleItem[]>>
  bundleItemResults: GameItemSearchResult[] | undefined
  setItemQuery: (query: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent>
        <LabeledSwitch
          checked={asBundle}
          onChange={setAsBundle}
          label={t(
            "SellFormRedesign.sellAsBundle",
            "Sell as a bundle (multiple items per set)",
          )}
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
              <Stack
                direction="row"
                spacing={1}
                key={bi.id}
                alignItems="center"
              >
                <Autocomplete
                  fullWidth
                  size="small"
                  options={bundleItemResults ?? []}
                  getOptionLabel={(o) => `${o.name} — ${o.type}`}
                  value={bi.item}
                  onChange={(_, v) =>
                    setBundleItems((items) =>
                      items.map((it) =>
                        it.id === bi.id ? { ...it, item: v } : it,
                      ),
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
                  aria-label={t(
                    "SellFormRedesign.removeBundleItem",
                    "Remove bundle item",
                  )}
                  onClick={() =>
                    setBundleItems((items) =>
                      items.filter((it) => it.id !== bi.id),
                    )
                  }
                >
                  <DeleteOutlineRounded fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddRounded />}
              onClick={() =>
                setBundleItems((items) => [
                  ...items,
                  { id: nextId(), item: null },
                ])
              }
              sx={{ alignSelf: "flex-start" }}
            >
              {t("SellFormRedesign.addBundleItem", "Add another item")}
            </Button>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  )
}
