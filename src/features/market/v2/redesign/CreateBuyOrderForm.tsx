import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import Grid2 from "@mui/material/Grid2"
import { useTranslation } from "react-i18next"
import { useSearchGameItemsQuery } from "../../../../store/api/v2/market"
import type {
  GameItemSearchResult,
  BuyOrderVisibility,
} from "../../../../store/api/v2/market"
import { useCreateBuyOrder } from "../../hooks/useBuyOrderActions"

export function CreateBuyOrderForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()

  const [itemQuery, setItemQuery] = useState("")
  const [item, setItem] = useState<GameItemSearchResult | null>(null)
  const [maxPrice, setMaxPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [minTier, setMinTier] = useState(1)
  const [visibility, setVisibility] = useState<BuyOrderVisibility>("public")
  const [negotiable, setNegotiable] = useState(false)

  const { data: itemResults } = useSearchGameItemsQuery({
    query: itemQuery || undefined,
    limit: 25,
  })
  const { create: createBuyOrder, isLoading } = useCreateBuyOrder(
    t("BuyOrdersRedesign.posted", "Buy order posted."),
  )

  const canSubmit = !!item && Number(maxPrice) > 0 && Number(quantity) > 0

  const handleSubmit = async () => {
    if (!item) return
    const created = await createBuyOrder({
      game_item_id: item.id,
      quantity: Number(quantity),
      price_per_unit: Number(maxPrice),
      quality_tier_min: minTier,
      negotiable,
      visibility,
    })
    if (created) onDone()
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" sx={{ color: "text.primary" }}>
          {t("BuyOrdersRedesign.newBuyOrder", "New buy order")}
        </Typography>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              select={false}
              fullWidth
              label={t("BuyOrdersRedesign.itemSearch", "Item")}
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              helperText={
                item
                  ? t("BuyOrdersRedesign.selected", "Selected: {{name}}", {
                      name: item.name,
                    })
                  : t(
                      "BuyOrdersRedesign.typeToSearch",
                      "Type to search the catalog",
                    )
              }
            />
            {!item &&
              (itemResults?.length ?? 0) > 0 &&
              itemQuery.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    maxHeight: 180,
                    overflowY: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  {(itemResults ?? []).map((r) => (
                    <MenuItem
                      key={r.id}
                      onClick={() => {
                        setItem(r)
                        setItemQuery(r.name)
                      }}
                    >
                      {r.name} — {r.type}
                    </MenuItem>
                  ))}
                </Box>
              )}
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.maxPriceLabel", "Max price / unit")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.quantityLabel", "Quantity")}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.minQualityLabel", "Min quality tier")}
              value={minTier}
              onChange={(e) => setMinTier(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {t("BuyOrdersRedesign.tierN", "Tier {{n}}", { n })}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.visibilityLabel", "Visibility")}
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as BuyOrderVisibility)
              }
            >
              <MenuItem value="public">
                {t("BuyOrdersRedesign.public", "Public")}
              </MenuItem>
              <MenuItem value="roster_only">
                {t("BuyOrdersRedesign.rosterOnly", "Roster only")}
              </MenuItem>
              <MenuItem value="private">
                {t("BuyOrdersRedesign.targeted", "Targeted")}
              </MenuItem>
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t(
                "BuyOrdersRedesign.negotiableLabel",
                "Accept counter-offers?",
              )}
              value={negotiable ? "yes" : "no"}
              onChange={(e) => setNegotiable(e.target.value === "yes")}
            >
              <MenuItem value="no">{t("BuyOrdersRedesign.no", "No")}</MenuItem>
              <MenuItem value="yes">
                {t("BuyOrdersRedesign.yes", "Yes")}
              </MenuItem>
            </TextField>
          </Grid2>
        </Grid2>

        {visibility === "private" && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            {t(
              "BuyOrdersRedesign.targetedNote",
              "Targeted orders need a specific supplier. Pick one from the supplier roster (coming soon).",
            )}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={onDone}>
            {t("BuyOrdersRedesign.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canSubmit || isLoading}
            onClick={handleSubmit}
          >
            {t("BuyOrdersRedesign.post", "Post buy order")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
