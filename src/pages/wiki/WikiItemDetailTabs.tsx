import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TextField,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import CheckRounded from "@mui/icons-material/CheckRounded"
import {
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
  type BlueprintReference,
  type WikiItemDetail as WikiItemDetailData,
} from "../../store/api/v2/market"
import { PriceHistoryChartV2 } from "../../features/market/v2/components/PriceHistoryChartV2"
import { QualityDistributionChart } from "../../features/market/v2/components/QualityDistributionChart"
import {
  DISASSEMBLY_EFFICIENCY,
  DISASSEMBLY_TIME_SECONDS,
  formatCraftingTime,
} from "../../constants/crafting"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { TagChip } from "../../components/tags/TagChip"

/** Overview tab: item attributes, price history and quality distribution. */
export function ItemOverviewTab({
  item,
  gameItemId,
}: {
  item: WikiItemDetailData
  gameItemId: string
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Attributes */}
      {Object.keys(item.attributes).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("wiki.itemDetail.itemAttributes", "Item Attributes")}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ fontWeight: "bold" }}
                      >
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {typeof value === "object" && value !== null
                          ? Object.entries(
                              value as Record<string, unknown>,
                            ).map(([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k}: ${v}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  mr: 0.5,
                                  mb: 0.5,
                                  height: 20,
                                  fontSize: "0.65rem",
                                }}
                              />
                            ))
                          : String(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Price History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("wiki.itemDetail.priceHistory", "Price History")}
          </Typography>
          <PriceHistoryChartV2 gameItemId={gameItemId} />
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("wiki.itemDetail.qualityDistribution", "Quality Distribution")}
          </Typography>
          <QualityDistributionChart gameItemId={gameItemId} />
        </CardContent>
      </Card>
    </>
  )
}

/** Crafting tab: the blueprints that make this item, with owned toggles. */
export function ItemCraftingTab({ item }: { item: WikiItemDetailData }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("wiki.itemDetail.craftingRecipes", "Crafting Recipes")}
        </Typography>
        {item.craftable_from.map((bp) => (
          <Paper key={bp.blueprint_id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {bp.blueprint_name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                  {bp.rarity && (
                    <TagChip
                      tag="rarity"
                      rarity={bp.rarity}
                      label={bp.rarity}
                    />
                  )}
                  {bp.tier && (
                    <TagChip
                      tag="tier"
                      label={`${t("wiki.itemDetail.tier", "Tier")} ${bp.tier}`}
                    />
                  )}
                </Stack>
              </Box>
              {bp.crafting_time_seconds && (
                <Typography variant="body2" color="text.secondary">
                  {formatCraftingTime(bp.crafting_time_seconds)}{" "}
                  {t("wiki.itemDetail.perCraft", "per craft")}
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  navigate(
                    `${GAME_DATA_PATHS.craftingCalculator}?blueprint_id=${bp.blueprint_id}`,
                  )
                }
              >
                {t("wiki.itemDetail.openInCalculator", "Open in Calculator")}
              </Button>
              <Button
                size="small"
                sx={{ ml: 1 }}
                onClick={() =>
                  navigate(
                    GAME_DATA_PATHS.blueprint(
                      bp.blueprint_name || bp.blueprint_id,
                    ),
                  )
                }
              >
                {t("wiki.itemDetail.viewBlueprint", "View Blueprint")}
              </Button>
              <Button
                size="small"
                variant={
                  (
                    bp as BlueprintReference & {
                      user_owns?: boolean
                    }
                  ).user_owns
                    ? "contained"
                    : "outlined"
                }
                startIcon={
                  (
                    bp as BlueprintReference & {
                      user_owns?: boolean
                    }
                  ).user_owns ? (
                    <CheckRounded />
                  ) : undefined
                }
                sx={{ ml: 1 }}
                onClick={() => {
                  if (
                    (
                      bp as BlueprintReference & {
                        user_owns?: boolean
                      }
                    ).user_owns
                  ) {
                    removeFromInventory({
                      blueprintId: bp.blueprint_id,
                    }).catch(() => {})
                  } else {
                    addToInventory({
                      blueprintId: bp.blueprint_id,
                      body: {},
                    }).catch(() => {})
                  }
                }}
              >
                {(bp as BlueprintReference & { user_owns?: boolean }).user_owns
                  ? t("wiki.itemDetail.owned", "Owned")
                  : t("wiki.itemDetail.markOwned", "Mark Owned")}
              </Button>
            </Box>
          </Paper>
        ))}
        {item.craftable_from.length === 0 && (
          <Typography color="text.secondary">
            {t(
              "wiki.itemDetail.cannotBeCrafted",
              "This item cannot be crafted.",
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

/** Disassembly tab: what disassembling a quantity of this item returns. */
export function ItemDisassemblyTab({
  item,
  disassemblyQty,
  setDisassemblyQty,
}: {
  item: WikiItemDetailData
  disassemblyQty: number
  setDisassemblyQty: (qty: number) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("wiki.itemDetail.disassemblyCalculator", "Disassembly Calculator")}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            type="number"
            label={t(
              "wiki.itemDetail.quantityToDisassemble",
              "Quantity to disassemble",
            )}
            value={disassemblyQty}
            onChange={(e) =>
              setDisassemblyQty(Math.max(1, +e.target.value || 1))
            }
            inputProps={{ min: 1 }}
            sx={{ width: 200 }}
          />
          <Chip
            label={`${formatCraftingTime(DISASSEMBLY_TIME_SECONDS * disassemblyQty)} ${t("wiki.itemDetail.total", "total")}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${Math.round(DISASSEMBLY_EFFICIENCY * 100)}% ${t("wiki.itemDetail.recovery", "recovery")}`}
            variant="outlined"
          />
          <Chip
            label={`${DISASSEMBLY_TIME_SECONDS}s ${t("wiki.itemDetail.perItem", "per item")}`}
            variant="outlined"
          />
        </Stack>

        {item.craftable_from.length > 0 ? (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t(
                "wiki.itemDetail.disassemblyInfo",
                "Disassembly returns {{efficiency}}% of crafting components at {{seconds}} seconds per item. Rare materials (Quantanium, Stileron, Savrilium, Lindinium, Riccite, Ouratite, Saldynium, Janalite) cannot be recovered.",
                {
                  efficiency: Math.round(DISASSEMBLY_EFFICIENCY * 100),
                  seconds: DISASSEMBLY_TIME_SECONDS,
                },
              )}
            </Alert>

            {item.craftable_from.map((bp) => (
              <Box key={bp.blueprint_id} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("wiki.itemDetail.from", "From")}: {bp.blueprint_name}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t("wiki.itemDetail.columnComponent", "Component")}
                        </TableCell>
                        <TableCell align="right">
                          {t("wiki.itemDetail.columnRecipeQty", "Recipe Qty")}
                        </TableCell>
                        <TableCell align="right">
                          {t(
                            "wiki.itemDetail.columnRecoveredPerItem",
                            "Recovered per Item",
                          )}{" "}
                          ({Math.round(DISASSEMBLY_EFFICIENCY * 100)}
                          %)
                        </TableCell>
                        <TableCell align="right">
                          {t("wiki.itemDetail.columnTotal", "Total")} (
                          {disassemblyQty}×)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Blueprint ingredients would go here — need detail query */}
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Button
                            size="small"
                            onClick={() =>
                              navigate(
                                GAME_DATA_PATHS.blueprint(
                                  bp.blueprint_name || bp.blueprint_id,
                                ),
                              )
                            }
                          >
                            {t(
                              "wiki.itemDetail.viewBlueprintFullList",
                              "View blueprint for full ingredient list",
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </>
        ) : (
          <Alert severity="warning">
            {t(
              "wiki.itemDetail.noRecipeWarning",
              "No crafting recipe found for this item, so its disassembly components are unknown.",
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
